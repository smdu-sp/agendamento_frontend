/** @format */

'use server';

import { redirect } from 'next/navigation';
import { ICreateDivisao, IDivisao, IRespostaDivisao } from '@/types/divisao';
import { auth } from '@/lib/auth/auth';
import { getApiUrl } from '@/lib/api-url';
import { revalidateTag } from 'next/cache';

export async function criar(data: ICreateDivisao): Promise<IRespostaDivisao> {
	const session = await auth();
	const baseURL = getApiUrl();
	if (!session) redirect('/login');

	const response = await fetch(`${baseURL}divisoes/criar`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${session?.access_token}`,
		},
		body: JSON.stringify(data),
	});
	const dataResponse = await response.json();
	if (response.status === 201) {
		revalidateTag('divisoes');
		return { ok: true, error: null, data: dataResponse as IDivisao, status: 201 };
	}
	if (!dataResponse)
		return { ok: false, error: 'Erro ao criar nova divisão.', data: null, status: 500 };
	return { ok: false, error: dataResponse.message, data: null, status: dataResponse.statusCode };
}
