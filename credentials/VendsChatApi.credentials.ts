import type { ICredentialTestRequest, ICredentialType, INodeProperties } from 'n8n-workflow';

const DEFAULT_BASE = 'https://api.vendschat.com/v1';

export class VendsChatApi implements ICredentialType {
	name = 'vendsChatApi';
	displayName = 'VendsChat API';
	icon = 'file:vendschat.svg' as const;
	documentationUrl = 'https://docs.vendschat.com/docs/auth';
	properties: INodeProperties[] = [
		{
			displayName: 'Base URL',
			name: 'baseUrl',
			type: 'string',
			default: DEFAULT_BASE,
			placeholder: DEFAULT_BASE,
			description: 'VendsChat API base path (e.g. https://api.vendschat.com/v1).',
		},
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
		},
		{
			displayName: 'API Key in Header',
			name: 'authType',
			type: 'options',
			options: [
				{ name: 'Authorization: Bearer', value: 'bearer' },
				{ name: 'x-api-key', value: 'xApiKey' },
			],
			default: 'bearer',
		},
		{
			displayName: 'Webhook Secret (optional)',
			name: 'webhookSecret',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			description:
				'If set, incoming webhooks must send the same value in the X-VendsChat-Webhook-Secret header (recommended for New Message trigger).',
		},
	];

	/**
	 * Call an endpoint that returns 2xx for a valid key. Adjust path when the API
	 * documents a health or “me” route.
	 */
	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.baseUrl}}',
			url: '/integrations/me',
			method: 'GET',
			headers: {
				Authorization:
					'={{$credentials.authType === "xApiKey" ? "" : "Bearer " + $credentials.apiKey}}',
				'x-api-key': '={{$credentials.authType === "xApiKey" ? $credentials.apiKey : ""}}',
			},
		},
	};
}
