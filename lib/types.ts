import type { IDataObject } from 'n8n-workflow';

/** Unified outbound body shape; server routes to platform adapters. */
export type VendsChatErrorBody = {
	success: false;
	error: { code: string; message: string };
};

type TextualBody = {
	platform: string;
	to: string;
	type: 'text' | 'image' | 'video' | 'audio' | 'location';
	content: IDataObject;
};

type TemplateBody = {
	platform: string;
	to: string;
	type: 'template';
	template: {
		name: string;
		language: string;
		variables?: IDataObject;
	};
};

export type VendsChatSendBody = TextualBody | TemplateBody;
