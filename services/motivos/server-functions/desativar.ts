/** @format */

'use client';

import { getApiUrl } from '@/lib/api-url';
import { IRespostaMotivo } from '@/types/motivo';

export async function desativar(
	id: string,
	access_token: string,
): Promise<IRespostaMotivo> {
	const baseURL = getApiUrl();
	try {
		const response: Response = await fetch(`${baseURL}motivos/desativar/${id}`, {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${access_token}`,
			},
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
			error: dataResponse.message || 'Erro ao desativar motivo.',
			data: null,
			status: dataResponse.statusCode || 500,
		};
	} catch (error) {
		return {
			ok: false,
			error: 'Erro ao desativar motivo: ' + error,
			data: null,
			status: 400,
		};
	}
}
