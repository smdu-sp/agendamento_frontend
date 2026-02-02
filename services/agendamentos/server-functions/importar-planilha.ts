/** @format */

'use server';

import { redirect } from 'next/navigation';
import { IRespostaAgendamento } from '@/types/agendamento';
import { auth } from '@/lib/auth/auth';
import { revalidateTag } from 'next/cache';

export async function importarPlanilha(
	formData: FormData,
): Promise<IRespostaAgendamento> {
	const session = await auth();
	const baseURL = process.env.NEXT_PUBLIC_API_URL;
	if (!session) redirect(`${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}/login`);

	try {
		const response: Response = await fetch(`${baseURL}agendamentos/importar-planilha`, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${session?.access_token}`,
			},
			body: formData,
		});

		let dataResponse: any;
		try {
			dataResponse = await response.json();
		} catch (parseError) {
			return {
				ok: false,
				error: `Erro no servidor (${response.status}): Não foi possível processar a resposta`,
				data: null,
				status: response.status || 500,
			};
		}

		if (response.ok && (response.status === 200 || response.status === 201)) {
			revalidateTag('agendamentos');
			return {
				ok: true,
				error: null,
				data: dataResponse as { importados: number; erros: number },
				status: response.status,
			};
		}

		const errorMessage = dataResponse?.message || dataResponse?.error || `Erro ao importar planilha (${response.status})`;
		return {
			ok: false,
			error: errorMessage,
			data: null,
			status: response.status || dataResponse?.statusCode || 500,
		};
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : 'Erro de conexão ao importar planilha';
		return {
			ok: false,
			error: errorMessage,
			data: null,
			status: 500,
		};
	}
}
