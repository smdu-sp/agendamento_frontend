/** @format */

'use server';

import { redirect } from 'next/navigation';
import { IRespostaDivisao } from '@/types/divisao';
import { auth } from '@/lib/auth/auth';
import { getApiUrl } from '@/lib/api-url';
import { revalidateTag } from 'next/cache';

export async function desativar(id: string): Promise<IRespostaDivisao> {
	const session = await auth();
	const baseURL = getApiUrl();
	if (!session) redirect('/login');

	const response = await fetch(`${baseURL}divisoes/desativar/${id}`, {
		method: 'DELETE',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${session?.access_token}`,
		},
	});
	const dataResponse = await response.json();
	if (response.status === 200) {
		revalidateTag('divisoes', 'max');
		return { ok: true, error: null, data: dataResponse as { desativado: boolean }, status: 200 };
	}
	if (!dataResponse)
		return { ok: false, error: 'Erro ao desativar divisão.', data: null, status: 500 };
	return { ok: false, error: dataResponse.message, data: null, status: dataResponse.statusCode };
}
