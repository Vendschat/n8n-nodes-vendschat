# n8n-nodes-vendschat

Community nodes for [Vendschat](https://vendschat.com): send WhatsApp / Instagram / Messenger messages, manage contacts, and trigger workflows from Vendschat webhook events.

## Install

### n8n UI (recommended)

1. Open **Settings → Community nodes**
2. Select **Install**
3. Enter: `n8n-nodes-vendschat`
4. Confirm and restart n8n if prompted

### npm (self-hosted)

```bash
npm install n8n-nodes-vendschat
```

Restart your n8n instance after installing.

Package: [npmjs.com/package/n8n-nodes-vendschat](https://www.npmjs.com/package/n8n-nodes-vendschat)

## Credentials

Create a **Vendschat API** credential:

| Field | Description |
|-------|-------------|
| **Base URL** | Default `https://api.vendschat.com/v1` (local: `http://localhost:8080/v1`) |
| **API Key** | From Vendschat → **Settings → Integrations** (or API Keys) |
| **API Key in Header** | `Authorization: Bearer` (default) or `x-api-key` |
| **Webhook Secret** | Optional. Leave blank for normal Vendschat Trigger deliveries. Vendschat signs webhooks with HMAC (`X-VendsChat-Signature`), not a shared-secret header. Only set this if your endpoint sends the same value in `X-VendsChat-Webhook-Secret`. |

Webhooks and messaging integrations require a **Growth** or **Advanced** plan.

## Usage

### Send a WhatsApp text reply

1. Add the **Vendschat** node and select your **Vendschat API** credential.
2. Set **Operation** to **Send Message**.
3. Set the contact and the message:

| Field | Example |
|-------|---------|
| **Identifier Type** | Phone Number |
| **Identifier Value** | `+15551234567` |
| **Channel Type** | Specific Channel |
| **Channel Name or ID** | Your WhatsApp channel, for example `Support (whatsapp)` |
| **WhatsApp Message Type** | Text |
| **Message Text** | `Thanks, we received your message.` |

4. Execute the node. A successful item looks like this:

```json
{
  "success": true,
  "thread_id": 1842,
  "contact_id": 902,
  "channel_id": 14,
  "channel_type": "whatsapp",
  "message_id": 55021,
  "external_message_id": "wamid.HBgMNTU1MTIzNDU2Nw",
  "status": "sent",
  "created_contact": false,
  "created_thread": false
}
```

Text replies send only inside the 24-hour customer service window. Outside that window, set **WhatsApp Message Type** to **Template** and choose a template.

### Sample trigger payload

1. Add **Vendschat Trigger**.
2. Select the event **WhatsApp — text** (`incoming.whatsapp.messages.text`).
3. Activate the workflow so n8n registers the webhook.

An incoming WhatsApp text arrives as one item:

```json
{
  "id": "evt_01jexamplewhatsapptext",
  "type": "incoming.whatsapp.messages.text",
  "created_at": "2026-11-13T02:00:00.000Z",
  "workspace_id": 42,
  "api_version": "unversioned",
  "data": {
    "message_id": 55020,
    "thread_id": 1842,
    "contact_id": 902,
    "channel_id": 14,
    "channel_type": "whatsapp",
    "direction": "inbound",
    "message_type": "text",
    "content": "Where is my order?",
    "media_url": null,
    "media_asset_id": null,
    "status": "received",
    "external_message_id": "wamid.HBgLNDQxMjM0NTY3OA"
  }
}
```

## Nodes

### Vendschat Trigger

Starts the workflow when subscribed Vendschat events occur (messages, contacts, etc.).

1. Add **Vendschat Trigger**
2. Select events
3. Activate the workflow — n8n registers a webhook with Vendschat automatically

### Vendschat (actions)

| Operation | Description |
|-----------|-------------|
| **Send Message** | Send WhatsApp, Instagram, or Messenger messages |
| **Get Contact** | Find a contact by ID, email, or phone |
| **Create Contact** | Create a contact (phone + email required) |
| **Update Contact** | Update contact fields |
| **Delete Contact** | Permanently delete a contact |
| **Add Label(s) to a Contact** | Dropdown and/or comma-separated names (creates missing labels) |
| **Remove Label(s)** | Remove labels from a contact only |
| **Add or Update Note** | Set the contact note |

Identify contacts with **Contact ID**, **Email**, or **Phone number** (E.164 recommended).

## Development

```bash
npm install
npm run build
npm run lint
```

Link into a local n8n install for testing, or use n8n’s community node development workflow.

## Related

- API: `https://api.vendschat.com/v1/integrations/*`
- Zapier / Make siblings use the same integrations API
- Docs: [docs.vendschat.com](https://docs.vendschat.com)

## License

[MIT](./LICENSE)
