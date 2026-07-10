import type { IDataObject } from 'n8n-workflow';
import type { VendsChatSendBody } from '../types';

/**
 * One adapter per known platform. Unknown platforms use defaultAdapter
 * and pass through, so n8n node UI stays fixed when new channels ship server-side.
 */
export type VendsChatAdapter = {
	/** e.g. whatsapp, instagram */
	readonly id: string;
	/**
	 * Optional validation or normalization of the unified content object before
	 * it is attached to the request body. Server remains source of truth.
	 */
	validateOrNormalizeContent: (
		messageType: VendsChatSendBody['type'],
		content: IDataObject,
	) => void;
};
