/** @format */

'use server';

import { redirect } from 'next/navigation';
import { ICreateAgendamento, IAgendamento, IRespostaAgendamento } from '@/types/agendamento';
import { auth } from '@/lib/auth/auth';
import { revalidateTag } from 'next/cache';

export async function criar(data: ICreateAgendamento): Promise<IRespostaAgendamento> {
	const session = await auth();
	const baseURL = process.env.NEXT_PUBLIC_API_URL;
	if (!session) redirect(`${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}/login`);

	const response: Response = await fetch(`${baseURL}agendamentos/criar`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${session?.access_token}`,
		},
		body: JSON.stringify(data),
	});
	const dataResponse = await response.json();
	if (response.status === 201) {
		revalidateTag('agendamentos');
		return {
			ok: true,
			error: null,
			data: dataResponse as IAgendamento,
			status: 201,
		};
	}
	if (!dataResponse)
		return {
			ok: false,
			error: 'Erro ao criar novo agendamento.',
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
