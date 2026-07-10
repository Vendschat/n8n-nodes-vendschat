import type {
	IDataObject,
	IExecuteFunctions,
	ILoadOptionsFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import {
	displayNameSendMessage,
	nodeDescriptionShortSend,
	vendsChatNodeCodex,
} from '../../lib/productCopy';
import type { VendsChatCredentials } from '../../lib/http';
import { vendsChatIntegrationRequest } from '../../lib/integrationApi';
import { sendMessageFields } from '../../lib/sendMessageFields';

function buildPayload(item: IDataObject): IDataObject {
	const templateVars: Record<string, string> = {};
	const rawVars = item.templateVariables as { variable?: Array<{ key: string; value: string }> };
	for (const row of rawVars?.variable ?? []) {
		if (row.key) templateVars[row.key] = row.value;
	}

	const channelMode = item.channelMode as string;
	const messageType = item.messageType as string | undefined;

	return {
		identifier_type: item.identifierType,
		identifier_value: item.identifierValue,
		channel_mode: channelMode,
		channel_id: item.channelId ? Number(item.channelId) : undefined,
		content_mode: item.contentMode,
		message_type: messageType,
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

export class VendsChatSendMessage implements INodeType {
	description: INodeTypeDescription = {
		displayName: displayNameSendMessage,
		name: 'vendsChatSendMessage',
		icon: 'file:vendschat.svg',
		group: ['transform'],
		version: 2,
		subtitle: '={{$parameter["identifierType"] + ": " + $parameter["identifierValue"]}}',
		description: nodeDescriptionShortSend,
		defaults: { name: displayNameSendMessage },
		inputs: ['main'],
		outputs: ['main'],
		usableAsTool: true,
		credentials: [{ name: 'vendsChatApi', required: true }],
		properties: sendMessageFields,
		codex: vendsChatNodeCodex,
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
		},
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const cred = (await this.getCredentials('vendsChatApi')) as VendsChatCredentials;
		const items = this.getInputData();
		const out: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			try {
				const payload = buildPayload({
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

				const response = await vendsChatIntegrationRequest(
					this,
					cred,
					'/integrations/messages/send',
					'POST',
					payload,
				);

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
