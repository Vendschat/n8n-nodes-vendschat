import type { IDataObject } from 'n8n-workflow';

function optionalString(value: unknown): string | undefined {
	if (value == null) return undefined;
	const s = String(value).trim();
	return s === '' ? undefined : s;
}

/** Map n8n node parameters → integrations `/messages/send` body. */
export function buildSendMessagePayload(item: IDataObject): IDataObject {
	const templateVars: Record<string, string> = {};
	const rawVars = item.templateVariables as { variable?: Array<{ key: string; value: string }> };
	for (const row of rawVars?.variable ?? []) {
		if (row.key) templateVars[row.key] = row.value;
	}

	const channelMode = String(item.channelMode || 'last_interacted');
	const contentMode = String(item.contentMode || 'text');
	const attachmentType = optionalString(item.attachmentType);
	const isSpecific = channelMode === 'specific';

	const payload: IDataObject = {
		identifier_type: item.identifierType,
		identifier_value: item.identifierValue,
		channel_mode: channelMode,
	};

	if (isSpecific) {
		payload.channel_id = item.channelId ? Number(item.channelId) : undefined;
		payload.message_type = optionalString(item.messageType) ?? 'text';
		payload.text = optionalString(item.specificText);
		payload.media_url = optionalString(item.specificMediaUrl);
		payload.caption = optionalString(item.specificCaption);
		payload.filename = optionalString(item.specificFilename);
		payload.template_id = item.templateId ? Number(item.templateId) : undefined;
		payload.template_variables =
			Object.keys(templateVars).length > 0 ? templateVars : undefined;
		return payload;
	}

	payload.content_mode = contentMode;
	if (contentMode === 'attachment') {
		payload.attachment_type = attachmentType;
		payload.media_url = optionalString(item.mediaUrl);
		payload.caption = optionalString(item.caption);
		payload.filename = optionalString(item.filename);
	} else {
		payload.text = optionalString(item.text);
	}
	return payload;
}
