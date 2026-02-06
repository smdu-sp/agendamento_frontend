/** @format */

'use client';

import { getApiUrl } from '@/lib/api-url';
import { IUpdateMotivo, IRespostaMotivo } from '@/types/motivo';

export async function atualizar(
	id: string,
	data: IUpdateMotivo,
	access_token: string,
): Promise<IRespostaMotivo> {
	const baseURL = getApiUrl();
	try {
		const response: Response = await fetch(`${baseURL}motivos/atualizar/${id}`, {
			method: 'PATCH',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${access_token}`,
			},
			body: JSON.stringify(data),
		});
		const dataResponse = await response.json();
		if (response.status === 200) {
			return {
				ok: true,
				error: null,
				data: dataResponse,
				status: 200,
			};
		}
		return {
			ok: false,
			error: dataResponse.message || 'Erro ao atualizar motivo.',
			data: null,
			status: dataResponse.statusCode || 500,
		};
	} catch (error) {
		return {
			ok: false,
			error: 'Erro ao atualizar motivo: ' + error,
			data: null,
			status: 400,
		};
	}
}
