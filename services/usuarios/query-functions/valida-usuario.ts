/** @format */

import { auth } from "@/lib/auth/auth";
import { getApiUrl } from "@/lib/api-url";
import { IRespostaUsuario, IUsuario } from "@/types/usuario";
import { redirect } from "next/navigation";

function causaRede(error: unknown): string | undefined {
	if (error instanceof Error) {
		const c = error.cause as { code?: string } | undefined;
		return c?.code;
	}
	return undefined;
}

function isErroDeConexao(error: unknown): boolean {
	const code = causaRede(error);
	if (code === "ECONNREFUSED" || code === "ENOTFOUND" || code === "ETIMEDOUT") {
		return true;
	}
	if (error instanceof Error && error.message.includes("fetch failed")) {
		return true;
	}
	return false;
}

function mensagemErro(error: unknown): string {
	if (error instanceof Error) {
		const code = causaRede(error);
		if (code === "ECONNREFUSED") {
			return "Não foi possível conectar à API (servidor recusou a conexão). Verifique se o backend está em execução e se NEXT_PUBLIC_API_URL / INTERNAL_API_URL estão corretos.";
		}
		if (code === "ENOTFOUND") {
			return "Não foi possível resolver o endereço da API. Confira NEXT_PUBLIC_API_URL / INTERNAL_API_URL.";
		}
		return error.message;
	}
	return String(error);
}

/** Monta um IUsuario mínimo a partir do JWT da sessão (quando a API não responde). */
function usuarioFallbackDaSessao(session: any): IUsuario | null {
	const u = session.usuario as Record<string, unknown> | null | undefined;
	if (!u) return null;
	const sub = u.sub;
	const permissao = u.permissao;
	if (sub == null || permissao == null || permissao === "") return null;
	return {
		id: String(sub),
		nome: String(u.nome ?? ""),
		login: String(u.login ?? ""),
		email: String(u.email ?? ""),
		permissao: permissao as IUsuario["permissao"],
		status: Boolean(u.status),
		ultimoLogin: new Date(),
		criadoEm: new Date(),
		atualizadoEm: new Date(),
		avatar: u.avatar != null ? String(u.avatar) : undefined,
		nomeSocial: u.nomeSocial != null ? String(u.nomeSocial) : undefined,
	};
}

export async function validaUsuario(): Promise<IRespostaUsuario> {
	const session = await auth();
	if (!session) redirect("/login");

	const baseURL = getApiUrl();
	const fallback = usuarioFallbackDaSessao(session);

	if (!baseURL) {
		if (fallback) {
			if (process.env.NODE_ENV === "development") {
				console.warn(
					"[validaUsuario] URL da API não configurada; menu usa apenas o token da sessão.",
				);
			}
			return {
				ok: true,
				error: null,
				data: fallback,
				status: 200,
			};
		}
		return {
			ok: false,
			error:
				"URL da API não configurada. Defina NEXT_PUBLIC_API_URL (e, no servidor, INTERNAL_API_URL se aplicável).",
			data: null,
			status: 500,
		};
	}

	try {
		const res = await fetch(`${baseURL}usuarios/valida-usuario`, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${session.access_token}`,
			},
		});

		if (!res.ok) {
			let msg = `Erro HTTP ${res.status}`;
			try {
				const body = (await res.json()) as { message?: string };
				if (body?.message) msg = body.message;
			} catch {
				/* corpo não JSON */
			}
			return {
				ok: false,
				error: msg,
				data: null,
				status: res.status,
			};
		}

		const data = (await res.json()) as IUsuario;
		return {
			ok: true,
			error: null,
			data,
			status: 200,
		};
	} catch (error) {
		if (isErroDeConexao(error) && fallback) {
			if (process.env.NODE_ENV === "development") {
				console.warn(
					"[validaUsuario] API indisponível; menu da sidebar usa dados do token da sessão.",
				);
			}
			return {
				ok: true,
				error: null,
				data: fallback,
				status: 200,
			};
		}

		if (process.env.NODE_ENV === "development") {
			console.warn("[validaUsuario]", mensagemErro(error));
		}

		return {
			ok: false,
			error: mensagemErro(error),
			data: null,
			status: 500,
		};
	}
}
