import type {
	IDataObject,
	IExecuteFunctions,
	ILoadOptionsFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionTypes, NodeOperationError } from 'n8n-workflow';
import type { VendsChatCredentials } from '../../lib/http';
import { vendsChatIntegrationRequest } from '../../lib/integrationApi';
import {
	descriptionAction,
	displayNameAction,
	subtitleAction,
} from '../../lib/productCopy';
import { sendMessageFields } from '../../lib/sendMessageFields';
import { vendsChatCodex } from '../../lib/vendsChatCodex';

function buildSendMessagePayload(item: IDataObject): IDataObject {
	const templateVars: Record<string, string> = {};
	const rawVars = item.templateVariables as { variable?: Array<{ key: string; value: string }> };
	for (const row of rawVars?.variable ?? []) {
		if (row.key) templateVars[row.key] = row.value;
	}

	const channelMode = item.channelMode as string;

	return {
		identifier_type: item.identifierType,
		identifier_value: item.identifierValue,
		channel_mode: channelMode,
		channel_id: item.channelId ? Number(item.channelId) : undefined,
		content_mode: item.contentMode,
		message_type: item.messageType,
		attachment_type: item.attachmentType,
		text:
			channelMode === 'specific'
				? (item.specificText as string) || undefined
				: (item.text as string) || undefined,
		media_url:
			channelMode === 'specific'
				? (item.specificMediaUrl as string) || undefined
				: (item.mediaUrl as string) || undefined,
		caption:
			channelMode === 'specific'
				? (item.specificCaption as string) || undefined
				: (item.caption as string) || undefined,
		filename:
			channelMode === 'specific'
				? (item.specificFilename as string) || undefined
				: (item.filename as string) || undefined,
		template_id: item.templateId ? Number(item.templateId) : undefined,
		template_variables:
			Object.keys(templateVars).length > 0 ? templateVars : undefined,
	};
}

function parseLabelIds(raw: unknown): number[] {
	if (raw == null || raw === '') return [];
	if (Array.isArray(raw)) {
		return raw
			.map((v) => Number(v))
			.filter((n) => Number.isInteger(n) && n > 0);
	}
	return String(raw)
		.split(',')
		.map((s) => Number(s.trim()))
		.filter((n) => Number.isInteger(n) && n > 0);
}

function optionalString(value: unknown): string | undefined {
	if (value == null) return undefined;
	const s = String(value).trim();
	return s === '' ? undefined : s;
}

async function executeContactOperation(
	ctx: IExecuteFunctions,
	cred: VendsChatCredentials,
	operation: string,
	itemIndex: number,
): Promise<IDataObject> {
	const identifierType = ctx.getNodeParameter('identifierType', itemIndex, '') as string;
	const identifierValue = ctx.getNodeParameter('identifierValue', itemIndex, '') as string;

	if (operation === 'getContact') {
		return vendsChatIntegrationRequest(ctx, cred, '/integrations/contacts/lookup', 'POST', {
			identifier_type: identifierType,
			identifier_value: identifierValue,
		});
	}

	if (operation === 'createContact') {
		return vendsChatIntegrationRequest(ctx, cred, '/integrations/contacts', 'POST', {
			name: optionalString(ctx.getNodeParameter('name', itemIndex, '')),
			phone_number: optionalString(ctx.getNodeParameter('phoneNumber', itemIndex, '')),
			email: optionalString(ctx.getNodeParameter('email', itemIndex, '')),
			note: optionalString(ctx.getNodeParameter('note', itemIndex, '')),
			country: optionalString(ctx.getNodeParameter('country', itemIndex, '')),
			language: optionalString(ctx.getNodeParameter('language', itemIndex, '')),
		});
	}

	if (operation === 'updateContact') {
		return vendsChatIntegrationRequest(ctx, cred, '/integrations/contacts', 'PATCH', {
			identifier_type: identifierType,
			identifier_value: identifierValue,
			name: optionalString(ctx.getNodeParameter('name', itemIndex, '')),
			phone_number: optionalString(ctx.getNodeParameter('updatePhoneNumber', itemIndex, '')),
			email: optionalString(ctx.getNodeParameter('updateEmail', itemIndex, '')),
			note: optionalString(ctx.getNodeParameter('note', itemIndex, '')),
			country: optionalString(ctx.getNodeParameter('country', itemIndex, '')),
			language: optionalString(ctx.getNodeParameter('language', itemIndex, '')),
		});
	}

	if (operation === 'deleteContact') {
		return vendsChatIntegrationRequest(ctx, cred, '/integrations/contacts', 'DELETE', {
			identifier_type: identifierType,
			identifier_value: identifierValue,
		});
	}

	if (operation === 'addContactLabels') {
		return vendsChatIntegrationRequest(ctx, cred, '/integrations/contacts/labels/add', 'POST', {
			identifier_type: identifierType,
			identifier_value: identifierValue,
			label_ids: parseLabelIds(ctx.getNodeParameter('labelIds', itemIndex, [])),
			labels: optionalString(ctx.getNodeParameter('labelNames', itemIndex, '')),
		});
	}

	if (operation === 'removeContactLabels') {
		return vendsChatIntegrationRequest(
			ctx,
			cred,
			'/integrations/contacts/labels/remove',
			'POST',
			{
				identifier_type: identifierType,
				identifier_value: identifierValue,
				label_ids: parseLabelIds(ctx.getNodeParameter('removeLabelIds', itemIndex, [])),
				labels: optionalString(ctx.getNodeParameter('removeLabelNames', itemIndex, '')),
			},
		);
	}

	if (operation === 'upsertContactNote') {
		return vendsChatIntegrationRequest(ctx, cred, '/integrations/contacts/note', 'PUT', {
			identifier_type: identifierType,
			identifier_value: identifierValue,
			note: ctx.getNodeParameter('note', itemIndex, '') as string,
		});
	}

	throw new NodeOperationError(ctx.getNode(), `Operation "${operation}" is not supported`);
}

