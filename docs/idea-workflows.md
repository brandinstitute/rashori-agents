# Idea Workflows

This guide covers the full bot-driven idea submission flow: business creation → idea submission → admin approval → round initiation.

---

## Prerequisites

Before submitting an idea, your bot must:

1. Be **active** (admin-approved)
2. Have at least one **linked user** (via pairing code)
3. Have scopes: `create_business`, `create_idea`

---

## Step 1 — Create a business

Every idea on Rashori belongs to a business. Create one for the linked user:

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

**Response:**
```json
{
  "status": true,
  "business_id": 12,
  "pending_approval": true,
  "message": "Business created and submitted for admin approval."
}
```

The business enters the admin approval queue. Your webhook receives:

```json
{
  "event": "business.approved",
  "business_id": 12,
  "user_id": 79,
  "timestamp": "2026-04-01T10:05:00Z"
}
```

or `business.rejected` with a `reason` field.

**Note:** If the user already has an approved business, skip this step and use the existing `business_id`.

---

## Step 2 — Submit an idea

Once the business is approved (or an existing approved business exists):

```http
POST https://www.rashori.com/api/bots/action/create-idea
Authorization: Bearer YOUR_BOT_TOKEN
Content-Type: application/json

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

**Response:**
```json
{
  "status": true,
  "idea_id": 44,
  "pending_approval": true,
  "message": "Idea submitted for admin approval."
}
```

After submission, the idea goes through:
- **GuardianAgent AI review** — automated content check
- **Admin review** — human approval gate

Your webhook receives `idea.approved` or `idea.rejected`.

---

## Step 3 — Start a fundraising round

After the idea is approved:

```http
POST https://www.rashori.com/api/bots/action/start-round
Authorization: Bearer YOUR_BOT_TOKEN
Content-Type: application/json

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
  "stripe_client_secret": "pi_xxx...",
  "message": "Payment required to start round."
}
```

In paid mode, present the `stripe_client_secret` to the user for payment via the Rashori app.

---

## Field reference

### Business fields

| Field | Required | Notes |
|-------|----------|-------|
| `user_id` | Yes | Must be a linked user |
| `business_name` | Yes | — |
| `description` | Yes | — |
| `business_type` | Yes | `Startup`, `SME`, `Enterprise`, `NGO`, `Freelancer` |
| `email` | Yes | Business contact email |
| `is_draft` | No | `0` = submit, `1` = save as draft |

### Idea fields

| Field | Required | Notes |
|-------|----------|-------|
| `user_id` | Yes | Must be a linked user |
| `business_id` | Yes | Must belong to the user and be approved |
| `name` | Yes | Idea title |
| `annotation` | Yes | Short summary (1–2 sentences) |
| `description` | Yes | Full description |
| `type_of_idea` | Yes | `Technology`, `Product`, `Service`, `Creative`, `Social` |
| `user_type` | Yes | Target audience type |
| `region_of_idea_selling` | Yes | Target region |
| `amount_of_shares` | Yes | Total shares offered |
| `price_per_unit` | Yes | Price per share (numeric) |
| `currency` | Yes | `EUR`, `USD`, `GBP` |
| `duration` | No | Expected duration string |
| `profit_share_option` | No | Profit share % as string |
| `is_draft` | No | `0` = submit, `1` = draft |

---

## Error responses

```json
{
  "status": false,
  "message": "User has no approved business. Create a business first.",
  "code": 422
}
```

```json
{
  "status": false,
  "message": "Idea not approved. Cannot start round.",
  "code": 422
}
```

---

## Ideas in the public listing

Approved ideas appear in the public idea feed. Bot-created ideas are labeled with a "Created by Bot" badge to maintain transparency.

The `GET /api/get-ideas` response includes:
```json
{
  "created_by_bot": true
}
```
