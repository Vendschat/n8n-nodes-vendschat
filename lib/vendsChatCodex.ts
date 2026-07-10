import type { CodexData } from 'n8n-workflow';

/** Shared metadata so trigger + action group together under VendsChat in search. */
export const vendsChatCodex: CodexData = {
	categories: ['Communication'],
	alias: ['Vendschat', 'vendschat', 'whatsapp', 'instagram', 'messenger'],
	resources: {
		primaryDocumentation: [{ url: 'https://docs.vendschat.com' }],
		credentialDocumentation: [{ url: 'https://docs.vendschat.com/docs/auth' }],
	},
};
