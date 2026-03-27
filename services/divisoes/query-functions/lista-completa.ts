/** @format */

import { getApiUrl } from '@/lib/api-url';
import { getAuthHeaders } from '@/lib/api-headers';
import { IDivisao, IRespostaDivisao } from '@/types/divisao';

export async function listaCompleta(
	access_token?: string,
	coordenadoriaId?: string,
): Promise<IRespostaDivisao> {
	const baseURL = getApiUrl();
	try {
		const params = coordenadoriaId ? `?coordenadoriaId=${coordenadoriaId}` : '';
		const headers: HeadersInit = {
			'Content-Type': 'application/json',
			...(access_token ? getAuthHeaders(access_token) : {}),
		};
		const resp = await fetch(`${baseURL}divisoes/lista-completa${params}`, {
			method: 'GET',
			headers,
			next: { tags: ['divisoes'], revalidate: 120 },
		});
		const data = await resp.json();
		if (resp.status === 200)
			return { ok: true, error: null, data: data as IDivisao[], status: 200 };
		return { ok: false, error: data.message, data: null, status: data.statusCode };
	} catch (error) {
		return { ok: false, error: 'Não foi possível buscar a lista de divisões: ' + error, data: null, status: 400 };
	}
}
