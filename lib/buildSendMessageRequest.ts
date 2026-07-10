import { ApplicationError, type IDataObject } from 'n8n-workflow';
import { getAdapter } from './adapters';
import type { VendsChatSendBody } from './types';

export type BuildBodyOptions = {
	platform: string;
	recipient: string;
	messageType: 'text' | 'template' | 'image' | 'video' | 'audio' | 'location';
	/** For structured mode */
	textMessage?: string;
	templateName?: string;
	templateLanguage?: string;
	templateVariablesJson?: string;
	/** Media and location (structured) */
	mediaUrl?: string;
	mediaCaption?: string;
	latitude?: number;
	longitude?: number;
	locationName?: string;
	locationAddress?: string;
	/** Full JSON for power users */
	contentOverrideJson?: string;
};

/**
 * Assembles the unified VendsChat send payload. Platform-specific tweaks stay in adapters.
 */
export function buildSendMessageRequestBody(
	options: BuildBodyOptions,
): VendsChatSendBody {
	const adapter = getAdapter(options.platform);
	const { messageType, platform, recipient } = options;
	const to = recipient.trim();
	if (!to) {
		throw new ApplicationError('Recipient (to) is required');
	}

	if (messageType === 'template') {
		if (!options.templateName?.trim()) {
			throw new ApplicationError('Template name is required for template messages');
		}
		if (!options.templateLanguage?.trim()) {
			throw new ApplicationError('Template language (e.g. en_US) is required');
		}
		let variables: IDataObject | undefined;
		if (options.templateVariablesJson?.trim()) {
			variables = parseJsonObject(options.templateVariablesJson, 'Template variables (JSON)');
		}
		const body: VendsChatSendBody = {
			platform,
			to,
			type: 'template',
			template: {
				name: options.templateName.trim(),
				language: options.templateLanguage.trim(),
				...(variables && Object.keys(variables).length > 0 ? { variables } : {}),
			},
		};
		return body;
	}

	if (options.contentOverrideJson?.trim()) {
		const content = parseJsonObject(options.contentOverrideJson, 'Content (JSON object)');
		adapter.validateOrNormalizeContent(messageType, content);
		return { platform, to, type: messageType, content };
	}

	const content: IDataObject = buildStructuredContent(messageType, options);
	adapter.validateOrNormalizeContent(messageType, content);
	return { platform, to, type: messageType, content };
}

function buildStructuredContent(
	messageType: BuildBodyOptions['messageType'],
	options: BuildBodyOptions,
): IDataObject {
	switch (messageType) {
		case 'text':
			if (!options.textMessage?.length) {
				throw new ApplicationError(
					'Text is required for text messages, or set the Content (JSON) override',
				);
			}
			return { text: options.textMessage };
		case 'image':
		case 'video':
		case 'audio':
			if (!options.mediaUrl?.trim()) {
				throw new ApplicationError(
					'Media URL is required for this message type, or set the Content (JSON) override',
				);
			}
			return {
				url: options.mediaUrl.trim(),
				...(options.mediaCaption?.trim() ? { caption: options.mediaCaption.trim() } : {}),
			};
		case 'location':
			if (options.latitude === undefined || options.longitude === undefined) {
				throw new ApplicationError(
					'Latitude and longitude are required, or set the Content (JSON) override',
				);
			}
			return {
				latitude: options.latitude,
				longitude: options.longitude,
				...(options.locationName?.trim() ? { name: options.locationName.trim() } : {}),
				...(options.locationAddress?.trim() ? { address: options.locationAddress.trim() } : {}),
			};
		default: {
			const m: string = messageType;
			throw new ApplicationError(`Unsupported type: ${m}`);
		}
	}
}

function parseJsonObject(json: string, label: string): IDataObject {
	try {
		const v = JSON.parse(json) as unknown;
		if (v === null || typeof v !== 'object' || Array.isArray(v)) {
			throw new ApplicationError('Invalid');
		}
		return v as IDataObject;
	} catch {
		throw new ApplicationError(`${label} must be a JSON object`);
	}
}

/**
 * JSON mode: full request body in unified schema (Zapier/Make style advanced mode).
 */
export function parseAndValidateSendBodyFromJsonString(json: string): VendsChatSendBody {
	const o = parseJsonObject(json, 'Request body (JSON object)');
	if (typeof o.platform !== 'string' || !o.platform.trim()) {
		throw new ApplicationError('platform is required in the JSON body (unified schema)');
	}
	if (typeof o.to !== 'string' || !o.to.trim()) {
		throw new ApplicationError('to (recipient) is required in the JSON body (unified schema)');
	}
	if (typeof o.type !== 'string' || !o.type.trim()) {
		throw new ApplicationError('type is required in the JSON body (unified schema)');
	}

	const t = o.type;
	if (t === 'template') {
		if (!o.template || typeof o.template !== 'object' || Array.isArray(o.template)) {
			throw new ApplicationError('type "template" requires a "template" object in the body');
		}
		const tpl = o.template as IDataObject;
		if (typeof tpl.name !== 'string' || !String(tpl.name).trim()) {
			throw new ApplicationError('template.name is required');
		}
		if (typeof tpl.language !== 'string' || !String(tpl.language).trim()) {
			throw new ApplicationError('template.language is required (e.g. en_US)');
		}
		return o as VendsChatSendBody;
	}

	if (!o.content || typeof o.content !== 'object' || Array.isArray(o.content)) {
		throw new ApplicationError(
			`type "${t}" requires a "content" object in the body (or use type "template" with a "template" object)`,
		);
	}
	const adapter = getAdapter(String(o.platform));
	adapter.validateOrNormalizeContent(t as BuildBodyOptions['messageType'], o.content as IDataObject);
	return o as VendsChatSendBody;
}
