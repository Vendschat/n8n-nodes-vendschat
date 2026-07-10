import type { VendsChatAdapter } from './types';

const noop: VendsChatAdapter['validateOrNormalizeContent'] = () => {
	// no-op: API validates
};

/**
 * Base adapter: shared default for future platforms and server-side–only features.
 */
export const baseAdapter: VendsChatAdapter = {
	id: 'base',
	validateOrNormalizeContent: noop,
};

export function createNoopAdapter(id: string): VendsChatAdapter {
	return { id, validateOrNormalizeContent: noop };
}
