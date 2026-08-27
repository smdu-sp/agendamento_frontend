/** @format */

// Custom loader so next/image never calls the /_next/image optimizer (and
// therefore never needs sharp, which fails on this server's CPU). Local
// paths still need the basePath prefix that the default loader would have
// added automatically.
export default function imageLoader({ src }: { src: string; width: number; quality?: number }) {
	if (/^https?:\/\//.test(src)) return src;

	const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
	const path = src.startsWith('/') ? src : `/${src}`;
	return `${basePath}${path}`;
}
