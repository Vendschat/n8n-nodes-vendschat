import type { VendsChatAdapter } from './types';
import { createNoopAdapter } from './baseAdapter';

/** Placeholder: enable when the API exposes LINE. */
export const lineAdapter: VendsChatAdapter = createNoopAdapter('line');
