/** @format */

'use server';

import { auth } from '@/lib/auth/auth';
import { getApiUrl } from '@/lib/api-url';
import { revalidateTag } from 'next/cache';
import { redirect } from 'next/navigation';

export async function desativar(id: string) {
	const session = await auth();
	if (!session) redirect('/login');
	const baseURL = getApiUrl();
	const desativado = await fetch(`${baseURL}usuarios/desativar/${id}`, {
		method: 'DELETE',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${session?.access_token}`,
		},
	});
	console.log(desativado);
	const dataResponse = await desativado.json();
	if (desativado.status === 200) {
		revalidateTag('users');
		return {
			ok: true,
			error: null,
			data: dataResponse as { desativado: boolean },
			status: 200,
		};
	}
	if (!dataResponse)
		return {
			ok: false,
			error: 'Erro ao desativar usuário.',
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
