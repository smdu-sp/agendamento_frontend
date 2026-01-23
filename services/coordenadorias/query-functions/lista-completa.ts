/** @format */

import { ICoordenadoria, IRespostaCoordenadoria } from '@/types/coordenadoria';

export async function listaCompleta(
	access_token?: string,
): Promise<IRespostaCoordenadoria> {
	const baseURL = process.env.NEXT_PUBLIC_API_URL;
	try {
		const headers: HeadersInit = {
			'Content-Type': 'application/json',
		};
		if (access_token) {
			headers.Authorization = `Bearer ${access_token}`;
		}

		const coordenadorias = await fetch(`${baseURL}coordenadorias/lista-completa`, {
			method: 'GET',
			headers,
			next: { tags: ['coordenadorias'], revalidate: 120 },
		});
		const data = await coordenadorias.json();
		if (coordenadorias.status === 200)
			return {
				ok: true,
				error: null,
				data: data as ICoordenadoria[],
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
