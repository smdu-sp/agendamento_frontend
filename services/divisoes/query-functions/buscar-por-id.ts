/** @format */

import { getApiUrl } from '@/lib/api-url';
import { IDivisao, IRespostaDivisao } from '@/types/divisao';

export async function buscarPorId(id: string, access_token: string): Promise<IRespostaDivisao> {
	const baseURL = getApiUrl();
	try {
		const resp = await fetch(`${baseURL}divisoes/buscar-por-id/${id}`, {
			method: 'GET',
			headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${access_token}` },
			next: { tags: ['divisoes'], revalidate: 120 },
		});
		const data = await resp.json();
		if (resp.status === 200)
			return { ok: true, error: null, data: data as IDivisao, status: 200 };
		return { ok: false, error: data.message, data: null, status: data.statusCode };
	} catch (error) {
		return { ok: false, error: 'Não foi possível buscar a divisão: ' + error, data: null, status: 400 };
	}
}
