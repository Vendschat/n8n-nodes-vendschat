import type { VendsChatAdapter } from './types';
import { createNoopAdapter } from './baseAdapter';

/** Placeholder: enable when the API exposes Telegram. */
export const telegramAdapter: VendsChatAdapter = createNoopAdapter('telegram');
