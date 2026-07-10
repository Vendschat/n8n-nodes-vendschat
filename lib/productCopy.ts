import type { CodexData } from 'n8n-workflow';

/**
 * VendsChat product line + node copy (palette & node panel).
 * Aligned with production integration spec: unified send + platform dropdown + API key.
 */
export const VENDSCHAT_TAGLINE = 'VendsChat';

/** Same naming pattern for palette: "VendsChat: …" for trigger and action */
export const displayNameNewMessage = 'VendsChat: WhatsApp, Instagram & Messenger Messages';
export const displayNameSendMessage = 'VendsChat: Send WhatsApp, Instagram & Messenger Messages';

/**
 * n8n standard `description` on the node class — short one-liner for the node creator.
 * Longer copy lives in `description*Full` below.
 */
export const nodeDescriptionShortNewMessage =
	'Expert WhatsApp, Instagram, and Messenger automation with AI + human collaboration at a low price';

export const nodeDescriptionShortSend =
	'Send WhatsApp, Instagram, and Messenger messages with expert AI + human collaboration, templates, and low-cost automation';

/** After node is on canvas, header subtitle (static; safe in node list too) */
export const nodeSubtitleVendsChat = 'Unified action · all channels (API key)';

/** Webhook trigger — long-form (docs / onboarding) */
export const descriptionNewMessageFull = `Trigger workflows instantly when subscribed VendsChat events occur (WhatsApp, Instagram, Messenger). Select events in the node; activation registers this workflow's webhook URL with VendsChat automatically. Requires Growth or Advanced plan.`;

/** Send Message — long-form (unified schema, scalable platforms) */
export const descriptionSendMessageFull = `Send WhatsApp, Instagram, and Messenger messages using text, images, videos, audio, location, or templates. VendsChat is built for expert AI + human collaboration, low-cost automation, and one unified action with platform dropdown and API key auth.`;

/**
 * n8n node creator only shows the one-line `description` when the list item’s
 * subcategory is not `*` (see NodeItem: subcategory `*` forces an empty
 * description for non-credential nodes). A `Core Nodes` subcategory places the
 * node in e.g. “Helpers” with a real subcategory key so the text is visible.
 */
export const vendsChatNodeCodex: CodexData = {
	categories: ['Core Nodes', 'Communication'],
	subcategories: {
		'Core Nodes': ['Helpers'],
	},
	resources: {
		primaryDocumentation: [{ url: 'https://docs.vendschat.com' }],
		credentialDocumentation: [{ url: 'https://docs.vendschat.com/docs/auth' }],
	},
};
