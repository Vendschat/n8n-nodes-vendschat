import type { VendsChatAdapter } from './types';
import { createNoopAdapter } from './baseAdapter';

export const messengerAdapter: VendsChatAdapter = createNoopAdapter('messenger');
