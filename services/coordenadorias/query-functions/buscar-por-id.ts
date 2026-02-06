/** @format */

import { getApiUrl } from '@/lib/api-url';
import { ICoordenadoria, IRespostaCoordenadoria } from '@/types/coordenadoria';

export async function buscarPorId(
	id: string,
	access_token: string,
): Promise<IRespostaCoordenadoria> {
	const baseURL = getApiUrl();
	try {
		const coordenadoria = await fetch(`${baseURL}coordenadorias/buscar-por-id/${id}`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${access_token}`,
			},
			next: { tags: ['coordenadorias'], revalidate: 120 },
		});
		const data = await coordenadoria.json();
		if (coordenadoria.status === 200)
			return {
				ok: true,
				error: null,
				data: data as ICoordenadoria,
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
			error: 'Não foi possível buscar a coordenadoria:' + error,
			data: null,
			status: 400,
		};
	}
}
