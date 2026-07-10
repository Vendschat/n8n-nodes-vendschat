import type { IDataObject, IHttpRequestMethods } from 'n8n-workflow';
import type { VendsChatCredentials } from './http';
import { getVendsChatAuthHeaders, normalizeBaseUrl } from './http';

export async function vendsChatIntegrationRequest(
	ctx: {
		helpers: {
			request: (opts: IDataObject) => Promise<unknown>;
		};
	},
	cred: VendsChatCredentials,
	path: string,
	method: IHttpRequestMethods = 'GET',
	body?: IDataObject,
): Promise<IDataObject> {
	const baseUrl = normalizeBaseUrl(cred.baseUrl);
	return (await ctx.helpers.request({
		method,
		url: `${baseUrl}${path}`,
		headers: getVendsChatAuthHeaders(cred),
		body,
		json: true,
	})) as IDataObject;
}

export const WINDOW_CHECK_HELP =
	'Session messages on WhatsApp, Messenger, and Instagram only work inside the 24-hour window. Add a Check 24-Hour Window step first, or send a WhatsApp Template outside the window.';
