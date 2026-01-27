/** @format */

'use client';

import { IRespostaTipoAgendamento } from '@/types/tipo-agendamento';

export async function desativar(
	id: string,
	access_token: string,
): Promise<IRespostaTipoAgendamento> {
	const baseURL = process.env.NEXT_PUBLIC_API_URL;
	try {
		const response: Response = await fetch(`${baseURL}tipos-agendamento/desativar/${id}`, {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${access_token}`,
			},
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
			error: dataResponse.message || 'Erro ao desativar tipo de agendamento.',
			data: null,
			status: dataResponse.statusCode || 500,
		};
	} catch (error) {
		return {
			ok: false,
			error: 'Erro ao desativar tipo de agendamento: ' + error,
			data: null,
			status: 400,
		};
	}
}
