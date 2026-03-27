/** @format */

import { getApiUrl } from '@/lib/api-url';
import { IPaginadoDivisao, IRespostaDivisao } from '@/types/divisao';

export async function buscarTudo(
	access_token: string,
	pagina: number = 1,
	limite: number = 10,
	busca: string = '',
	status: string = '',
	coordenadoriaId: string = '',
): Promise<IRespostaDivisao> {
	const baseURL = getApiUrl();
	try {
		const params = new URLSearchParams({
			pagina: String(pagina),
			limite: String(limite),
			...(busca && { busca }),
			...(status && { status }),
			...(coordenadoriaId && { coordenadoriaId }),
		});
		const resp = await fetch(`${baseURL}divisoes/buscar-tudo?${params}`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${access_token}`,
			},
			next: { tags: ['divisoes'], revalidate: 120 },
		});
		const data = await resp.json();
		if (resp.status === 200)
			return { ok: true, error: null, data: data as IPaginadoDivisao, status: 200 };
		return { ok: false, error: data.message, data: null, status: data.statusCode };
	} catch (error) {
		return { ok: false, error: 'Não foi possível buscar divisões: ' + error, data: null, status: 400 };
	}
}
