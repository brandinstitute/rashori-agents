# Rashori MCP Server

Connect any MCP-compatible AI (Claude Desktop, Cursor, ChatGPT) to Rashori.

The AI can then create ideas, find investors, and watch projects on your behalf.

---

## Quick start — Claude Desktop (stdio)

**1. Install dependencies:**
```bash
cd mcp-server
npm install
```

**2. Add to Claude Desktop config:**

Windows: `%APPDATA%\Claude\claude_desktop_config.json`
macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "rashori": {
      "command": "node",
      "args": ["C:/path/to/rashori-agents/mcp-server/index.js"],
      "env": {
        "RASHORI_BOT_TOKEN": "your-64-char-bot-token-here",
        "RASHORI_USER_ID": "79"
      }
    }
  }
}
```

**3. Restart Claude Desktop. You'll see Rashori tools in the toolbar.**

---

## Getting your bot token

1. Register a bot: `POST https://www.rashori.com/api/bots/register`
2. Save the returned `bot_token` (shown once only)
3. Wait for admin approval (or use immediately — actions are queued until approved)
4. Pair with your user account in the Rashori mobile app: **Menu → My AI Bots → Enter pairing code**
5. Set `RASHORI_USER_ID` to your Rashori user ID

### If user is not registered yet — Email Claim Mode

Skip `RASHORI_USER_ID`. Pass `email` in tool calls instead.
Items are automatically assigned when the user registers with that email.

---

## Hosted MCP server (for multi-user deployments)

Run the HTTP server:
```bash
PORT=3000 node http-server.js
```

Connect from MCP client:
```
POST https://mcp.rashori.com/mcp
Authorization: Bearer YOUR_BOT_TOKEN
X-User-Id: 79
```

---

## Available tools

| Tool | Description |
|------|-------------|
| `search_ideas` | Browse public ideas (no auth needed) |
| `bot_status` | Check bot connection |
| `list_linked_users` | See all paired users |
| `create_business` | Create a business profile |
| `create_idea` | Submit an idea draft |
| `update_idea` | Edit an existing idea |
| `list_my_ideas` | List ideas for a user |
| `find_investor_matches` | Find investors for an idea |
| `start_fundraising_round` | Start a fundraising round |
| `watch_idea` | Watch an idea (investor side) |
| `unwatch_idea` | Stop watching |
| `list_watched_ideas` | List all active watches |

---

## Example conversations

**Founder:**
> "I have an idea for an AI procurement tool. Submit it to Rashori for me."

Claude will call `create_business` then `create_idea` with the details you describe.

**Investor:**
> "Find me technology ideas in Europe and watch the top 3 for me."

Claude will call `search_ideas` then `watch_idea` for each result.

---

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `RASHORI_BOT_TOKEN` | Yes | 64-char bot token from registration |
| `RASHORI_USER_ID` | Recommended | Rashori user ID to act on behalf of |
| `RASHORI_BASE_URL` | No | Override API base (default: https://www.rashori.com/api) |
