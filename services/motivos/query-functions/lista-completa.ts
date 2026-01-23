/** @format */

import { IMotivo, IRespostaMotivo } from '@/types/motivo';

export async function listaCompleta(
	access_token?: string,
): Promise<IRespostaMotivo> {
	const baseURL = process.env.NEXT_PUBLIC_API_URL;
	try {
		const headers: HeadersInit = {
			'Content-Type': 'application/json',
		};
		if (access_token) {
			headers.Authorization = `Bearer ${access_token}`;
		}

		const motivos = await fetch(`${baseURL}motivos/lista-completa`, {
			method: 'GET',
			headers,
			next: { tags: ['motivos'], revalidate: 120 },
		});
		const data = await motivos.json();
		if (motivos.status === 200)
			return {
				ok: true,
				error: null,
				data: data as IMotivo[],
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
			error: 'Não foi possível buscar a lista de motivos:' + error,
			data: null,
			status: 400,
		};
	}
}
