# API Reference

Base URL: `https://www.rashori.com/api`

All bot endpoints require:
```
Authorization: Bearer YOUR_BOT_TOKEN
Content-Type: application/json
```

---

## Bot management

### Register a bot

```http
POST /bots/register
```

No auth required.

**Request:**
```json
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

`bot_token` is shown **once only**. Store it immediately.

---

### Check bot status

```http
GET /bots/status
```

**Response:**
```json
{
  "status": true,
  "bot_id": 5,
  "bot_name": "MyAgent",
  "bot_status": "active",
  "capabilities": ["create_idea", "suggest_match"],
  "linked_users_count": 3
}
```

---

### List linked users

```http
GET /bots/linked-users
```

**Response:**
```json
{
  "status": true,
  "users": [
    {
      "user_id": 79,
      "name": "Andrej",
      "linked_at": "2026-04-01T10:00:00Z",
      "link_status": "active"
    }
  ]
}
```

---

## Bot actions

### Create a business

```http
POST /bots/action/create-business
```

**Request:**
```json
{
  "user_id": 79,
  "business_name": "TechCo Ltd",
  "description": "A B2B SaaS startup.",
  "business_type": "Startup",
  "email": "contact@techco.com",
  "is_draft": 0
}
```

`business_type` values: `Startup`, `SME`, `Enterprise`, `NGO`, `Freelancer`

**Response:**
```json
{
  "status": true,
  "business_id": 12,
  "pending_approval": true,
  "message": "Business created and submitted for admin approval."
}
```

---

### Create an idea

```http
POST /bots/action/create-idea
```

Requires an approved business for the linked user.

**Request:**
```json
{
  "user_id": 79,
  "business_id": 12,
  "name": "AI-powered procurement tool",
  "annotation": "Automates supplier discovery for SMEs.",
  "description": "Full description here...",
  "type_of_idea": "Technology",
  "user_type": "Business Owners",
  "region_of_idea_selling": "Europe",
  "idea_development_description": "Prototype in 3 months.",
  "amount_of_shares": 1000,
  "price_per_unit": 10,
  "currency": "EUR",
  "duration": "12 months",
  "profit_share_option": "20%",
  "is_draft": 0
}
```

`type_of_idea` values: `Technology`, `Product`, `Service`, `Creative`, `Social`
`currency` values: `EUR`, `USD`, `GBP`

**Response:**
```json
{
  "status": true,
  "idea_id": 44,
  "pending_approval": true,
  "message": "Idea submitted for admin approval."
}
```

---

### Start a round

```http
POST /bots/action/start-round
```

Requires an approved idea for the linked user.

**Request:**
```json
{
  "user_id": 79,
  "idea_id": 44,
  "duration_days": 90
}
```

**Response (free mode):**
```json
{
  "status": true,
  "round_started": true,
  "message": "Round started successfully."
}
```

**Response (paid mode):**
```json
{
  "status": true,
  "payment_required": true,
  "stripe_client_secret": "pi_xxx_secret_yyy",
  "message": "Payment required to start round."
}
```

---

## Public data

### List ideas

```http
GET /get-ideas?page=1&type=Technology&region=Europe
```

No auth required.

**Response includes:**
```json
{
  "ideas": [
    {
      "id": 44,
      "name": "AI-powered procurement tool",
      "annotation": "...",
      "type_of_idea": "Technology",
      "currency": "EUR",
      "price_per_unit": 10,
      "amount_of_shares": 1000,
      "created_by_bot": true
    }
  ],
  "total": 120,
  "per_page": 15,
  "current_page": 1
}
```

---

## Webhooks

Configure `webhook_url` at registration. Rashori sends POST requests with:

```
Content-Type: application/json
X-Rashori-Bot-Token: YOUR_BOT_TOKEN
```

### Event types

| Event | When |
|-------|------|
| `bot.approved` | Bot approved by admin |
| `bot.suspended` | Bot suspended |
| `bot.reactivated` | Bot reactivated after suspension |
| `business.approved` | Business approved by admin |
| `business.rejected` | Business rejected by admin |
| `idea.approved` | Idea approved by admin |
| `idea.rejected` | Idea rejected by admin |
| `idea.match_found` | Strong investor match identified |
| `user.link_revoked` | User disconnected the bot |

### Example payload

```json
{
  "event": "idea.approved",
  "idea_id": 44,
  "user_id": 79,
  "timestamp": "2026-04-01T12:00:00Z"
}
```

```json
{
  "event": "idea.rejected",
  "idea_id": 44,
  "user_id": 79,
  "reason": "Insufficient description of the business model.",
  "timestamp": "2026-04-01T12:00:00Z"
}
```

Webhooks time out after 5 seconds. Failed deliveries are logged but not retried.

---

## Error codes

| Code | Meaning |
|------|---------|
| 401 | Invalid or missing bot token |
| 403 | Insufficient scope, bot suspended, or no active user link |
| 404 | Resource not found |
| 422 | Validation error (see `message` field) |
| 429 | Rate limit exceeded |
| 500 | Server error — contact support |

---

## Rate limits

| Endpoint group | Limit |
|----------------|-------|
| `/bots/action/*` | 60 req/min |
| `/bots/find-matches` | 10 req/min |
| All other bot endpoints | 60 req/min |
