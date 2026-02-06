/** @format */

import { getApiUrl } from '@/lib/api-url';
import { IPaginadoMotivo, IRespostaMotivo } from '@/types/motivo';

export async function buscarTudo(
	access_token: string,
	pagina: number = 1,
	limite: number = 10,
	busca: string = '',
	status: string = '',
): Promise<IRespostaMotivo> {
	const baseURL = getApiUrl();
	try {
		const params = new URLSearchParams({
			pagina: pagina.toString(),
			limite: limite.toString(),
			...(busca && { busca }),
			...(status && { status }),
		});

		const motivos = await fetch(`${baseURL}motivos/buscar-tudo?${params}`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${access_token}`,
			},
			next: { tags: ['motivos'], revalidate: 60 },
		});
		const data = await motivos.json();
		if (motivos.status === 200)
			return {
				ok: true,
				error: null,
				data: data as IPaginadoMotivo,
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
