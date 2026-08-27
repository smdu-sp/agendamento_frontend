/** @format */

'use server';

import { redirect } from 'next/navigation';
import { IRespostaAgendamento } from '@/types/agendamento';
import { auth } from '@/lib/auth/auth';
import { getApiUrl } from '@/lib/api-url';
import { revalidateTag } from 'next/cache';

export async function importarPlanilhaOutlook(
	formData: FormData,
): Promise<IRespostaAgendamento> {
	const session = await auth();
	const baseURL = getApiUrl();
	if (!session) redirect('/login');

	try {
		const response = await fetch(`${baseURL}agendamentos/importar-planilha-outlook`, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${session?.access_token}`,
			},
			body: formData,
		});

		let dataResponse: unknown;
		try {
			dataResponse = await response.json();
		} catch {
			return {
				ok: false,
				error: `Erro no servidor (${response.status}): Não foi possível processar a resposta`,
				data: null,
				status: response.status || 500,
			};
		}

		if (response.ok && (response.status === 200 || response.status === 201)) {
			revalidateTag('agendamentos', 'max');
			return {
				ok: true,
				error: null,
				data: dataResponse as { importados: number; erros: number; duplicados: number },
				status: response.status,
			};
		}

		const data = dataResponse as { message?: string; error?: string; statusCode?: number };
		const errorMessage = data?.message || data?.error || `Erro ao importar planilha Outlook (${response.status})`;
		return {
			ok: false,
			error: errorMessage,
			data: null,
			status: response.status || data?.statusCode || 500,
		};
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : 'Erro de conexão ao importar planilha Outlook';
		return {
			ok: false,
			error: errorMessage,
			data: null,
			status: 500,
		};
	}
}
