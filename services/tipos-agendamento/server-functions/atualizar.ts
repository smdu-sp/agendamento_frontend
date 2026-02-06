/** @format */

'use client';

import { getApiUrl } from '@/lib/api-url';
import { IUpdateTipoAgendamento, IRespostaTipoAgendamento } from '@/types/tipo-agendamento';

export async function atualizar(
	id: string,
	data: IUpdateTipoAgendamento,
	access_token: string,
): Promise<IRespostaTipoAgendamento> {
	const baseURL = getApiUrl();
	try {
		const response: Response = await fetch(`${baseURL}tipos-agendamento/atualizar/${id}`, {
			method: 'PATCH',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${access_token}`,
			},
			body: JSON.stringify(data),
		});
		const dataResponse = await response.json();
		if (response.status === 200) {
			return {
				ok: true,
				error: null,
				data: dataResponse,
				status: 200,
			};
		}
		return {
			ok: false,
			error: dataResponse.message || 'Erro ao atualizar tipo de agendamento.',
			data: null,
			status: dataResponse.statusCode || 500,
		};
	} catch (error) {
		return {
			ok: false,
			error: 'Erro ao atualizar tipo de agendamento: ' + error,
			data: null,
			status: 400,
		};
	}
}
