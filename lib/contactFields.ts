import type { INodeProperties } from 'n8n-workflow';

function whenOp(
	ops: string[],
	show: Record<string, (string | number | boolean)[]> = {},
): INodeProperties['displayOptions'] {
	return { show: { operation: ops, ...show } };
}

const ADD_LABELS_HELP =
	'Select existing workspace labels, and/or type new names as a comma-separated list (e.g. VIP, Lead). Missing names are created in the workspace and added to the contact. Provide at least one of Labels or Label Names.';

const REMOVE_LABELS_HELP =
	'Select labels to remove from this contact only (workspace labels stay). You can also type comma-separated names or IDs (e.g. VIP, Lead or 1,2). Provide at least one of Labels or Label Names / IDs.';

export const contactFields: INodeProperties[] = [
	{
		displayName: 'Phone Number',
		name: 'phoneNumber',
		type: 'string',
		default: '',
		required: true,
		description: 'E.164 recommended (e.g. +15551234567).',
		displayOptions: whenOp(['createContact']),
	},
	{
		displayName: 'Email',
		name: 'email',
		type: 'string',
		default: '',
		required: true,
		displayOptions: whenOp(['createContact']),
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: whenOp(['createContact']),
		options: [
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Note',
				name: 'note',
				type: 'string',
				typeOptions: { rows: 3 },
				default: '',
			},
			{
				displayName: 'Country',
				name: 'country',
				type: 'string',
				default: '',
				description: 'ISO 3166-1 alpha-2 (e.g. US). Helps parse local phone numbers.',
			},
			{
				displayName: 'Language',
				name: 'language',
				type: 'string',
				default: '',
			},
		],
	},
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: whenOp(['updateContact']),
		options: [
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Phone Number',
				name: 'phoneNumber',
				type: 'string',
				default: '',
				description: 'E.164 recommended (e.g. +15551234567).',
			},
			{
				displayName: 'Email',
				name: 'email',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Note',
				name: 'note',
				type: 'string',
				typeOptions: { rows: 3 },
				default: '',
			},
			{
				displayName: 'Country',
				name: 'country',
				type: 'string',
				default: '',
				description: 'ISO 3166-1 alpha-2 (e.g. US). Helps parse local phone numbers.',
			},
			{
				displayName: 'Language',
				name: 'language',
				type: 'string',
				default: '',
			},
		],
	},
	{
		displayName: 'Note',
		name: 'note',
		type: 'string',
		typeOptions: { rows: 3 },
		default: '',
		required: true,
		displayOptions: whenOp(['upsertContactNote']),
	},
	{
		displayName: 'Labels',
		name: 'labelIds',
		type: 'multiOptions',
		typeOptions: {
			loadOptionsMethod: 'getLabels',
		},
		default: [],
		description: ADD_LABELS_HELP,
		displayOptions: whenOp(['addContactLabels']),
	},
	{
		displayName: 'Label Names',
		name: 'labelNames',
		type: 'string',
		default: '',
		description:
			'Optional. Comma-separated names (e.g. VIP, Lead). Missing names are created in the workspace, then added to the contact.',
		displayOptions: whenOp(['addContactLabels']),
	},
	{
		displayName: 'Labels',
		name: 'removeLabelIds',
		type: 'multiOptions',
		typeOptions: {
			loadOptionsMethod: 'getLabels',
		},
		default: [],
		description: REMOVE_LABELS_HELP,
		displayOptions: whenOp(['removeContactLabels']),
	},
	{
		displayName: 'Label Names or IDs',
		name: 'removeLabelNames',
		type: 'string',
		default: '',
		description:
			'Optional. Comma-separated names or IDs (e.g. VIP, Lead or 1,2). Removes from this contact only.',
		displayOptions: whenOp(['removeContactLabels']),
	},
];

export const contactOperationOptions = [
	{
		name: 'Get Contact',
		value: 'getContact',
		description: 'Find a contact by ID, email, or phone',
		action: 'Get Contact',
	},
	{
		name: 'Create Contact',
		value: 'createContact',
		description: 'Create a contact (phone and email required)',
		action: 'Create Contact',
	},
	{
		name: 'Update Contact',
		value: 'updateContact',
		description: 'Update an existing contact',
		action: 'Update Contact',
	},
	{
		name: 'Delete Contact',
		value: 'deleteContact',
		description: 'Permanently delete a contact',
		action: 'Delete Contact',
	},
	{
		name: 'Add Label(s) to a Contact',
		value: 'addContactLabels',
		description: 'Add labels via dropdown and/or comma-separated names',
		action: 'Add Labels to Contact',
	},
	{
		name: 'Remove Label(s)',
		value: 'removeContactLabels',
		description: 'Remove labels from a contact via dropdown, names, or IDs',
		action: 'Remove Labels from Contact',
	},
	{
		name: 'Add or Update Note',
		value: 'upsertContactNote',
		description: 'Set or replace the note on a contact',
		action: 'Add or Update Note',
	},
];

export const contactIdentifierOperations = [
	'getContact',
	'updateContact',
	'deleteContact',
	'addContactLabels',
	'removeContactLabels',
	'upsertContactNote',
] as const;
