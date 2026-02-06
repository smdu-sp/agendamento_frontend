/** @format */

import { getApiUrl } from '@/lib/api-url';
import { INovoUsuario, IRespostaUsuario } from "@/types/usuario";

export async function buscarNovo(login: string, access_token: string): Promise<IRespostaUsuario> {
	if (!login || login === '')
		return {
			ok: false,
			error: 'Não foi possível buscar o usuário, login vazio.',
			data: null,
			status: 400,
		};

	const baseURL = getApiUrl();
	try {
		const usuarioNovo = await fetch(`${baseURL}usuarios/buscar-novo/${login}`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${access_token}`,
			},
		});
		
		// Tenta fazer parse do JSON, mas trata erros de parsing
		let data: any;
		try {
			data = await usuarioNovo.json();
		} catch (parseError) {
			// Se não conseguir fazer parse, pode ser que a resposta não seja JSON
			return {
				ok: false,
				error: `Erro no servidor (${usuarioNovo.status}): Não foi possível processar a resposta`,
				data: null,
				status: usuarioNovo.status || 500,
			};
		}
		
		if (usuarioNovo.ok && usuarioNovo.status === 200) {
			// Verifica se a resposta tem os campos esperados
			if (data && data.login && data.nome && data.email) {
				return {
					ok: true,
					error: null,
					data: {
						login: data.login,
						nome: data.nome,
						email: data.email,
					} as INovoUsuario,
					status: 200,
				};
			}
		}
		
		// Trata erros do backend com mensagens específicas por status
		let errorMessage: string;
		if (usuarioNovo.status === 401) {
			errorMessage = 'Sua sessão expirou. Por favor, faça login novamente.';
		} else if (usuarioNovo.status === 403) {
			errorMessage = data?.message || data?.error || 'Você não tem permissão para realizar esta ação. É necessário ser Administrador ou Desenvolvedor.';
		} else if (usuarioNovo.status === 404) {
			errorMessage = data?.message || data?.error || 'Usuário não encontrado.';
		} else {
			errorMessage = data?.message || data?.error || `Erro no servidor (${usuarioNovo.status})`;
		}
		
		return {
			ok: false,
			error: errorMessage,
			data: null,
			status: usuarioNovo.status || data?.statusCode || 500,
		};
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		return {
			ok: false,
			error: `Erro de conexão: ${errorMessage}`,
			data: null,
			status: 400,
		};
	}
}
