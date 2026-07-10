import type {
	IDataObject,
	IHookFunctions,
	IHttpRequestMethods,
	INodeType,
	INodeTypeDescription,
	IWebhookFunctions,
	IWebhookResponseData,
} from 'n8n-workflow';
import {
	displayNameNewMessage,
	nodeDescriptionShortNewMessage,
	nodeSubtitleVendsChat,
	vendsChatNodeCodex,
} from '../../lib/productCopy';
import { WEBHOOK_EVENT_OPTIONS } from '../../lib/events';
import {
	getVendsChatAuthHeaders,
	normalizeBaseUrl,
	type VendsChatCredentials,
} from '../../lib/http';

type SubscriptionStaticData = {
	subscriptionId?: string;
};

function getHeader(
	headers: IDataObject | undefined,
	name: string,
): string | undefined {
	if (!headers) return undefined;
	const v = headers[name] ?? headers[name.toLowerCase()];
	if (Array.isArray(v)) return v[0];
	if (typeof v === 'string') return v;
	return undefined;
}

async function registerWebhook(this: IHookFunctions): Promise<boolean> {
	const cred = (await this.getCredentials('vendsChatApi')) as VendsChatCredentials;
	const baseUrl = normalizeBaseUrl(cred.baseUrl);
	const webhookUrl = this.getNodeWebhookUrl('default');
	const events = this.getNodeParameter('events', 0) as string[];

	const response = (await this.helpers.request({
		method: 'POST',
		url: `${baseUrl}/integrations/webhooks/subscribe`,
		headers: getVendsChatAuthHeaders(cred),
		body: {
			url: webhookUrl,
			events,
			source: 'n8n',
			name: `n8n: ${events.join(', ')}`,
		},
		json: true,
	})) as IDataObject;

	const subscriptionId = response.id;
	if (subscriptionId === undefined || subscriptionId === null) {
		throw new Error('VendsChat did not return a webhook subscription id');
	}

	const staticData = this.getWorkflowStaticData('node') as SubscriptionStaticData;
	staticData.subscriptionId = String(subscriptionId);
	return true;
}

async function unregisterWebhook(this: IHookFunctions): Promise<boolean> {
	const cred = (await this.getCredentials('vendsChatApi')) as VendsChatCredentials;
	const baseUrl = normalizeBaseUrl(cred.baseUrl);
	const staticData = this.getWorkflowStaticData('node') as SubscriptionStaticData;
	const subscriptionId = staticData.subscriptionId;

	if (!subscriptionId) {
		return true;
	}

	await this.helpers.request({
		method: 'DELETE',
		url: `${baseUrl}/integrations/webhooks/${subscriptionId}`,
		headers: getVendsChatAuthHeaders(cred),
		json: true,
	});

	delete staticData.subscriptionId;
	return true;
}

export class VendsChatNewMessageTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: displayNameNewMessage,
		name: 'vendsChatNewMessageTrigger',
		icon: 'file:vendschat.svg',
		group: ['trigger'],
		version: 1,
		description: nodeDescriptionShortNewMessage,
		subtitle: nodeSubtitleVendsChat,
		defaults: {
			name: displayNameNewMessage,
		},
		inputs: [],
		outputs: ['main'],
		credentials: [
			{
				name: 'vendsChatApi',
				required: true,
			},
		],
		webhooks: [
			{
				name: 'default',
				httpMethod: '={{$parameter["httpMethod"]}}' as IHttpRequestMethods,
				responseMode: '={{$parameter["responseMode"]}}',
				path: 'vendschat',
				isFullPath: false,
			},
		],
		properties: [
			{
				displayName: 'Events',
				name: 'events',
				type: 'multiOptions',
				options: WEBHOOK_EVENT_OPTIONS,
				default: ['incoming.vendschat.messages'],
				required: true,
				description:
					'VendsChat events that should trigger this workflow. Requires Growth or Advanced plan.',
			},
			{
				displayName: 'HTTP Method',
				name: 'httpMethod',
				type: 'options',
				options: [
					{ name: 'POST', value: 'POST' },
					{ name: 'PUT', value: 'PUT' },
				],
				default: 'POST',
				description: 'HTTP method VendsChat should use when calling this webhook (usually POST)',
			},
			{
				displayName: 'Respond',
				name: 'responseMode',
				type: 'options',
				options: [
					{
						name: 'Immediately',
						value: 'onReceived',
						description: 'Respond as soon as the request is received',
					},
					{
						name: 'When Last Node Finishes',
						value: 'lastNode',
						description: 'After the last node in the workflow finishes',
					},
				],
				default: 'onReceived',
			},
		],
		codex: vendsChatNodeCodex,
	};

	webhookMethods = {
		default: {
			async checkExists(this: IHookFunctions): Promise<boolean> {
				const staticData = this.getWorkflowStaticData('node') as SubscriptionStaticData;
				return Boolean(staticData.subscriptionId);
			},
			create: registerWebhook,
			delete: unregisterWebhook,
		},
	};

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		const cred = (await this.getCredentials('vendsChatApi')) as VendsChatCredentials;
		const req = this.getRequestObject();
		if (cred.webhookSecret) {
			const expected = String(cred.webhookSecret);
			const provided =
				getHeader(req.headers, 'X-VendsChat-Webhook-Secret') ??
				getHeader(req.headers, 'X-Webhook-Secret');
			const fromQuery = (req.query as IDataObject | undefined)?.secret;
			const fromQueryVal =
				typeof fromQuery === 'string' || typeof fromQuery === 'number'
					? String(fromQuery)
					: undefined;
			if (String(provided ?? fromQueryVal ?? '') !== expected) {
				return {
					webhookResponse: {
						headers: { 'content-type': 'application/json' },
						body: {
							success: false,
							error: { code: 'UNAUTHORIZED', message: 'Invalid or missing webhook secret' },
						},
						statusCode: 401,
					},
					workflowData: [[]],
				};
			}
		}

		let data: IDataObject;
		if (req.body === undefined || req.body === null) {
			data = {};
		} else if (typeof req.body === 'string') {
			try {
				const parsed: unknown = JSON.parse(req.body);
				data =
					typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)
						? (parsed as IDataObject)
						: { data: parsed as IDataObject };
			} catch {
				data = { raw: req.body as string };
			}
		} else if (Buffer.isBuffer(req.body)) {
			try {
				const parsed: unknown = JSON.parse(req.body.toString('utf8'));
				data =
					typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)
						? (parsed as IDataObject)
						: { data: parsed as IDataObject };
			} catch {
				data = { raw: req.body.toString('utf8') };
			}
		} else {
			data = req.body as IDataObject;
		}

		return {
			workflowData: [this.helpers.returnJsonArray(data)],
		};
	}
}
