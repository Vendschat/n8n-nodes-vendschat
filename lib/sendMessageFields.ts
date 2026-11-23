import type { INodeProperties } from 'n8n-workflow';
import {
	contactFields,
	contactIdentifierOperations,
	contactOperationOptions,
} from './contactFields';

const WINDOW_NOTICE =
	'Session messages on WhatsApp, Messenger, and Instagram only work inside the 24-hour customer service window. Use a WhatsApp Template outside the window.';

const MESSAGE_OPERATIONS = ['sendMessage', 'scheduleMessage'];

function whenSendMessage(
	show: Record<string, (string | number | boolean)[]>,
): INodeProperties['displayOptions'] {
	return { show: { operation: MESSAGE_OPERATIONS, ...show } };
}

function whenIdentifier(
	show: Record<string, (string | number | boolean)[]> = {},
): INodeProperties['displayOptions'] {
	return {
		show: {
			operation: ['sendMessage', 'scheduleMessage', ...contactIdentifierOperations],
			...show,
		},
	};
}

export const sendMessageFields: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		options: [
			{
				name: 'Send Message',
				value: 'sendMessage',
				description: 'Send a WhatsApp, Instagram, or Messenger message',
				action: 'Send Message',
			},
			{
				name: 'Schedule Message',
				value: 'scheduleMessage',
				description: 'Queue a WhatsApp text or template for later. A session message that fires outside the 24-hour window is suppressed.',
				action: 'Schedule Message',
			},
			...contactOperationOptions,
		],
		default: 'sendMessage',
		required: true,
	},
	{
		displayName: 'Identifier Type',
		name: 'identifierType',
		type: 'options',
		options: [
			{ name: 'Contact ID', value: 'contact_id' },
			{ name: 'Email', value: 'email' },
			{ name: 'Phone Number', value: 'phone_number' },
		],
		default: 'phone_number',
		required: true,
		displayOptions: whenIdentifier(),
	},
	{
		displayName: 'Identifier Value',
		name: 'identifierValue',
		type: 'string',
		default: '',
		required: true,
		description: 'Contact ID, email address, or phone number in E.164 format.',
		displayOptions: whenIdentifier(),
	},
	{
		displayName: 'Channel Type',
		name: 'channelMode',
		type: 'options',
		options: [
			{ name: 'Last Interacted Channel', value: 'last_interacted' },
			{ name: 'Specific Channel', value: 'specific' },
		],
		default: 'last_interacted',
		required: true,
		description: WINDOW_NOTICE,
		displayOptions: whenSendMessage({}),
	},
	{
		displayName: 'Message Format',
		name: 'contentMode',
		type: 'options',
		displayOptions: whenSendMessage({ channelMode: ['last_interacted'] }),
		options: [
			{ name: 'Text', value: 'text' },
			{ name: 'Attachment', value: 'attachment' },
		],
		default: 'text',
		required: true,
	},
	{
		displayName: 'Message Text',
		name: 'text',
		type: 'string',
		typeOptions: { rows: 4 },
		displayOptions: whenSendMessage({
			channelMode: ['last_interacted'],
			contentMode: ['text'],
		}),
		default: '',
		required: true,
	},
	{
		displayName: 'Attachment Type',
		name: 'attachmentType',
		type: 'options',
		displayOptions: whenSendMessage({
			channelMode: ['last_interacted'],
			contentMode: ['attachment'],
		}),
		options: [
			{ name: 'Image', value: 'image' },
			{ name: 'Video', value: 'video' },
			{ name: 'Audio', value: 'audio' },
			{ name: 'Document', value: 'document' },
		],
		default: 'image',
		required: true,
	},
	{
		displayName: 'Attachment URL',
		name: 'mediaUrl',
		type: 'string',
		displayOptions: whenSendMessage({
			channelMode: ['last_interacted'],
			contentMode: ['attachment'],
		}),
		default: '',
		required: true,
	},
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: whenSendMessage({
			channelMode: ['last_interacted'],
			contentMode: ['attachment'],
			attachmentType: ['image', 'video', 'document'],
		}),
		options: [
			{
				displayName: 'Caption',
				name: 'caption',
				type: 'string',
				default: '',
			},
			{
				displayName: 'File Name',
				name: 'filename',
				type: 'string',
				default: '',
				description: 'e.g. invoice.pdf',
				displayOptions: {
					show: {
						'/attachmentType': ['document'],
					},
				},
			},
		],
	},
	{
		displayName: 'Channel Name or ID',
		name: 'channelId',
		type: 'options',
		displayOptions: whenSendMessage({ channelMode: ['specific'] }),
		typeOptions: { loadOptionsMethod: 'getChannels' },
		default: '',
		required: true,
	},
	{
		displayName: 'WhatsApp Message Type',
		name: 'messageType',
		type: 'options',
		displayOptions: whenSendMessage({ channelMode: ['specific'] }),
		options: [
			{ name: 'Template', value: 'template' },
			{ name: 'Text', value: 'text' },
			{ name: 'Image', value: 'image' },
			{ name: 'Document', value: 'document' },
			{ name: 'Video', value: 'video' },
			{ name: 'Audio', value: 'audio' },
		],
		default: 'text',
	},
	{
		displayName: 'Template Name or ID',
		name: 'templateId',
		type: 'options',
		displayOptions: whenSendMessage({
			channelMode: ['specific'],
			messageType: ['template'],
		}),
		typeOptions: {
			loadOptionsDependsOn: ['channelId'],
			loadOptionsMethod: 'getTemplates',
		},
		default: '',
		required: true,
	},
	{
		displayName: 'Template Variables',
		name: 'templateVariables',
		type: 'fixedCollection',
		typeOptions: { multipleValues: true },
		displayOptions: whenSendMessage({
			channelMode: ['specific'],
			messageType: ['template'],
		}),
		default: {},
		options: [
			{
				displayName: 'Variable',
				name: 'variable',
				values: [
					{ displayName: 'Key', name: 'key', type: 'string', default: '' },
					{ displayName: 'Value', name: 'value', type: 'string', default: '' },
				],
			},
		],
	},
	{
		displayName: 'Message Text',
		name: 'specificText',
		type: 'string',
		typeOptions: { rows: 4 },
		displayOptions: whenSendMessage({
			channelMode: ['specific'],
			messageType: ['text'],
		}),
		default: '',
		required: true,
	},
	{
		displayName: 'Media URL',
		name: 'specificMediaUrl',
		type: 'string',
		displayOptions: whenSendMessage({
			channelMode: ['specific'],
			messageType: ['image', 'video', 'audio', 'document'],
		}),
		default: '',
		required: true,
	},
	{
		displayName: 'Options',
		name: 'specificOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: whenSendMessage({
			channelMode: ['specific'],
			messageType: ['image', 'video', 'document'],
		}),
		options: [
			{
				displayName: 'Caption',
				name: 'caption',
				type: 'string',
				default: '',
			},
			{
				displayName: 'File Name',
				name: 'filename',
				type: 'string',
				default: '',
				description: 'e.g. invoice.pdf',
				displayOptions: {
					show: {
						'/messageType': ['document'],
					},
				},
			},
		],
	},
	{
		displayName: 'Schedule Type',
		name: 'scheduleType',
		type: 'options',
		displayOptions: { show: { operation: ['scheduleMessage'] } },
		options: [
			{ name: 'Relative Delay', value: 'relative' },
			{ name: 'Specific Time', value: 'specific' },
		],
		default: 'relative',
		required: true,
		description:
			'A session message that fires outside the 24-hour window is suppressed. Use a template for a later follow-up.',
	},
	{
		displayName: 'Unit',
		name: 'scheduleUnit',
		type: 'options',
		displayOptions: { show: { operation: ['scheduleMessage'], scheduleType: ['relative'] } },
		options: [
			{ name: 'Minutes', value: 'minutes' },
			{ name: 'Hours', value: 'hours' },
			{ name: 'Days', value: 'days' },
		],
		default: 'hours',
		required: true,
	},
	{
		displayName: 'Amount',
		name: 'scheduleAmount',
		type: 'number',
		displayOptions: { show: { operation: ['scheduleMessage'], scheduleType: ['relative'] } },
		default: 2,
		required: true,
		description: 'Counted from the moment this node runs.',
	},
	{
		displayName: 'Wall Clock',
		name: 'wallClock',
		type: 'string',
		displayOptions: { show: { operation: ['scheduleMessage'], scheduleType: ['specific'] } },
		default: '',
		required: true,
		placeholder: '2026-11-23T16:00',
		description: 'Local date and time, without a timezone offset.',
	},
	{
		displayName: 'Timezone',
		name: 'timezone',
		type: 'string',
		displayOptions: { show: { operation: ['scheduleMessage'], scheduleType: ['specific'] } },
		default: 'UTC',
		required: true,
		placeholder: 'Asia/Dhaka',
		description: 'IANA timezone for the wall clock. Example: Asia/Dhaka.',
	},
	{
		displayName: 'Send Only If',
		name: 'noReply',
		type: 'options',
		displayOptions: { show: { operation: ['scheduleMessage'] } },
		options: [
			{ name: 'Send Either Way', value: '' },
			{ name: 'No Reply Since My Last Message', value: 'since_last_message' },
			{ name: 'Never Replied', value: 'never_replied' },
			{ name: 'No Reply Within 20 Minutes', value: '20m' },
			{ name: 'No Reply Within 45 Minutes', value: '45m' },
			{ name: 'No Reply Within 3 Hours', value: '3h' },
			{ name: 'No Reply Within 6 Hours', value: '6h' },
			{ name: 'No Reply Within 12 Hours', value: '12h' },
			{ name: 'No Reply Within 24 Hours', value: '24h' },
			{ name: 'No Reply Within 48 Hours', value: '48h' },
			{ name: 'No Reply Within 72 Hours', value: '72h' },
		],
		default: '',
		description: 'Checked when the message fires, not when this node runs.',
	},
	{
		displayName: 'Label Condition',
		name: 'labelOp',
		type: 'options',
		displayOptions: { show: { operation: ['scheduleMessage'] } },
		options: [
			{ name: 'No Label Condition', value: '' },
			{ name: 'Has Any of These Labels', value: 'include' },
			{ name: 'Has None of These Labels', value: 'exclude' },
		],
		default: '',
	},
	{
		displayName: 'Label Names',
		name: 'scheduleLabelNames',
		type: 'string',
		displayOptions: {
			show: { operation: ['scheduleMessage'], labelOp: ['include', 'exclude'] },
		},
		default: '',
		description: 'Comma-separated label names, checked when the message fires.',
	},
	...contactFields,
];

