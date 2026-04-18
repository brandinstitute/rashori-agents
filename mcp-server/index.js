/**
 * Rashori MCP Server (stdio transport)
 *
 * Use with Claude Desktop, Cursor, or any MCP-compatible AI client.
 *
 * Required env:
 *   RASHORI_BOT_TOKEN  — your Rashori bot token
 *   RASHORI_USER_ID    — linked user's ID (or omit and use email claim mode)
 *
 * Optional:
 *   RASHORI_BASE_URL   — override API base (default: https://www.rashori.com/api)
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import * as R from './rashori-client.js';

const server = new McpServer({
  name: 'rashori',
  version: '1.0.0',
  description: 'Create ideas, find investors, and watch projects on Rashori — the startup and investor matching platform.',
});

// ── Resources (read-only, no auth) ───────────────────────────────────────────

server.resource(
  'rashori://ideas/public',
  'Browse public ideas on Rashori',
  async () => {
    const data = await R.searchIdeas();
    return {
      contents: [{
        uri: 'rashori://ideas/public',
        mimeType: 'application/json',
        text: JSON.stringify(data, null, 2),
      }],
    };
  }
);

server.resource(
  'rashori://platform/pricing',
  'Rashori point packages and pricing',
  async () => {
    const data = await R.getPointsConfig();
    return {
      contents: [{
        uri: 'rashori://platform/pricing',
        mimeType: 'application/json',
        text: JSON.stringify(data, null, 2),
      }],
    };
  }
);

// ── Tools ────────────────────────────────────────────────────────────────────

server.tool(
  'search_ideas',
  'Search public ideas on Rashori by type, region, or keyword',
  {
    type:    z.string().optional().describe('Idea type: Technology, Product, Service, Creative, Social'),
    region:  z.string().optional().describe('Region filter e.g. Europe, Slovakia, Global'),
    keyword: z.string().optional().describe('Keyword to search in idea titles and descriptions'),
    page:    z.number().optional().default(1).describe('Page number'),
  },
  async (params) => {
    const data = await R.searchIdeas(params);
    return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
  }
);

server.tool(
  'bot_status',
  'Check this bot\'s connection status and number of linked users',
  {},
  async () => {
    const data = await R.botStatus();
    return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
  }
);

server.tool(
  'list_linked_users',
  'List all Rashori users linked to this bot',
  {},
  async () => {
    const data = await R.linkedUsers();
    return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
  }
);

server.tool(
  'create_business',
  'Create a business profile on Rashori on behalf of a user. Use email for claim mode (user does not need to be registered yet).',
  {
    business_name:  z.string().describe('Name of the business or startup'),
    description:    z.string().optional().describe('Short description of the business'),
    business_type:  z.string().optional().describe('Startup, SME, Enterprise, NGO, or Freelancer'),
    email:          z.string().email().optional().describe('User email for claim mode — use if user_id is not known'),
    user_id:        z.number().optional().describe('Rashori user ID (if user is already paired with this bot)'),
    city:           z.string().optional(),
    country:        z.string().optional(),
    is_draft:       z.number().optional().default(1).describe('1 = draft (default), 0 = submit for review'),
  },
  async (params) => {
    const data = await R.createBusiness(params);
    return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
  }
);

server.tool(
  'create_idea',
  'Submit a startup idea on Rashori on behalf of a user. Creates a draft by default. Use email for claim mode.',
  {
    name:                         z.string().describe('Idea title'),
    annotation:                   z.string().describe('One or two sentence summary of the idea'),
    description:                  z.string().describe('Detailed description of the idea'),
    type_of_idea:                 z.string().describe('Technology, Product, Service, Creative, or Social'),
    idea_development_description: z.string().optional().describe('Development plan and milestones'),
    amount_of_shares:             z.number().optional().default(1000).describe('Number of shares offered to investors'),
    price_per_unit:               z.number().optional().default(10).describe('Price per share in EUR'),
    currency:                     z.string().optional().default('EUR'),
    region_of_idea_selling:       z.string().optional().describe('Target region e.g. Europe, Global, Slovakia'),
    duration:                     z.string().optional().describe('Expected development duration e.g. 12 months'),
    profit_share_option:          z.string().optional().describe('Profit share percentage offered e.g. 20%'),
    business_id:                  z.number().optional().describe('ID of an existing approved business'),
    email:                        z.string().email().optional().describe('User email for claim mode'),
    user_id:                      z.number().optional().describe('Rashori user ID if already paired'),
    is_draft:                     z.number().optional().default(1).describe('1 = draft (default), 0 = submit for review'),
  },
  async (params) => {
    const data = await R.createIdea(params);
    return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
  }
);

server.tool(
  'update_idea',
  'Update an existing idea draft on Rashori',
  {
    idea_id:                      z.number().describe('ID of the idea to update'),
    user_id:                      z.number().optional().describe('Rashori user ID'),
    name:                         z.string().optional(),
    annotation:                   z.string().optional(),
    description:                  z.string().optional(),
    idea_development_description: z.string().optional(),
    type_of_idea:                 z.string().optional(),
    region_of_idea_selling:       z.string().optional(),
    amount_of_shares:             z.number().optional(),
    price_per_unit:               z.number().optional(),
  },
  async (params) => {
    const data = await R.updateIdea(params);
    return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
  }
);

server.tool(
  'list_my_ideas',
  'List all ideas belonging to linked user(s)',
  {
    user_id: z.number().optional().describe('Filter by specific user ID'),
  },
  async (params) => {
    const data = await R.listIdeas(params);
    return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
  }
);

server.tool(
  'find_investor_matches',
  'Find existing investors and interested parties for a specific idea',
  {
    idea_id: z.number().describe('ID of the idea to find matches for'),
    user_id: z.number().optional().describe('Rashori user ID'),
  },
  async (params) => {
    const data = await R.findMatches(params);
    return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
  }
);

server.tool(
  'start_fundraising_round',
  'Start a fundraising round for an approved idea (free mode or triggers Stripe payment)',
  {
    idea_id:       z.number().describe('ID of the approved idea'),
    duration_days: z.number().default(30).describe('Round duration: 30, 60, or 90 days'),
    user_id:       z.number().optional(),
  },
  async (params) => {
    const data = await R.startRound(params);
    return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
  }
);

server.tool(
  'watch_idea',
  'Start watching an idea for an investor user — bot will receive webhooks on changes (new round, match found)',
  {
    idea_id: z.number().describe('ID of the published idea to watch'),
    user_id: z.number().optional().describe('Rashori user ID of the investor'),
    events:  z.array(z.string()).optional().describe('Specific events to watch: round.started, match.found, idea.updated (null = all)'),
  },
  async (params) => {
    const data = await R.watchIdea(params);
    return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
  }
);

server.tool(
  'unwatch_idea',
  'Stop watching an idea',
  {
    idea_id: z.number().describe('ID of the idea to stop watching'),
    user_id: z.number().optional(),
  },
  async (params) => {
    const data = await R.unwatchIdea(params);
    return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
  }
);

server.tool(
  'list_watched_ideas',
  'List all ideas currently being watched by this bot for investor users',
  {},
  async () => {
    const data = await R.listWatches();
    return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
  }
);

// ── Start ────────────────────────────────────────────────────────────────────

const transport = new StdioServerTransport();
await server.connect(transport);
