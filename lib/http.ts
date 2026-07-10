import type { IDataObject } from 'n8n-workflow';

export type VendsChatAuthType = 'bearer' | 'xApiKey';

export type VendsChatCredentials = {
	baseUrl: string;
	apiKey: string;
	authType: VendsChatAuthType;
	webhookSecret?: string;
};

export function getVendsChatAuthHeaders(
	cred: VendsChatCredentials,
): IDataObject {
	const h: IDataObject = {
		'Content-Type': 'application/json',
	};
	if (cred.authType === 'xApiKey') {
		h['x-api-key'] = cred.apiKey;
	} else {
		h.Authorization = `Bearer ${cred.apiKey}`;
	}
	return h;
}

export function normalizeBaseUrl(baseUrl: string): string {
	return baseUrl.replace(/\/+$/, '');
}
