/**
 * Rashori MCP Server — HTTP/SSE transport
 *
 * For hosted deployment at mcp.rashori.com
 * Each request carries the bot token via Authorization header.
 *
 * Usage:
 *   PORT=3000 node http-server.js
 *
 * MCP endpoint: POST /mcp  (StreamableHTTP)
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { createServer } from 'http';
import { z } from 'zod';
import * as R from './rashori-client.js';

const PORT = parseInt(process.env.PORT || '3000');

// One McpServer instance per request (stateless, token from header)
function createMcpServer(botToken, userId) {
  // Inject per-request credentials
  process.env.RASHORI_BOT_TOKEN = botToken;
  if (userId) process.env.RASHORI_USER_ID = String(userId);

  const server = new McpServer({
    name: 'rashori',
    version: '1.0.0',
  });

  server.tool('search_ideas', 'Search public ideas on Rashori',
    { type: z.string().optional(), region: z.string().optional(), keyword: z.string().optional(), page: z.number().optional().default(1) },
    async (p) => ({ content: [{ type: 'text', text: JSON.stringify(await R.searchIdeas(p), null, 2) }] })
  );

  server.tool('create_business', 'Create a business profile on Rashori',
    { business_name: z.string(), description: z.string().optional(), business_type: z.string().optional(),
      email: z.string().email().optional(), user_id: z.number().optional(), is_draft: z.number().optional().default(1) },
    async (p) => ({ content: [{ type: 'text', text: JSON.stringify(await R.createBusiness(p), null, 2) }] })
  );

  server.tool('create_idea', 'Submit a startup idea on Rashori',
    { name: z.string(), annotation: z.string(), description: z.string(),
      type_of_idea: z.string(), idea_development_description: z.string().optional(),
      amount_of_shares: z.number().optional().default(1000), price_per_unit: z.number().optional().default(10),
      currency: z.string().optional().default('EUR'), email: z.string().email().optional(),
      user_id: z.number().optional(), business_id: z.number().optional(), is_draft: z.number().optional().default(1) },
    async (p) => ({ content: [{ type: 'text', text: JSON.stringify(await R.createIdea(p), null, 2) }] })
  );

  server.tool('update_idea', 'Update an existing idea',
    { idea_id: z.number(), user_id: z.number().optional(), name: z.string().optional(),
      annotation: z.string().optional(), description: z.string().optional() },
    async (p) => ({ content: [{ type: 'text', text: JSON.stringify(await R.updateIdea(p), null, 2) }] })
  );

  server.tool('find_investor_matches', 'Find investors for an idea',
    { idea_id: z.number(), user_id: z.number().optional() },
    async (p) => ({ content: [{ type: 'text', text: JSON.stringify(await R.findMatches(p), null, 2) }] })
  );

  server.tool('watch_idea', 'Watch an idea for an investor user',
    { idea_id: z.number(), user_id: z.number().optional(), events: z.array(z.string()).optional() },
    async (p) => ({ content: [{ type: 'text', text: JSON.stringify(await R.watchIdea(p), null, 2) }] })
  );

  server.tool('bot_status', 'Check bot connection status',
    {},
    async () => ({ content: [{ type: 'text', text: JSON.stringify(await R.botStatus(), null, 2) }] })
  );

  return server;
}

const httpServer = createServer(async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-User-Id');

  if (req.method === 'OPTIONS') { res.writeHead(200); res.end(); return; }

  if (req.method === 'GET' && req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true, service: 'rashori-mcp', version: '1.0.0' }));
    return;
  }

  if (req.url === '/mcp') {
    const authHeader = req.headers['authorization'] || '';
    const botToken   = authHeader.replace('Bearer ', '').trim();
    const userId     = req.headers['x-user-id'] ? parseInt(req.headers['x-user-id']) : null;

    if (!botToken) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Authorization: Bearer {bot_token} required' }));
      return;
    }

    const mcpServer = createMcpServer(botToken, userId);
    const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
    await mcpServer.connect(transport);
    await transport.handleRequest(req, res);
    return;
  }

  res.writeHead(404);
  res.end();
});

httpServer.listen(PORT, () => {
  console.log(`Rashori MCP HTTP server running on :${PORT}`);
  console.log(`MCP endpoint: POST http://localhost:${PORT}/mcp`);
  console.log(`Health check: GET  http://localhost:${PORT}/health`);
});
