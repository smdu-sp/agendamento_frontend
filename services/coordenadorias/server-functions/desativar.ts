/** @format */

'use server';

import { redirect } from 'next/navigation';
import { IRespostaCoordenadoria } from '@/types/coordenadoria';
import { auth } from '@/lib/auth/auth';
import { revalidateTag } from 'next/cache';

export async function desativar(id: string): Promise<IRespostaCoordenadoria> {
	const session = await auth();
	const baseURL = process.env.NEXT_PUBLIC_API_URL;
	if (!session) redirect('/login');

	const response: Response = await fetch(`${baseURL}coordenadorias/desativar/${id}`, {
		method: 'DELETE',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${session?.access_token}`,
		},
	});
	const dataResponse = await response.json();
	if (response.status === 200) {
		revalidateTag('coordenadorias');
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
			error: 'Erro ao desativar coordenadoria.',
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
