/** @format */

import { getApiUrl } from '@/lib/api-url';
import { IRespostaUsuario } from '@/types/usuario';

export interface ITecnico {
	id: string;
	nome: string;
	login: string;
}

export async function buscarTecnicosPorCoordenadoria(
	coordenadoriaId: string,
	access_token: string,
): Promise<IRespostaUsuario> {
	const baseURL = getApiUrl();
	try {
		const tecnicos = await fetch(`${baseURL}usuarios/buscar-tecnicos-por-coordenadoria/${coordenadoriaId}`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${access_token}`,
			},
			next: { tags: ['tecnicos'], revalidate: 120 },
		});
		const data = await tecnicos.json();
		if (tecnicos.status === 200)
			return {
				ok: true,
				error: null,
				data: data as ITecnico[],
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
			error: 'Não foi possível buscar os técnicos:' + error,
			data: null,
			status: 400,
		};
	}
}
