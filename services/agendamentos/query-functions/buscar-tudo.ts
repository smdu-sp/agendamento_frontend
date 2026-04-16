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
	tipoProcesso: string = '',
	impersonatePermissao?: string,
): Promise<IRespostaAgendamento> {
	const baseURL = getApiUrl();
	if (!baseURL) {
		return {
			ok: false,
			error: 'URL da API não configurada (NEXT_PUBLIC_API_URL).',
			data: null,
			status: 400,
		};
	}
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
			...(tipoProcesso && { tipoProcesso }),
		});

		const url = `${baseURL}agendamentos/buscar-tudo?${params}`;
		const agendamentos = await fetch(url, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				...getAuthHeaders(access_token),
				...(impersonatePermissao
					? { 'X-Impersonate-Permissao': impersonatePermissao }
					: {}),
			},
		});
		let data: { message?: string; statusCode?: number };
		try {
			data = await agendamentos.json();
		} catch {
			return {
				ok: false,
				error: `Resposta inválida da API (status ${agendamentos.status}).`,
				data: null,
				status: agendamentos.status || 400,
			};
		}
		if (agendamentos.status === 200) {
			return {
				ok: true,
				error: null,
				data: data as unknown as IPaginadoAgendamento,
				status: 200,
			};
		}
		return {
			ok: false,
			error: data?.message ?? `Erro ${agendamentos.status}`,
			data: null,
			status: data?.statusCode ?? agendamentos.status ?? 400,
		};
	} catch (error) {
		return {
			ok: false,
			error: 'Não foi possível buscar a lista de agendamentos: ' + (error instanceof Error ? error.message : String(error)),
			data: null,
			status: 400,
		};
	}
}
