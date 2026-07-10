'use strict';

/**
 * n8n resolves `file:*.svg` next to the compiled `.js`; tsc does not copy assets.
 * Codex: `MyNode.node.json` must sit next to `MyNode.node.js` (n8n docs: Node codex files).
 */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');

function walk(dir, onFile) {
	if (!fs.existsSync(dir)) return;
	for (const name of fs.readdirSync(dir, { withFileTypes: true })) {
		const full = path.join(dir, name.name);
		if (name.isDirectory()) walk(full, onFile);
		else onFile(full);
	}
}

const toCopy = [];
walk(path.join(root, 'nodes'), (f) => {
	if (f.endsWith('.svg') || f.endsWith('.node.json')) toCopy.push(f);
});
walk(path.join(root, 'credentials'), (f) => {
	if (f.endsWith('.svg')) toCopy.push(f);
});

if (toCopy.length === 0) {
	console.error('copy-assets: no .svg or .node.json under nodes/ or credentials/');
	process.exit(1);
}

for (const src of toCopy) {
	const rel = path.relative(root, src);
	const dest = path.join(root, 'dist', rel);
	fs.mkdirSync(path.dirname(dest), { recursive: true });
	fs.copyFileSync(src, dest);
}

console.log(`copy-assets: ${toCopy.length} file(s) -> dist/`);
