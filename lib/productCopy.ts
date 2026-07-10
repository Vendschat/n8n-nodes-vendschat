export const VENDSCHAT_BRAND = 'Vendschat';

/** Parent tile in node search — click to see Trigger + Send Message. */
export const displayNameAction = 'Vendschat';
export const displayNameTrigger = 'Vendschat Trigger';

export const descriptionAction =
	'Send messages and manage contacts on Vendschat (WhatsApp, Instagram, Messenger).';

export const descriptionTrigger =
	'Starts the workflow when a subscribed Vendschat event occurs. Select events inside the node.';

export const subtitleAction = '={{$parameter["operation"]}}';
export const subtitleTrigger = '={{$parameter["events"].length + " event(s)"}}';
