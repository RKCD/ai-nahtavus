#!/usr/bin/env node
// AI-nähtavus agent layer: a minimal MCP server (stdio, JSON-RPC 2.0, no dependencies).
// Lets an AI agent find a local technical service provider, read its owner-verified profile
// and DRAFT a quote request. It never sends, books or confirms anything: a person does.
//
// Run:     node agent/mcp/server.mjs
// Profiles: agent/profiilid/*.json (local). Set AI_NAHTAVUS_MANIFEST=<url to agent.json> to load published profiles instead.

import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createInterface } from "node:readline";

const HERE = dirname(fileURLToPath(import.meta.url));
const PROFILE_DIR = join(HERE, "..", "profiilid");
const SERVER = { name: "ai-nahtavus", version: "0.1.0" };

async function loadProfiles() {
  const manifest = process.env.AI_NAHTAVUS_MANIFEST;
  if (manifest) {
    const m = await (await fetch(manifest)).json();
    return Promise.all(m.profiles.map(async (p) => (await fetch(p.url)).json()));
  }
  return readdirSync(PROFILE_DIR).filter((f) => f.endsWith(".json"))
    .map((f) => JSON.parse(readFileSync(join(PROFILE_DIR, f), "utf8")));
}

const norm = (s) => String(s || "").toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "").trim();
const t = (v, lang) => (v && typeof v === "object" ? v[lang] || v.et || v.en : v);

function matchService(service, query) {
  const q = norm(query);
  if (!q) return true;
  const hay = [service.id, service.name?.et, service.name?.en, ...(service.keywords || []), ...(service.equipment || [])].map(norm);
  return q.split(/\s+/).some((w) => w.length > 2 && hay.some((h) => h.includes(w)));
}
const matchArea = (profile, area) => !area || profile.area.some((a) => norm(a).includes(norm(area).replace(/ (linn|vald|maakond)$/, "")) || norm(area).includes(norm(a).split(" ")[0]));

const TOOLS = [
  {
    name: "find_providers",
    description: "Find local technical service providers in Estonia (heating, boilers, heat pumps, ventilation, electrical, maintenance) by service and area. Returns owner-verified data: price range, next open time windows, verification date. Open time windows are not bookings.",
    inputSchema: {
      type: "object",
      properties: {
        service: { type: "string", description: "What the customer needs, e.g. 'heat pump fault' or 'katlahooldus'" },
        area: { type: "string", description: "Town or municipality in Estonia, e.g. 'Elva'" },
        lang: { type: "string", enum: ["et", "en"], default: "et" }
      },
      required: ["service"]
    }
  },
  {
    name: "get_profile",
    description: "Get the full owner-verified profile of one provider: services, equipment, exclusions, area, hours, open time windows, quote request rules and limits.",
    inputSchema: { type: "object", properties: { provider_id: { type: "string" } }, required: ["provider_id"] }
  },
  {
    name: "draft_quote_request",
    description: "Draft a quote request to a provider. Returns a DRAFT for the customer to review and send. Does not send anything. The provider confirms time and price.",
    inputSchema: {
      type: "object",
      properties: {
        provider_id: { type: "string" },
        service_id: { type: "string" },
        area: { type: "string" },
        equipment: { type: "string" },
        problem: { type: "string" },
        preferred_time: { type: "string" },
        customer_contact: { type: "string" },
        lang: { type: "string", enum: ["et", "en"], default: "et" }
      },
      required: ["provider_id", "service_id"]
    }
  }
];

