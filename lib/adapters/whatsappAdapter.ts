import { ApplicationError, type IDataObject } from 'n8n-workflow';
import type { VendsChatAdapter } from './types';
import { baseAdapter } from './baseAdapter';

/**
 * WhatsApp adapter — extend here with WA-specific content checks only if the API
 * contract diverges; today the unified `content` object matches the API.
 */
export const whatsappAdapter: VendsChatAdapter = {
	...baseAdapter,
	id: 'whatsapp',
	validateOrNormalizeContent: (messageType, content) => {
		if (messageType === 'text' && (content as IDataObject).text === undefined) {
			throw new ApplicationError('WhatsApp text messages require content.text');
		}
	},
};
