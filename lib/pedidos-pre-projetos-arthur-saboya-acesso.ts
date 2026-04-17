/** @format */

import type { IUsuario } from "@/types/usuario";

/**
 * Quem pode ver a tela interna de pedidos de pré-projetos (Arthur Saboya).
 * DEV: sempre.
 * ADM/PONTO_FOCAL: somente se `divisaoId` = `NEXT_PUBLIC_DIVISAO_ID_PRE_PROJETOS`
 * (mesmo UUID do backend `DIVISAO_ID_PRE_PROJETOS`).
 */
export function usuarioPodeAcessarPedidosPreProjetosArthurSaboya(
  usuario: IUsuario | null,
): boolean {
  if (!usuario?.permissao) return false;
  const p = String(usuario.permissao);
  if (p === "DEV") return true;
  if (p !== "ADM" && p !== "PONTO_FOCAL") return false;
  const envDiv = process.env.NEXT_PUBLIC_DIVISAO_ID_PRE_PROJETOS?.trim();
  if (!envDiv || !usuario.divisaoId) return false;
  return usuario.divisaoId === envDiv;
}
