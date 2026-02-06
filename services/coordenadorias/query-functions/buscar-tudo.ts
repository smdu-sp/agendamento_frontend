/** @format */

import { getApiUrl } from '@/lib/api-url';
import { IPaginadoCoordenadoria, IRespostaCoordenadoria } from '@/types/coordenadoria';

export async function buscarTudo(
	access_token: string,
	pagina: number = 1,
	limite: number = 10,
	busca: string = '',
	status: string = '',
): Promise<IRespostaCoordenadoria> {
	const baseURL = getApiUrl();
	try {
		const coordenadorias = await fetch(
			`${baseURL}coordenadorias/buscar-tudo?pagina=${pagina}&limite=${limite}&busca=${busca}&status=${status}`,
			{
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${access_token}`,
				},
				next: { tags: ['coordenadorias'], revalidate: 120 },
			},
		);
		const data = await coordenadorias.json();
		if (coordenadorias.status === 200)
			return {
				ok: true,
				error: null,
				data: data as IPaginadoCoordenadoria,
				status: 200,
			};
		return {
			ok: false,
			error: data.message,
			data: null,
			status: data.statusCode,
		};
	} catch (error) {
		return {
			ok: false,
			error: 'Não foi possível buscar a lista de coordenadorias:' + error,
			data: null,
			status: 400,
		};
	}
}
