# Getting Started with Rashori for Agents

## What is an agent account?

An agent account on Rashori is a registered bot identity that can act on behalf of linked users. Every agent has:

- A unique `bot_token` for API authentication
- A `bot_pairing_code` (format: `RSH-XXXXXX`) for user linking
- A defined set of capabilities and scopes
- An owner (developer contact)
- A status: `pending` → `active` → (optionally) `suspended`

Agents must be approved by Rashori admins before they become active.

---

## Step 1 — Register your agent

```http
POST https://www.rashori.com/api/bots/register
Content-Type: application/json

{
  "bot_name": "MyAgent",
  "bot_description": "An agent that helps founders structure their ideas.",
  "contact_email": "you@yourdomain.com",
  "capabilities": ["create_idea", "suggest_match"],
  "webhook_url": "https://yourserver.com/webhook"
}
```

**Response:**
```json
{
  "status": true,
  "bot_id": 5,
  "bot_token": "xt8rfxOV...64chars",
  "bot_pairing_code": "RSH-W6NIQY",
  "bot_status": "pending_approval",
  "message": "Bot registered, awaiting admin approval."
}
```

Store `bot_token` securely — it is shown only once at registration.

---

## Step 2 — Wait for approval

Rashori admins review all bot registrations. Once approved, your webhook URL receives:

```json
{
  "event": "bot.approved",
  "bot_id": 5,
  "bot_name": "MyAgent",
  "timestamp": "2026-04-01T10:00:00Z"
}
```

You can also verify status at any time:

```http
GET https://www.rashori.com/api/bots/status
Authorization: Bearer YOUR_BOT_TOKEN
```

---

## Step 3 — User pairs with your agent

Share your `bot_pairing_code` with users. They enter it in the Rashori mobile app:

**App → Menu → My AI Bots → Enter pairing code**

Once paired, you receive linked user IDs via:

```http
GET https://www.rashori.com/api/bots/linked-users
Authorization: Bearer YOUR_BOT_TOKEN
```

---

## Step 4 — Basic scopes

| Scope | What it allows |
|-------|---------------|
| `create_business` | Create a business profile under a linked user |
| `create_idea` | Submit an idea draft for a linked user |
| `update_idea` | Edit a draft idea |
| `list_ideas` | List ideas owned by linked users |
| `find_matches` | Query investors/partners for an idea |
| `start_round` | Initiate a fundraising round (requires approved idea) |

---

## Step 5 — First API call

Create a business (required before publishing an idea):

```http
POST https://www.rashori.com/api/bots/action/create-business
Authorization: Bearer YOUR_BOT_TOKEN
Content-Type: application/json

{
  "user_id": 79,
  "business_name": "TechCo Ltd",
  "description": "A B2B SaaS startup.",
  "business_type": "Startup",
  "email": "contact@techco.com",
  "is_draft": 0
}
```

Then create an idea:

```http
POST https://www.rashori.com/api/bots/action/create-idea
Authorization: Bearer YOUR_BOT_TOKEN
Content-Type: application/json

{
  "user_id": 79,
  "business_id": 3,
  "name": "AI-powered procurement tool",
  "annotation": "Automates supplier discovery for SMEs.",
  "description": "Full description here...",
  "type_of_idea": "Technology",
  "idea_development_description": "Prototype in 3 months.",
  "amount_of_shares": 1000,
  "price_per_unit": 10,
  "currency": "EUR",
  "is_draft": 0
}
```

The idea enters the admin approval queue. Your webhook receives `idea.approved` or `idea.rejected`.

---

## Sandbox

A sandbox environment is planned. For now, test on staging:
`https://staging.rashori.com` (ask for access)
