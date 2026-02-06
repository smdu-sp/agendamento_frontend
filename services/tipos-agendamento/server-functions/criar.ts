/** @format */

'use client';

import { getApiUrl } from '@/lib/api-url';
import { ICreateTipoAgendamento, IRespostaTipoAgendamento } from '@/types/tipo-agendamento';

export async function criar(
	data: ICreateTipoAgendamento,
	access_token: string,
): Promise<IRespostaTipoAgendamento> {
	const baseURL = getApiUrl();
	try {
		const response: Response = await fetch(`${baseURL}tipos-agendamento/criar`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${access_token}`,
			},
			body: JSON.stringify(data),
		});
		const dataResponse = await response.json();
		if (response.status === 201 || response.status === 200) {
			return {
				ok: true,
				error: null,
				data: dataResponse,
				status: response.status,
			};
		}
		return {
			ok: false,
			error: dataResponse.message || 'Erro ao criar tipo de agendamento.',
			data: null,
			status: dataResponse.statusCode || 500,
		};
	} catch (error) {
		return {
			ok: false,
			error: 'Erro ao criar tipo de agendamento: ' + error,
			data: null,
			status: 400,
		};
	}
}
