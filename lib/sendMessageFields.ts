import type { INodeProperties } from 'n8n-workflow';
import { WINDOW_CHECK_HELP } from './integrationApi';

export const sendMessageFields: INodeProperties[] = [
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
	},
	{
		displayName: 'Identifier Value',
		name: 'identifierValue',
		type: 'string',
		default: '',
		required: true,
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
		description: WINDOW_CHECK_HELP,
	},
	{
		displayName: 'Message Format',
		name: 'contentMode',
		type: 'options',
		displayOptions: { show: { channelMode: ['last_interacted'] } },
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
		displayOptions: {
			show: {
				channelMode: ['last_interacted'],
				contentMode: ['text'],
			},
		},
		default: '',
		required: true,
		description: WINDOW_CHECK_HELP,
	},
	{
		displayName: 'Attachment Type',
		name: 'attachmentType',
		type: 'options',
		displayOptions: {
			show: { channelMode: ['last_interacted'], contentMode: ['attachment'] },
		},
		options: [
			{ name: 'Image', value: 'image' },
			{ name: 'Video', value: 'video' },
			{ name: 'Audio', value: 'audio' },
			{ name: 'File (Document)', value: 'document' },
		],
		default: 'image',
		required: true,
	},
	{
		displayName: 'Channel Name or ID',
		name: 'channelId',
		type: 'options',
		displayOptions: { show: { channelMode: ['specific'] } },
		typeOptions: {
			loadOptionsMethod: 'getChannels',
		},
		default: '',
		required: true,
	},
	{
		displayName: 'WhatsApp Message Type',
		name: 'messageType',
		type: 'options',
		displayOptions: { show: { channelMode: ['specific'] } },
		options: [
			{ name: 'Template', value: 'template' },
			{ name: 'Text', value: 'text' },
			{ name: 'Image', value: 'image' },
			{ name: 'Document', value: 'document' },
			{ name: 'Video', value: 'video' },
			{ name: 'Audio', value: 'audio' },
		],
		default: 'text',
		description: WINDOW_CHECK_HELP,
	},
	{
		displayName: 'Template Name or ID',
		name: 'templateId',
		type: 'options',
		displayOptions: {
			show: { channelMode: ['specific'], messageType: ['template'] },
		},
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
		displayOptions: {
			show: { channelMode: ['specific'], messageType: ['template'] },
		},
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
		displayOptions: {
			show: { channelMode: ['specific'], messageType: ['text'] },
		},
		default: '',
		required: true,
		description: WINDOW_CHECK_HELP,
	},
	{
		displayName: 'Attachment URL',
		name: 'mediaUrl',
		type: 'string',
		displayOptions: {
			show: {
				'/channelMode': ['last_interacted', 'specific'],
				'/contentMode': ['attachment'],
			},
		},
		default: '',
		required: true,
	},
	{
		displayName: 'Attachment URL',
		name: 'specificMediaUrl',
		type: 'string',
		displayOptions: {
			show: {
				channelMode: ['specific'],
				messageType: ['image', 'video', 'audio', 'document'],
			},
		},
		default: '',
		required: true,
		description: WINDOW_CHECK_HELP,
	},
	{
		displayName: 'Caption',
		name: 'caption',
		type: 'string',
		displayOptions: {
			show: {
				'/contentMode': ['attachment'],
				'/attachmentType': ['image', 'video', 'document'],
			},
		},
		default: '',
	},
	{
		displayName: 'Caption',
		name: 'specificCaption',
		type: 'string',
		displayOptions: {
			show: {
				channelMode: ['specific'],
				messageType: ['image', 'video', 'document'],
			},
		},
		default: '',
	},
	{
		displayName: 'File Name',
		name: 'filename',
		type: 'string',
		displayOptions: {
			show: {
				'/attachmentType': ['document'],
				'/contentMode': ['attachment'],
			},
		},
		default: '',
	},
	{
		displayName: 'File Name',
		name: 'specificFilename',
		type: 'string',
		displayOptions: {
			show: { channelMode: ['specific'], messageType: ['document'] },
		},
		default: '',
	},
];
