/** @format */

'use server';

import { redirect } from 'next/navigation';
import { IRespostaAgendamento } from '@/types/agendamento';
import { auth } from '@/lib/auth/auth';
import { getApiUrl } from '@/lib/api-url';
import { revalidateTag } from 'next/cache';

export async function excluir(id: string): Promise<IRespostaAgendamento> {
	const session = await auth();
	const baseURL = getApiUrl();
	if (!session) redirect('/login');

	const response: Response = await fetch(`${baseURL}agendamentos/excluir/${id}`, {
		method: 'DELETE',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${session?.access_token}`,
		},
	});
	const dataResponse = await response.json();
	if (response.status === 200) {
		revalidateTag('agendamentos');
		return {
			ok: true,
			error: null,
			data: dataResponse as { excluido: boolean },
			status: 200,
		};
	}
	if (!dataResponse)
		return {
			ok: false,
			error: 'Erro ao excluir agendamento.',
			data: null,
			status: 500,
		};
	return {
		ok: false,
		error: dataResponse.message,
		data: null,
		status: dataResponse.statusCode,
	};
}