async function callTool(name, args = {}) {
  const profiles = await loadProfiles();
  const lang = args.lang === "en" ? "en" : "et";

  if (name === "find_providers") {
    const results = [];
    for (const p of profiles) {
      if (!matchArea(p, args.area)) continue;
      for (const s of p.services.filter((s) => matchService(s, args.service))) {
        results.push({
          provider_id: p.id, provider: p.name, demo: !!p.demo, service_id: s.id, service: t(s.name, lang),
          area: p.area, price_range: s.price_range && { ...s.price_range, note: t(s.price_range.note, lang) },
          excludes: (s.excludes || []).map((x) => t(x, lang)),
          next_open_windows: (p.availability?.windows || []).slice(0, 3),
          availability_note: t(p.availability?.note, lang),
          verified: p.verified
        });
      }
    }
    return { results, rule: lang === "en" ? "Open windows are not bookings. A person confirms time and price." : "Ajaaknad ei ole broneeringud. Aja ja hinna kinnitab inimene." };
  }

  const p = profiles.find((x) => x.id === args.provider_id);
  if (!p) throw new Error(`Unknown provider_id: ${args.provider_id}`);

  if (name === "get_profile") return p;

  if (name === "draft_quote_request") {
    const s = p.services.find((x) => x.id === args.service_id);
    if (!s) throw new Error(`Unknown service_id for ${p.id}: ${args.service_id}`);
    const fields = { service_id: s.id, area: args.area, equipment: args.equipment, problem: args.problem, preferred_time: args.preferred_time, customer_contact: args.customer_contact };
    const missing = p.quote_request.required.filter((k) => !fields[k]);
    const L = lang === "en"
      ? { subj: `Quote request: ${t(s.name, "en")}`, lines: ["Service", "Area", "Equipment", "Problem", "Preferred time", "Customer contact"], foot: "Drafted by an AI agent on the customer's behalf. Not sent. The customer reviews and sends it; the company confirms time and price." }
      : { subj: `Hinnapäring: ${t(s.name, "et")}`, lines: ["Teenus", "Piirkond", "Seade", "Probleem", "Soovitud aeg", "Kliendi kontakt"], foot: "Koostas AI-agent kliendi nimel. Ei ole saadetud. Klient vaatab üle ja saadab ise, ettevõte kinnitab aja ja hinna." };
    const vals = [t(s.name, lang), args.area, args.equipment, args.problem, args.preferred_time, args.customer_contact];
    const body = L.lines.map((l, i) => `${l}: ${vals[i] || "-"}`).join("\n") + "\n\n" + L.foot;
    return {
      status: missing.length ? "incomplete_draft" : "draft_awaiting_customer_review",
      missing_fields: missing,
      demo: !!p.demo,
      to: p.quote_request.to, subject: L.subj, body,
      mailto: `mailto:${p.quote_request.to}?subject=${encodeURIComponent(L.subj)}&body=${encodeURIComponent(body)}`,
      provider_response_time_hours: p.quote_request.response_time_hours,
      human_confirmation_required: true
    };
  }
  throw new Error(`Unknown tool: ${name}`);
}

// ---- JSON-RPC over stdio (newline-delimited) ----
const send = (msg) => process.stdout.write(JSON.stringify({ jsonrpc: "2.0", ...msg }) + "\n");
const rl = createInterface({ input: process.stdin });
rl.on("line", async (line) => {
  if (!line.trim()) return;
  let req;
  try { req = JSON.parse(line); } catch { return send({ id: null, error: { code: -32700, message: "Parse error" } }); }
  const { id, method, params } = req;
  if (id === undefined) return; // notification (e.g. notifications/initialized)
  try {
    if (method === "initialize") {
      return send({ id, result: { protocolVersion: params?.protocolVersion || "2025-06-18", capabilities: { tools: {} }, serverInfo: SERVER,
        instructions: "Owner-verified local service profiles in Estonia. Draft quote requests only; never claim a booking or price is confirmed." } });
    }
    if (method === "ping") return send({ id, result: {} });
    if (method === "tools/list") return send({ id, result: { tools: TOOLS } });
    if (method === "tools/call") {
      try {
        const out = await callTool(params.name, params.arguments);
        return send({ id, result: { content: [{ type: "text", text: JSON.stringify(out, null, 2) }], structuredContent: out } });
      } catch (e) {
        return send({ id, result: { content: [{ type: "text", text: String(e.message) }], isError: true } });
      }
    }
    send({ id, error: { code: -32601, message: `Method not found: ${method}` } });
  } catch (e) {
    send({ id, error: { code: -32603, message: String(e.message) } });
  }
});
