/** @format */

import { getApiUrl } from '@/lib/api-url';
import { IPaginadoTipoAgendamento, IRespostaTipoAgendamento } from '@/types/tipo-agendamento';

export async function buscarTudo(
	access_token: string,
	pagina: number = 1,
	limite: number = 10,
	busca: string = '',
	status: string = '',
): Promise<IRespostaTipoAgendamento> {
	const baseURL = getApiUrl();
	try {
		const params = new URLSearchParams({
			pagina: pagina.toString(),
			limite: limite.toString(),
			...(busca && { busca }),
			...(status && { status }),
		});

		const res = await fetch(`${baseURL}tipos-agendamento/buscar-tudo?${params}`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${access_token}`,
			},
			next: { tags: ['tipos-agendamento'], revalidate: 60 },
		});
		const data = await res.json();
		if (res.status === 200)
			return {
				ok: true,
				error: null,
				data: data as IPaginadoTipoAgendamento,
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
			error: 'Não foi possível buscar a lista de tipos de agendamento:' + error,
			data: null,
			status: 400,
		};
	}
}
