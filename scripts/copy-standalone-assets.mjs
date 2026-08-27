/** @format */

// next build with output: "standalone" only emits the minimal server + traced
// node_modules into .next/standalone — static assets and env files are not
// copied automatically and must be placed alongside .next/standalone/server.js.
import { cpSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const standaloneDir = join(root, '.next', 'standalone');

if (!existsSync(standaloneDir)) {
	console.warn('[copy-standalone-assets] .next/standalone not found, skipping (is output: "standalone" set?)');
	process.exit(0);
}

const copies = [
	[join(root, 'public'), join(standaloneDir, 'public')],
	[join(root, '.next', 'static'), join(standaloneDir, '.next', 'static')],
	[join(root, '.env'), join(standaloneDir, '.env')],
];

for (const [src, dest] of copies) {
	if (!existsSync(src)) continue;
	cpSync(src, dest, { recursive: true, force: true });
	console.log(`[copy-standalone-assets] copied ${src} -> ${dest}`);
}
