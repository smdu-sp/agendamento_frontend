/** @format */

'use server';

import { redirect } from 'next/navigation';
import { ICreateCoordenadoria, ICoordenadoria, IRespostaCoordenadoria } from '@/types/coordenadoria';
import { auth } from '@/lib/auth/auth';
import { revalidateTag } from 'next/cache';

export async function criar(data: ICreateCoordenadoria): Promise<IRespostaCoordenadoria> {
	const session = await auth();
	const baseURL = process.env.NEXT_PUBLIC_API_URL;
	if (!session) redirect(`${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}/login`);

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
