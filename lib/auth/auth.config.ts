/** @format */

import Credentials from 'next-auth/providers/credentials';
import type { NextAuthConfig } from 'next-auth';
import { jwtDecode } from 'jwt-decode';

// URL interna para chamadas server-side (dentro do Docker)
// Fallback para NEXT_PUBLIC_API_URL em dev local.
const RAW_API_URL = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || '';
const API_URL = RAW_API_URL && !RAW_API_URL.endsWith('/') ? `${RAW_API_URL}/` : RAW_API_URL;

export default {
	providers: [
		Credentials({
			name: 'credentials',
			credentials: {
				login: { label: 'Login', type: 'text' },
				senha: { label: 'Senha', type: 'password' },
			},
			type: 'credentials',
			async authorize(credentials) {
				if (!credentials?.login || !credentials?.senha || !API_URL) return null;
				const { login, senha } = credentials;
				try {
					const response = await fetch(`${API_URL}login`, {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({ login, senha }),
					});
					const usuario = await response.json();
					if (usuario && response.ok) return usuario;
				} catch {
					return null;
				}
				return null;
			},
		}),
	],
	callbacks: {
		async jwt({ token, user, trigger, session }) {
			if (trigger === 'update' && session) {
				if (session.usuario) {
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					(token.user as any).usuario.avatar = session.usuario.avatar;
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					(token.user as any).usuario.permissao = session.usuario.permissao;
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					(token.user as any).usuario.nomeSocial = session.usuario.nomeSocial;
					return token;
				}
			}
			if (user) {
				token.user = user;
				return token;
			}

			// Refresh token antes que expire — precisa ser aqui no jwt callback
			// para que os novos tokens sejam persistidos no cookie JWT.
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const userSession = token.user as any;
			if (!userSession?.access_token || !userSession?.refresh_token || !API_URL) {
				return token;
			}

			try {
				const decoded = jwtDecode<{ exp: number }>(userSession.access_token);
				if (decoded.exp * 1000 > Date.now()) {
					return token; // token ainda válido
				}
			} catch {
				return token;
			}

			// access_token expirado — tenta renovar
			try {
				const response = await fetch(`${API_URL}refresh`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ refresh_token: userSession.refresh_token }),
				});
				if (response.ok) {
					const { access_token, refresh_token } = await response.json();
					userSession.access_token = access_token;
					userSession.refresh_token = refresh_token;
					userSession.usuario = jwtDecode(access_token);
				}
			} catch {
				// erro de rede — tenta novamente na próxima requisição
			}

			return token;
		},
		async session({ session, token }) {
			try {
				//eslint-disable-next-line @typescript-eslint/no-explicit-any
				const userSession = token.user as any;
				if (!userSession) {
					return session;
				}
				session = userSession;

				if (session.access_token && !session.usuario) {
					try {
						session.usuario = jwtDecode(session.access_token);
					} catch {
						return session;
					}
				}

				return session;
			} catch {
				return session;
			}
		},
	},
	pages: {
		signIn: '/login',
		error: '/login',
	},
} satisfies NextAuthConfig;
