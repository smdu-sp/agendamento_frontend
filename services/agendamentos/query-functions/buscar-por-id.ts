/** @format */

import { getApiUrl } from '@/lib/api-url';
import { IAgendamento, IRespostaAgendamento } from '@/types/agendamento';

export async function buscarPorId(
	id: string,
	access_token: string,
): Promise<IRespostaAgendamento> {
	const baseURL = getApiUrl();
	try {
		const agendamento = await fetch(`${baseURL}agendamentos/buscar-por-id/${id}`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${access_token}`,
			},
			next: { tags: ['agendamentos'], revalidate: 60 },
		});
		const data = await agendamento.json();
		if (agendamento.status === 200)
			return {
				ok: true,
				error: null,
				data: data as IAgendamento,
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
			error: 'Não foi possível buscar o agendamento:' + error,
			data: null,
			status: 400,
		};
	}
}
