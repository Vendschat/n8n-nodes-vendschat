import type { IDataObject, IHttpRequestMethods } from 'n8n-workflow';
import type { VendsChatCredentials } from './http';
import { normalizeBaseUrl } from './http';

/** Minimal helper surface shared by execute / loadOptions / hook contexts. */
type RequestContext = {
	helpers: {
		// n8n helper this-typing differs across context interfaces; keep loose.
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		httpRequestWithAuthentication: (...args: any[]) => Promise<any>;
	};
};

export async function vendsChatIntegrationRequest(
	ctx: RequestContext,
	cred: VendsChatCredentials,
	path: string,
	method: IHttpRequestMethods = 'GET',
	body?: IDataObject,
): Promise<IDataObject> {
	const baseUrl = normalizeBaseUrl(cred.baseUrl);
	return (await ctx.helpers.httpRequestWithAuthentication.call(
		ctx,
		'vendsChatApi',
		{
			method,
			url: `${baseUrl}${path}`,
			headers: { 'Content-Type': 'application/json' },
			body,
			json: true,
		},
	)) as IDataObject;
}

export const WINDOW_CHECK_HELP =
	'Session messages on WhatsApp, Messenger, and Instagram only work inside the 24-hour window. Add a Check 24-Hour Window step first, or send a WhatsApp Template outside the window.';
