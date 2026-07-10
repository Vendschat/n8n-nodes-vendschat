import path from 'node:path';
import { fileURLToPath } from 'node:url';
import eslint from '@eslint/js';
import { defineConfig } from 'eslint/config';
import jsonPlugin from '@eslint/json';
import { FlatCompat } from '@eslint/eslintrc';
import tseslint from 'typescript-eslint';
import n8nNodesPlugin from 'eslint-plugin-n8n-nodes-base';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const compat = new FlatCompat({
	baseDirectory: __dirname,
	recommendedConfig: eslint.configs.recommended,
	allConfig: eslint.configs.all,
});

const tsFiles = ['nodes/**/*.ts', 'credentials/**/*.ts', 'lib/**/*.ts'];

export default defineConfig(
	{
		ignores: ['dist/**', 'node_modules/**', '**/*.js', 'eslint.config.mjs'],
	},
	{
		files: tsFiles,
		...eslint.configs.recommended,
	},
	...tseslint.configs.recommended.map((config) => ({
		...config,
		files: tsFiles,
	})),
	{
		files: ['lib/**/*.ts'],
		rules: {
			'@typescript-eslint/explicit-function-return-type': 'off',
		},
	},
	{
		plugins: {
			json: jsonPlugin,
		},
	},
	{
		files: ['package.json'],
		language: 'json/json',
		plugins: {
			json: jsonPlugin,
			'n8n-nodes-base': n8nNodesPlugin,
		},
		rules: n8nNodesPlugin.configs.community.rules,
	},
	...compat.extends('plugin:n8n-nodes-base/credentials').map((config) => ({
		...config,
		files: ['credentials/**/*.ts'],
		rules: {
			...config.rules,
			'n8n-nodes-base/cred-class-field-documentation-url-miscased': 'off',
			'n8n-nodes-base/cred-class-field-documentation-url-not-http-url': 'off',
		},
	})),
	...compat.extends('plugin:n8n-nodes-base/nodes').map((config) => ({
		...config,
		files: ['nodes/**/*.ts'],
	})),
);
