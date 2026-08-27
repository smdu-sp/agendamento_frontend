/** @format */

'use server';

import { redirect } from 'next/navigation';
import { IUpdateDivisao, IDivisao, IRespostaDivisao } from '@/types/divisao';
import { auth } from '@/lib/auth/auth';
import { getApiUrl } from '@/lib/api-url';
import { revalidateTag } from 'next/cache';

export async function atualizar(id: string, data: IUpdateDivisao): Promise<IRespostaDivisao> {
	const session = await auth();
	const baseURL = getApiUrl();
	if (!session) redirect('/login');

	const response = await fetch(`${baseURL}divisoes/atualizar/${id}`, {
		method: 'PATCH',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${session?.access_token}`,
		},
		body: JSON.stringify(data),
	});
	const dataResponse = await response.json();
	if (response.status === 200) {
		revalidateTag('divisoes', 'max');
		return { ok: true, error: null, data: dataResponse as IDivisao, status: 200 };
	}
	if (!dataResponse)
		return { ok: false, error: 'Erro ao atualizar divisão.', data: null, status: 500 };
	return { ok: false, error: dataResponse.message, data: null, status: dataResponse.statusCode };
}
