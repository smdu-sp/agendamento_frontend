/** @format */

import { getApiUrl } from '@/lib/api-url';
import { ITipoAgendamento, IRespostaTipoAgendamento } from '@/types/tipo-agendamento';

export async function listaCompleta(
	access_token?: string,
): Promise<IRespostaTipoAgendamento> {
	const baseURL = getApiUrl();
	try {
		const headers: HeadersInit = {
			'Content-Type': 'application/json',
		};
		if (access_token) {
			headers.Authorization = `Bearer ${access_token}`;
		}

		const res = await fetch(`${baseURL}tipos-agendamento/lista-completa`, {
			method: 'GET',
			headers,
			next: { tags: ['tipos-agendamento'], revalidate: 120 },
		});
		const data = await res.json();
		if (res.status === 200)
			return {
				ok: true,
				error: null,
				data: data as ITipoAgendamento[],
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
