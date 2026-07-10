import type { VendsChatAdapter } from './types';
import { baseAdapter } from './baseAdapter';
import { instagramAdapter } from './instagramAdapter';
import { lineAdapter } from './lineAdapter';
import { messengerAdapter } from './messengerAdapter';
import { telegramAdapter } from './telegramAdapter';
import { whatsappAdapter } from './whatsappAdapter';

const byId: Record<string, VendsChatAdapter> = {
	whatsapp: whatsappAdapter,
	instagram: instagramAdapter,
	messenger: messengerAdapter,
	telegram: telegramAdapter,
	line: lineAdapter,
};

export function getAdapter(platform: string): VendsChatAdapter {
	return byId[platform] ?? baseAdapter;
}
