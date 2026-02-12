/** @format */

import { getApiUrl } from '@/lib/api-url';
import { getAuthHeaders } from '@/lib/api-headers';
import { IPaginadoAgendamento, IRespostaAgendamento } from '@/types/agendamento';

export async function buscarTudo(
	access_token: string,
	pagina: number = 1,
	limite: number = 10,
	busca: string = '',
	status: string = '',
	dataInicio: string = '',
	dataFim: string = '',
	coordenadoriaId: string = '',
	tecnicoId: string = '',
): Promise<IRespostaAgendamento> {
	const baseURL = getApiUrl();
	try {
		const params = new URLSearchParams({
			pagina: pagina.toString(),
			limite: limite.toString(),
			...(busca && { busca }),
			...(status && { status }),
			...(dataInicio && { dataInicio }),
			...(dataFim && { dataFim }),
			...(coordenadoriaId && { coordenadoriaId }),
			...(tecnicoId && { tecnicoId }),
		});

		const agendamentos = await fetch(`${baseURL}agendamentos/buscar-tudo?${params}`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				...getAuthHeaders(access_token),
			},
			next: { tags: ['agendamentos'], revalidate: 60 },
		});
		const data = await agendamentos.json();
		if (agendamentos.status === 200)
			return {
				ok: true,
				error: null,
				data: data as IPaginadoAgendamento,
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
			error: 'Não foi possível buscar a lista de agendamentos:' + error,
			data: null,
			status: 400,
		};
	}
}
