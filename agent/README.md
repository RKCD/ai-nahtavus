# Agendikiht (tasand 4) · prototüüp

Omaniku kinnitatud ettevõtteprofiilid, mida AI-agent saab lugeda, ja MCP-server, mille kaudu agent saab:

1. `find_providers` – leida teenuse ja piirkonna järgi pakkuja (hinnavahemik, vabad ajaaknad, kinnitamise kuupäev);
2. `get_profile` – lugeda kogu profiili (teenused, seadmed, välistused, piirkond, reeglid);
3. `draft_quote_request` – koostada hinnapäringu **mustandi**. Server ei saada, broneeri ega kinnita midagi. Klient vaatab üle ja saadab, ettevõtte inimene kinnitab aja ja hinna.

**Praegu on ainult demoandmed** (`profiilid/naidiskute.json`, väljamõeldud ettevõte).

## Proovi

```bash
node agent/mcp/test.mjs
```

Claude Desktopis (`claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "ai-nahtavus": { "command": "node", "args": ["/TEE/ai-nahtavus/agent/mcp/server.mjs"] }
  }
}
```

Küsi: „Mul on Elvas õhk-vesi soojuspump, mis ei küta. Leia keegi ja koosta hinnapäring."

Avaldatud profiilide kasutamiseks: `AI_NAHTAVUS_MANIFEST=https://rkcd.github.io/ai-nahtavus/agent.json`.

## Failid

- `../agent.json` – manifest: profiilid, tööriistad, reeglid (agent tohib / ei tohi).
- `profiilid/*.json` – profiilid formaadis `ai-nahtavus/profile/0.1`.
- `mcp/server.mjs` – MCP-server (stdio, JSON-RPC 2.0, sõltuvusteta, Node 18+).
- `mcp/test.mjs` – suitsutest.

## Järgmine samm

Kaug-MCP (HTTP) näiteks Cloudflare Workersis, et agendid saaksid ühenduda ilma kohaliku paigalduseta. Päris profiilid ainult omaniku kirjaliku kinnitusega.
