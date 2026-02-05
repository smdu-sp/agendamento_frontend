/** @format */

import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
	basePath: "/agendamento",
	output: "standalone",
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
