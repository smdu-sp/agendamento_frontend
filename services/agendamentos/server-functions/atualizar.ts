/** @format */

'use server';

import { redirect } from 'next/navigation';
import { IUpdateAgendamento, IAgendamento, IRespostaAgendamento } from '@/types/agendamento';
import { auth } from '@/lib/auth/auth';
import { getApiUrl } from '@/lib/api-url';
import { revalidateTag } from 'next/cache';

export async function atualizar(
	id: string,
	data: IUpdateAgendamento,
): Promise<IRespostaAgendamento> {
	const session = await auth();
	const baseURL = getApiUrl();
	if (!session) redirect('/login');

	const response: Response = await fetch(`${baseURL}agendamentos/atualizar/${id}`, {
		method: 'PATCH',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${session?.access_token}`,
		},
		body: JSON.stringify(data),
	});
	const dataResponse = await response.json();
	if (response.status === 200) {
		revalidateTag('agendamentos');
		return {
			ok: true,
			error: null,
			data: dataResponse as IAgendamento,
			status: 200,
		};
	}
	if (!dataResponse)
		return {
			ok: false,
			error: 'Erro ao atualizar agendamento.',
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
