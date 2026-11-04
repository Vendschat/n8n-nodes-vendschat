import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { buildSendMessagePayload } from './sendMessagePayload';

describe('buildSendMessagePayload', () => {
	it('builds last_interacted text without attachment_type', () => {
		const payload = buildSendMessagePayload({
			identifierType: 'contact_id',
			identifierValue: '42',
			channelMode: 'last_interacted',
			contentMode: 'text',
			text: 'hello',
			attachmentType: '',
		});
		assert.equal(payload.channel_mode, 'last_interacted');
		assert.equal(payload.content_mode, 'text');
		assert.equal(payload.text, 'hello');
		assert.equal(payload.attachment_type, undefined);
	});

	it('includes attachment_type only for attachment content mode', () => {
		const payload = buildSendMessagePayload({
			identifierType: 'contact_id',
			identifierValue: '42',
			channelMode: 'last_interacted',
			contentMode: 'attachment',
			attachmentType: 'image',
			mediaUrl: 'https://example.com/a.jpg',
		});
		assert.equal(payload.attachment_type, 'image');
		assert.equal(payload.media_url, 'https://example.com/a.jpg');
		assert.equal(payload.text, undefined);
	});

	it('uses specific channel fields and defaults message_type to text', () => {
		const payload = buildSendMessagePayload({
			identifierType: 'contact_id',
			identifierValue: '42',
			channelMode: 'specific',
			channelId: '9',
			specificText: 'hi',
		});
		assert.equal(payload.channel_mode, 'specific');
		assert.equal(payload.channel_id, 9);
		assert.equal(payload.message_type, 'text');
		assert.equal(payload.text, 'hi');
		assert.equal(payload.content_mode, undefined);
	});
});
