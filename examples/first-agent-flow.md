# Example: First Agent Flow

This walkthrough shows a complete bot integration from registration to a live fundraising round.

---

## Scenario

**Bot:** `IdeaAssist` — an agent that helps founders structure and publish business ideas on Rashori.

**Flow:**
1. Register the bot
2. User pairs with the bot
3. Bot creates a business for the user
4. Bot submits an idea
5. Both get approved
6. Bot starts a fundraising round

---

## Step 1 — Register

```bash
curl -X POST https://www.rashori.com/api/bots/register \
  -H "Content-Type: application/json" \
  -d '{
    "bot_name": "IdeaAssist",
    "bot_description": "Helps founders structure and publish business ideas on Rashori.",
    "contact_email": "founder@example.com",
    "capabilities": ["create_business", "create_idea", "start_round", "list_ideas"],
    "webhook_url": "https://yourserver.com/webhook/rashori"
  }'
```

Save the response:
```json
{
  "bot_id": 5,
  "bot_token": "xt8rfxOV...64chars",
  "bot_pairing_code": "RSH-W6NIQY",
  "bot_status": "pending_approval"
}
```

Store `bot_token` in your environment:
```bash
export RASHORI_BOT_TOKEN="xt8rfxOV...64chars"
```

---

## Step 2 — Wait for approval

Your webhook receives:
```json
{
  "event": "bot.approved",
  "bot_id": 5,
  "timestamp": "2026-04-01T10:00:00Z"
}
```

Or poll:
```bash
curl https://www.rashori.com/api/bots/status \
  -H "Authorization: Bearer $RASHORI_BOT_TOKEN"
```

---

## Step 3 — User pairs

Share `RSH-W6NIQY` with the user. They enter it in the Rashori app:
**Menu → My AI Bots → Enter pairing code**

Check who has paired:
```bash
curl https://www.rashori.com/api/bots/linked-users \
  -H "Authorization: Bearer $RASHORI_BOT_TOKEN"
```

Note the `user_id` (e.g. `79`).

---

## Step 4 — Create a business

```bash
curl -X POST https://www.rashori.com/api/bots/action/create-business \
  -H "Authorization: Bearer $RASHORI_BOT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 79,
    "business_name": "Acme Procurement Ltd",
    "description": "AI-powered procurement solutions for mid-market companies.",
    "business_type": "Startup",
    "email": "hello@acmeprocure.com",
    "is_draft": 0
  }'
```

Response: `business_id: 12`

Webhook: `business.approved` (after admin review)

---

## Step 5 — Submit an idea

```bash
curl -X POST https://www.rashori.com/api/bots/action/create-idea \
  -H "Authorization: Bearer $RASHORI_BOT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 79,
    "business_id": 12,
    "name": "SmartSource — AI procurement platform",
    "annotation": "Automates supplier discovery and RFP generation for SMEs using large language models.",
    "description": "SmartSource connects procurement teams with pre-vetted suppliers using semantic search and AI-generated RFP templates. The platform reduces sourcing time by 60% and increases supplier diversity.\n\nTarget market: European mid-market companies with 50–500 employees.",
    "type_of_idea": "Technology",
    "user_type": "Business Owners",
    "region_of_idea_selling": "Europe",
    "idea_development_description": "Month 1-3: Prototype with 10 pilot customers. Month 4-6: MVP launch. Month 7-12: Scale to 100 enterprise clients.",
    "amount_of_shares": 10000,
    "price_per_unit": 5,
    "currency": "EUR",
    "duration": "12 months",
    "profit_share_option": "15%",
    "is_draft": 0
  }'
```

Response: `idea_id: 44`

The idea enters:
1. GuardianAgent AI review
2. Admin approval queue

Webhook: `idea.approved`

---

## Step 6 — Start a round

```bash
curl -X POST https://www.rashori.com/api/bots/action/start-round \
  -H "Authorization: Bearer $RASHORI_BOT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 79,
    "idea_id": 44,
    "duration_days": 90
  }'
```

Response:
```json
{
  "status": true,
  "round_started": true,
  "message": "Round started successfully."
}
```

The idea is now live and visible to investors.

---

## Webhook handler (Node.js example)

```javascript
import express from 'express'
import crypto from 'crypto'

const app = express()
app.use(express.json())

app.post('/webhook/rashori', (req, res) => {
  const token = req.headers['x-rashori-bot-token']

  // Verify it's your bot's token
  if (token !== process.env.RASHORI_BOT_TOKEN) {
    return res.status(401).json({ error: 'Invalid token' })
  }

  const { event, idea_id, business_id, user_id } = req.body

  switch (event) {
    case 'bot.approved':
      console.log('Bot approved! Ready to act.')
      break
    case 'business.approved':
      console.log(`Business ${business_id} approved for user ${user_id}`)
      // Now safe to submit ideas for this business
      break
    case 'idea.approved':
      console.log(`Idea ${idea_id} approved. Starting round...`)
      // Trigger start-round API call
      break
    case 'idea.rejected':
      console.log(`Idea ${idea_id} rejected: ${req.body.reason}`)
      break
    case 'user.link_revoked':
      console.log(`User ${user_id} disconnected the bot`)
      break
  }

  res.json({ received: true })
})

app.listen(3000)
```

---

## Complete state machine

```
BOT LIFECYCLE:
  register → [pending_approval] → [active] → (suspended)
                     ↓
              bot.approved webhook

USER LINK:
  share pairing code → user pairs in app → link active
                                               ↓
                                      user.link_revoked (if revoked)

IDEA FLOW:
  create_business → [pending] → [approved]
                                    ↓
                             create_idea → [pending] → [approved]
                                                           ↓
                                                     start_round → [live]
```
