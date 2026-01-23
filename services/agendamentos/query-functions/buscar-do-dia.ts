/** @format */

import { IAgendamento, IRespostaAgendamento } from '@/types/agendamento';

export async function buscarDoDia(
	access_token: string,
): Promise<IRespostaAgendamento> {
	const baseURL = process.env.NEXT_PUBLIC_API_URL;
	try {
		const agendamentos = await fetch(`${baseURL}agendamentos/buscar-do-dia`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${access_token}`,
			},
			next: { tags: ['agendamentos'], revalidate: 60 },
		});
		const data = await agendamentos.json();
		if (agendamentos.status === 200)
			return {
				ok: true,
				error: null,
				data: data as IAgendamento[],
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
			error: 'Não foi possível buscar os agendamentos do dia:' + error,
			data: null,
			status: 400,
		};
	}
}
