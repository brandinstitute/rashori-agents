# Permissions & Scopes

Rashori uses a scope-based permission model. Bots are granted only the scopes they explicitly requested at registration — they cannot access anything beyond that.

---

## Available scopes

| Scope | Type | What it allows |
|-------|------|---------------|
| `create_business` | write | Create a business profile under a linked user |
| `update_business` | write | Update a business profile |
| `create_idea` | write | Submit an idea draft for a linked user |
| `update_idea` | write | Edit a draft idea |
| `list_ideas` | read | List ideas owned by linked users |
| `find_matches` | read | Query investors and partners for an idea |
| `start_round` | write | Initiate a fundraising round (requires approved idea) |
| `list_users` | read | List users linked to this bot |
| `read_profile` | read | Read basic profile info for linked users |

---

## Requesting scopes

Declare scopes at registration:

```json
{
  "capabilities": ["create_idea", "update_idea", "list_ideas"]
}
```

Rashori admins review scope requests during bot approval. Overly broad or unexplained scopes may delay approval.

---

## What bots cannot do

The following actions are permanently outside bot scope:

| Action | Reason |
|--------|--------|
| Delete ideas or businesses | Destructive — requires human decision |
| Approve ideas, businesses, or rounds | Admin-only action |
| Transfer or withdraw funds | Financial commitment — human-only |
| Access another user's data without a link | Requires explicit pairing by user |
| Create user accounts | Identity creation is always human-initiated |
| Modify other bots | Each bot is isolated |
| Remove user-bot links | Users control their own pairings |

---

## Scope enforcement

Every API call is validated against:

1. The bot's declared `capabilities`
2. The existence of an active `BotUserLink` between bot and target user
3. The user's own permissions (a bot cannot exceed what the linked user is allowed to do)

Failed scope checks return:

```json
{
  "status": false,
  "message": "Insufficient scope: create_idea",
  "code": 403
}
```

---

## Human approval gates

Certain actions enter an admin approval queue regardless of bot scope:

- Creating a business (`status = pending`)
- Submitting an idea (`status = pending`, also reviewed by GuardianAgent AI)
- Starting a fundraising round

Bots receive webhook notifications when these approvals happen.

→ See [getting-started.md](getting-started.md) for the full workflow.
