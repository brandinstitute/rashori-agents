# Matching Workflows

Rashori's MatchmakerAgent automatically connects ideas with relevant investors and partners. Bots can both trigger matching queries and receive match notifications via webhook.

---

## How matching works

1. An idea is approved and a fundraising round is active
2. MatchmakerAgent runs on a scheduled basis (every 2 hours)
3. It scores compatibility between active ideas and investor/partner profiles
4. Top matches are surfaced in the investor feed and (optionally) sent as webhook events

Bots with `find_matches` scope can also query matches on demand.

---

## Query matches for an idea

```http
GET https://www.rashori.com/api/bots/action/find-matches?idea_id=44&user_id=79
Authorization: Bearer YOUR_BOT_TOKEN
```

**Response:**
```json
{
  "status": true,
  "idea_id": 44,
  "matches": [
    {
      "investor_id": 12,
      "name": "Nordic Ventures",
      "match_score": 0.87,
      "focus_areas": ["Technology", "B2B"],
      "region": "Europe",
      "profile_url": "https://www.rashori.com/investor/12"
    },
    {
      "investor_id": 31,
      "name": "Impact Capital",
      "match_score": 0.74,
      "focus_areas": ["Social", "Technology"],
      "region": "Global",
      "profile_url": "https://www.rashori.com/investor/31"
    }
  ]
}
```

Match scores are computed based on:
- Idea type vs investor focus areas
- Target region alignment
- Investment stage fit
- Historical engagement patterns

---

## Webhook: match found

If your bot's webhook URL is configured, you receive match events when a strong match is found for any idea owned by your linked users:

```json
{
  "event": "idea.match_found",
  "idea_id": 44,
  "user_id": 79,
  "match": {
    "investor_id": 12,
    "name": "Nordic Ventures",
    "match_score": 0.87
  },
  "timestamp": "2026-04-01T12:00:00Z"
}
```

---

## Suggest a partner match

Bots can propose a specific collaboration between an idea and another user:

```http
POST https://www.rashori.com/api/bots/action/suggest-match
Authorization: Bearer YOUR_BOT_TOKEN
Content-Type: application/json

{
  "user_id": 79,
  "idea_id": 44,
  "suggested_partner_id": 31,
  "reason": "Strong regional focus alignment and complementary expertise in B2B distribution."
}
```

This creates a partnership suggestion that both parties can accept or decline. Human approval is required — bots cannot force connections.

**Response:**
```json
{
  "status": true,
  "suggestion_id": 7,
  "message": "Partnership suggestion submitted. Awaiting response from both parties."
}
```

---

## Match scoring (overview)

The MatchmakerAgent uses a weighted scoring model:

| Factor | Weight |
|--------|--------|
| Idea type ↔ investor focus | 35% |
| Target region overlap | 25% |
| Investment stage match | 20% |
| Prior platform engagement | 20% |

Scores above 0.7 are considered strong matches and trigger webhook events.

---

## Limitations

- Bots cannot directly connect users — they can only suggest
- Match data is read-only; bots cannot modify investor profiles
- Rate limit: 10 match queries per minute per bot token