export class VendsChat implements INodeType {
	description: INodeTypeDescription = {
		displayName: displayNameAction,
		name: 'vendsChat',
		icon: { light: 'file:vendschat.svg', dark: 'file:vendschat.dark.svg' },
		group: ['input'],
		version: 1,
		subtitle: subtitleAction,
		description: descriptionAction,
		defaults: { name: 'Vendschat' },
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		usableAsTool: true,
		credentials: [{ name: 'vendsChatApi', required: true }],
		properties: sendMessageFields,
		codex: vendsChatCodex,
	};

	methods = {
		loadOptions: {
			async getChannels(this: ILoadOptionsFunctions) {
				const cred = (await this.getCredentials('vendsChatApi')) as VendsChatCredentials;
				const res = await vendsChatIntegrationRequest(this, cred, '/integrations/messages/channels');
				const channels = (res.channels as IDataObject[]) ?? [];
				return channels.map((ch) => ({
					name: `${ch.display_name} (${ch.channel_type})`,
					value: String(ch.id),
				}));
			},
			async getTemplates(this: ILoadOptionsFunctions) {
				const cred = (await this.getCredentials('vendsChatApi')) as VendsChatCredentials;
				const channelId = this.getNodeParameter('channelId', 0) as string;
				const res = await vendsChatIntegrationRequest(
					this,
					cred,
					`/integrations/messages/templates?channel_id=${channelId}`,
				);
				const templates = (res.templates as IDataObject[]) ?? [];
				return templates.map((t) => ({
					name: String(t.label ?? t.name),
					value: String(t.id),
				}));
			},
			async getLabels(this: ILoadOptionsFunctions) {
				const cred = (await this.getCredentials('vendsChatApi')) as VendsChatCredentials;
				const res = await vendsChatIntegrationRequest(this, cred, '/integrations/labels');
				const rows = (res.labels as IDataObject[]) ?? [];
				return rows.map((row) => ({
					name: String(row.name || `Label ${row.id}`),
					value: String(row.id),
				}));
			},
		},
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const operation = this.getNodeParameter('operation', 0) as string;
		const cred = (await this.getCredentials('vendsChatApi')) as VendsChatCredentials;
		const items = this.getInputData();
		const out: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			try {
				let response: IDataObject;

				if (operation === 'sendMessage') {
					const payload = buildSendMessagePayload({
						identifierType: this.getNodeParameter('identifierType', i),
						identifierValue: this.getNodeParameter('identifierValue', i),
						channelMode: this.getNodeParameter('channelMode', i),
						contentMode: this.getNodeParameter('contentMode', i),
						text: this.getNodeParameter('text', i),
						attachmentType: this.getNodeParameter('attachmentType', i),
						channelId: this.getNodeParameter('channelId', i, ''),
						messageType: this.getNodeParameter('messageType', i, ''),
						templateId: this.getNodeParameter('templateId', i, ''),
						templateVariables: this.getNodeParameter('templateVariables', i, {}),
						specificText: this.getNodeParameter('specificText', i, ''),
						mediaUrl: this.getNodeParameter('mediaUrl', i, ''),
						specificMediaUrl: this.getNodeParameter('specificMediaUrl', i, ''),
						caption: this.getNodeParameter('caption', i, ''),
						specificCaption: this.getNodeParameter('specificCaption', i, ''),
						filename: this.getNodeParameter('filename', i, ''),
						specificFilename: this.getNodeParameter('specificFilename', i, ''),
					});

					response = await vendsChatIntegrationRequest(
						this,
						cred,
						'/integrations/messages/send',
						'POST',
						payload,
					);
				} else {
					response = await executeContactOperation(this, cred, operation, i);
				}

				out.push({ json: response, pairedItem: { item: i } });
			} catch (error) {
				if (this.continueOnFail()) {
					const message = error instanceof Error ? error.message : String(error);
					out.push({ json: { success: false, error: message }, pairedItem: { item: i } });
					continue;
				}
				throw new NodeOperationError(this.getNode(), error as Error, { itemIndex: i });
			}
		}

		return [out];
	}
}
