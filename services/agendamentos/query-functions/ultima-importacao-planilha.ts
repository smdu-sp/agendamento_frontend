/** @format */

import { getApiUrl } from '@/lib/api-url';
import { getAuthHeaders } from '@/lib/api-headers';

export interface IUltimaImportacaoPlanilha {
	dataHora: string;
	total: number;
	usuarioNome?: string | null;
}

export async function getUltimaImportacaoPlanilha(
	access_token: string,
): Promise<{ ok: boolean; data: IUltimaImportacaoPlanilha | null; error?: string }> {
	const baseURL = getApiUrl();
	if (!baseURL) {
		return { ok: false, data: null, error: 'URL da API não configurada.' };
	}
	try {
		const res = await fetch(`${baseURL}agendamentos/ultima-importacao-planilha`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				...getAuthHeaders(access_token),
			},
		});
		const data = await res.json();
		if (res.ok && data !== null && typeof data === 'object') {
			return { ok: true, data: data as IUltimaImportacaoPlanilha };
		}
		return { ok: true, data: null };
	} catch (error) {
		return {
			ok: false,
			data: null,
			error: error instanceof Error ? error.message : 'Erro ao buscar última importação',
		};
	}
}
