import type {
	IDataObject,
	IHookFunctions,
	ILoadOptionsFunctions,
	INodeType,
	INodeTypeDescription,
	IWebhookFunctions,
	IWebhookResponseData,
} from 'n8n-workflow';
import { NodeConnectionTypes, NodeOperationError } from 'n8n-workflow';
import { WEBHOOK_EVENT_OPTIONS } from '../../lib/events';
import type { VendsChatCredentials } from '../../lib/http';
import { normalizeBaseUrl } from '../../lib/http';
import { vendsChatIntegrationRequest } from '../../lib/integrationApi';
import {
	descriptionTrigger,
	displayNameTrigger,
	subtitleTrigger,
} from '../../lib/productCopy';
import { vendsChatCodex } from '../../lib/vendsChatCodex';

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

export class VendsChatTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: displayNameTrigger,
		name: 'vendsChatTrigger',
		icon: { light: 'file:vendschat.svg', dark: 'file:vendschat.dark.svg' },
		group: ['trigger'],
		version: 1,
		subtitle: subtitleTrigger,
		description: descriptionTrigger,
		defaults: { name: displayNameTrigger },
		inputs: [],
		outputs: [NodeConnectionTypes.Main],
		credentials: [{ name: 'vendsChatApi', required: true }],
		webhooks: [
			{
				name: 'default',
				httpMethod: 'POST',
				responseMode: 'onReceived',
				path: 'vendschat',
				isFullPath: false,
			},
		],
		properties: [
			{
				displayName: 'Event Names or IDs',
				name: 'events',
				type: 'multiOptions',
				typeOptions: { loadOptionsMethod: 'getEvents' },
				default: ['incoming.vendschat.messages'],
				required: true,
				description:
					'Choose from the list, or specify IDs using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
			},
		],
		codex: vendsChatCodex,
	};

	methods = {
		loadOptions: {
			async getEvents(this: ILoadOptionsFunctions) {
				try {
					const cred = (await this.getCredentials('vendsChatApi')) as VendsChatCredentials;
					const res = await vendsChatIntegrationRequest(
						this,
						cred,
						'/integrations/webhooks/events',
					);
					const events = (res.events as IDataObject[]) ?? [];
					if (events.length > 0) {
						return events.map((event) => ({
							name: String(event.label ?? event.type),
							value: String(event.type),
							description: event.description ? String(event.description) : undefined,
						}));
					}
				} catch {
					// Fall back to bundled catalog when credentials are unavailable.
				}

				return WEBHOOK_EVENT_OPTIONS.map((event) => ({
					name: event.name,
					value: event.value,
				}));
			},
		},
	};

	webhookMethods = {
		default: {
			async checkExists(this: IHookFunctions): Promise<boolean> {
				const staticData = this.getWorkflowStaticData('node') as SubscriptionStaticData;
				return Boolean(staticData.subscriptionId);
			},
			async create(this: IHookFunctions): Promise<boolean> {
				const cred = (await this.getCredentials('vendsChatApi')) as VendsChatCredentials;
				const baseUrl = normalizeBaseUrl(cred.baseUrl);
				const webhookUrl = this.getNodeWebhookUrl('default');
				const events = this.getNodeParameter('events', 0) as string[];

				const response = (await this.helpers.httpRequestWithAuthentication.call(
					this,
					'vendsChatApi',
					{
						method: 'POST',
						url: `${baseUrl}/integrations/webhooks/subscribe`,
						headers: { 'Content-Type': 'application/json' },
						body: {
							url: webhookUrl,
							events,
							source: 'n8n',
							name: `n8n: ${events.join(', ')}`,
						},
						json: true,
					},
				)) as IDataObject;

				const subscriptionId = response.id;
				if (subscriptionId === undefined || subscriptionId === null) {
					throw new NodeOperationError(
						this.getNode(),
						'Vendschat did not return a webhook subscription id',
					);
				}

				const staticData = this.getWorkflowStaticData('node') as SubscriptionStaticData;
				staticData.subscriptionId = String(subscriptionId);
				return true;
			},
			async delete(this: IHookFunctions): Promise<boolean> {
				const cred = (await this.getCredentials('vendsChatApi')) as VendsChatCredentials;
				const baseUrl = normalizeBaseUrl(cred.baseUrl);
				const staticData = this.getWorkflowStaticData('node') as SubscriptionStaticData;
				const subscriptionId = staticData.subscriptionId;

				if (!subscriptionId) {
					return true;
				}

				await this.helpers.httpRequestWithAuthentication.call(this, 'vendsChatApi', {
					method: 'DELETE',
					url: `${baseUrl}/integrations/webhooks/${subscriptionId}`,
					json: true,
				});

				delete staticData.subscriptionId;
				return true;
			},
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
				data = { raw: req.body };
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
