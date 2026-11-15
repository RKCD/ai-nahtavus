// Smoke test: talks to server.mjs over stdio exactly like an MCP client. Run: node agent/mcp/test.mjs
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import assert from "node:assert/strict";

const srv = spawn(process.execPath, [join(dirname(fileURLToPath(import.meta.url)), "server.mjs")]);
let buf = ""; const waiting = new Map(); let n = 0;
srv.stdout.on("data", (d) => { buf += d; let i; while ((i = buf.indexOf("\n")) >= 0) { const m = JSON.parse(buf.slice(0, i)); buf = buf.slice(i + 1); waiting.get(m.id)?.(m); } });
const rpc = (method, params) => new Promise((res) => { const id = ++n; waiting.set(id, res); srv.stdin.write(JSON.stringify({ jsonrpc: "2.0", id, method, params }) + "\n"); });
const call = async (name, args) => (await rpc("tools/call", { name, arguments: args })).result;

const init = await rpc("initialize", { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "test", version: "0" } });
assert.equal(init.result.serverInfo.name, "ai-nahtavus");
srv.stdin.write(JSON.stringify({ jsonrpc: "2.0", method: "notifications/initialized" }) + "\n");
const list = await rpc("tools/list", {});
assert.deepEqual(list.result.tools.map((t) => t.name), ["find_providers", "get_profile", "draft_quote_request"]);

const found = (await call("find_providers", { service: "soojuspump ei küta", area: "Elva" })).structuredContent;
assert.equal(found.results.length, 1); assert.equal(found.results[0].service_id, "soojuspumba-hooldus");
const none = (await call("find_providers", { service: "soojuspump", area: "Pärnu" })).structuredContent;
assert.equal(none.results.length, 0, "Pärnu is not served");
const en = (await call("find_providers", { service: "boiler", area: "Tartu", lang: "en" })).structuredContent;
assert.equal(en.results[0].service, "Boiler maintenance");

const partial = (await call("draft_quote_request", { provider_id: "naidiskute", service_id: "soojuspumba-hooldus", area: "Elva" })).structuredContent;
assert.equal(partial.status, "incomplete_draft"); assert.ok(partial.missing_fields.includes("problem"));
const full = (await call("draft_quote_request", { provider_id: "naidiskute", service_id: "soojuspumba-hooldus", area: "Elva vald", equipment: "õhk-vesi soojuspump", problem: "ei küta, veakood E3", preferred_time: "2026-11-19 hommikul", customer_contact: "klient@example.invalid" })).structuredContent;
assert.equal(full.status, "draft_awaiting_customer_review"); assert.equal(full.human_confirmation_required, true); assert.ok(full.mailto.startsWith("mailto:"));
const bad = await call("get_profile", { provider_id: "puudub" });
assert.equal(bad.isError, true);

console.log("MCP smoke test: 9 checks passed");
console.log("\nExample draft:\n" + full.body);
srv.kill();
