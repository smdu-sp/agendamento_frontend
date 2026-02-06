/** @format */

'use server';

import { redirect } from 'next/navigation';
import { ICreateCoordenadoria, ICoordenadoria, IRespostaCoordenadoria } from '@/types/coordenadoria';
import { auth } from '@/lib/auth/auth';
import { getApiUrl } from '@/lib/api-url';
import { revalidateTag } from 'next/cache';

export async function criar(data: ICreateCoordenadoria): Promise<IRespostaCoordenadoria> {
	const session = await auth();
	const baseURL = getApiUrl();
	if (!session) redirect('/login');

	const response: Response = await fetch(`${baseURL}coordenadorias/criar`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${session?.access_token}`,
		},
		body: JSON.stringify(data),
	});
	const dataResponse = await response.json();
	if (response.status === 201) {
		revalidateTag('coordenadorias');
		return {
			ok: true,
			error: null,
			data: dataResponse as ICoordenadoria,
			status: 201,
		};
	}
	if (!dataResponse)
		return {
			ok: false,
			error: 'Erro ao criar nova coordenadoria.',
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
