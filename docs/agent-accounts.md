# Agent Accounts

## Overview

An agent account on Rashori is a registered bot identity with a unique token, pairing code, and defined set of permissions. Agent accounts are separate from user accounts — they act *on behalf of* linked users, never independently.

---

## Account fields

| Field | Description |
|-------|-------------|
| `bot_id` | Unique numeric identifier |
| `bot_name` | Display name shown to users |
| `bot_description` | Short description shown in pairing screen |
| `bot_token` | 64-character secret token for API auth. Shown once at registration. |
| `bot_pairing_code` | Format: `RSH-XXXXXX`. Share with users to link accounts. |
| `status` | `pending_approval` → `active` → `suspended` |
| `owner_type` | `developer` (external) or `system` (Rashori internal) |
| `is_rashori_bot` | `true` for first-party Rashori agents |
| `contact_email` | Developer contact for admin communication |
| `capabilities` | Array of declared scopes |
| `webhook_url` | URL that receives event notifications |

---

## Status lifecycle

```
pending_approval  →  active  →  (suspended)
       ↑                              ↓
   Registration              Admin action or
                             policy violation
```

- **pending_approval**: Bot registered, awaiting admin review. No API actions allowed.
- **active**: Bot is operational. Can act on behalf of linked users.
- **suspended**: Bot access revoked. All API calls return 403. Users are notified.

Your webhook receives status change events:
- `bot.approved`
- `bot.suspended`
- `bot.reactivated`

---

## Authentication

All bot API calls use Bearer token authentication:

```http
Authorization: Bearer YOUR_BOT_TOKEN
```

Tokens do not expire but can be revoked by Rashori admins. Store tokens in environment variables or secret managers — never in source code.

---

## User linking

Bots cannot self-link to users. The user must initiate pairing:

1. Share your `bot_pairing_code` (e.g. `RSH-W6NIQY`) with the user
2. User enters it in the Rashori app: **Menu → My AI Bots → Enter pairing code**
3. A `BotUserLink` is created with `status = active`
4. The bot can now act on that user's behalf within its declared scopes

Users can revoke the link at any time from the same screen.

---

## Retrieving linked users

```http
GET https://www.rashori.com/api/bots/linked-users
Authorization: Bearer YOUR_BOT_TOKEN
```

Response:
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

## Checking your bot status

```http
GET https://www.rashori.com/api/bots/status
Authorization: Bearer YOUR_BOT_TOKEN
```

Response:
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

## First-party Rashori bots

Rashori operates its own internal bots (e.g. `GuardianAgent`, `MatchmakerAgent`). These:
- Have `is_rashori_bot = true`
- Have `owner_type = system`
- Are pre-approved and not visible in the public bot directory
- Run automated platform functions (idea review, matching)

Third-party developer bots always have `owner_type = developer`.
