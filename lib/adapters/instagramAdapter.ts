import type { VendsChatAdapter } from './types';
import { createNoopAdapter } from './baseAdapter';

export const instagramAdapter: VendsChatAdapter = createNoopAdapter('instagram');
