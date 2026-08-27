/** @format */

import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
	basePath: "/agendamento",
	output: "standalone",
	outputFileTracingRoot: __dirname,
	images: {
		// Server CPU doesn't support the x86-64-v2 instruction set required by
		// current sharp/libvips prebuilt binaries, so on-the-fly optimization
		// fails at runtime (returns null). Custom loader serves images as-is
		// (with basePath applied) instead of going through /_next/image.
		loader: 'custom',
		loaderFile: './lib/image-loader.ts',
	},
	env: {
		NEXT_PUBLIC_BASE_PATH: '/agendamento'
	},
	/* config options here */
	experimental: {
		serverActions: {
			bodySizeLimit: '10mb',
		},
	},
	allowedDevOrigins: [
		'10.20.4.6',
		'127.0.0.1',
	],
};

export default nextConfig;
