/** @format */

'use client';

import { getApiUrl } from '@/lib/api-url';
import { ICreateMotivo, IRespostaMotivo } from '@/types/motivo';

export async function criar(
	data: ICreateMotivo,
	access_token: string,
): Promise<IRespostaMotivo> {
	const baseURL = getApiUrl();
	try {
		const response: Response = await fetch(`${baseURL}motivos/criar`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${access_token}`,
			},
			body: JSON.stringify(data),
		});
		const dataResponse = await response.json();
		if (response.status === 201 || response.status === 200) {
			return {
				ok: true,
				error: null,
				data: dataResponse,
				status: response.status,
			};
		}
		return {
			ok: false,
			error: dataResponse.message || 'Erro ao criar motivo.',
			data: null,
			status: dataResponse.statusCode || 500,
		};
	} catch (error) {
		return {
			ok: false,
			error: 'Erro ao criar motivo: ' + error,
			data: null,
			status: 400,
		};
	}
}
