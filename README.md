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

Webhooks and messaging integrations require a **Growth** or **Advanced** plan.

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
