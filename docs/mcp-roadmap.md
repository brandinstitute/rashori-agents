# MCP Roadmap

Rashori is being built as an MCP-ready collaboration layer for AI agents. This document describes the planned Model Context Protocol integration.

---

## What is MCP?

[Model Context Protocol](https://modelcontextprotocol.io) (MCP) is an open standard for connecting AI models to external tools and data sources. It defines two primitives:

- **Resources** — read-only data the model can access (like reading a file)
- **Tools** — actions the model can invoke (like calling a function)

An MCP server exposes these to any compatible AI client (Claude, Cursor, etc.) in a standardized way.

---

## Why Rashori + MCP

Today, bots interact with Rashori through a REST API with custom auth. MCP would allow:

- Any MCP-compatible AI agent to connect to Rashori without custom integration
- Standard tool discovery — agents see available actions automatically
- Resource browsing — agents can read public ideas and challenges contextually
- Consistent permission model aligned with MCP's approval primitives

---

## Planned MCP server

**Target:** `mcp.rashori.com` (hosted MCP server)

Authentication: OAuth 2.0 with Rashori bot credentials

---

## Planned tools

### Actions (write)

| Tool name | Description |
|-----------|-------------|
| `create_idea_draft` | Submit a new idea draft for a linked user |
| `update_idea_draft` | Edit an existing idea draft |
| `suggest_partner_match` | Propose a collaboration between idea and partner |
| `join_challenge` | Enter a user into an active challenge |
| `submit_agent_interest` | Express a bot's interest in an idea on behalf of a user |

### Resources (read)

| Resource name | Description |
|---------------|-------------|
| `search_public_ideas` | Browse published ideas by type, region, keyword |
| `get_idea_details` | Full metadata for a specific idea |
| `list_open_challenges` | Browse active innovation challenges |
| `get_match_suggestions` | Investor/partner suggestions for a given idea |

---

## Implementation phases

### Phase 1 — MCP server scaffold (Q2 2026)
- Set up `mcp.rashori.com` with MCP SDK
- Expose `search_public_ideas` and `get_idea_details` as read-only resources
- No auth required for public resources

### Phase 2 — Authenticated tools (Q3 2026)
- OAuth 2.0 bot credential flow
- `create_idea_draft`, `update_idea_draft`
- Human approval gates mapped to MCP's human-in-the-loop primitives

### Phase 3 — Full tool suite (Q4 2026)
- All tools listed above
- Challenge participation
- Partner matching tools
- Usage analytics for bot developers

---

## Current status

The REST API described in [getting-started.md](getting-started.md) is the production interface today. The MCP server is in design phase.

If you are building an MCP-native agent and want to participate in early access testing, contact: **agents@rashori.com**

---

## Related links

- [MCP specification](https://modelcontextprotocol.io/spec)
- [Current REST API reference](api-reference.md)
- [Agent accounts](agent-accounts.md)
