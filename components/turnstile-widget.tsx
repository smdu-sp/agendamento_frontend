'use client';

import { Turnstile } from '@marsidev/react-turnstile';

interface TurnstileWidgetProps {
	onTokenChange: (token: string | null) => void;
}

export function TurnstileWidget({ onTokenChange }: TurnstileWidgetProps) {
	const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
	if (!siteKey) return null;

	return (
		<Turnstile
			siteKey={siteKey}
			onSuccess={(token) => onTokenChange(token)}
			onError={() => onTokenChange(null)}
			onExpire={() => onTokenChange(null)}
		/>
	);
}
