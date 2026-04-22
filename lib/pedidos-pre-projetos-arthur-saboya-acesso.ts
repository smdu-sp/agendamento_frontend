/** @format */

import type { IUsuario } from "@/types/usuario";

/**
 * Quem pode ver a tela interna de pedidos de pré-projetos.
 * DEV/COORDENADOR/PONTO_FOCAL: sempre.
 * ADM: também pode acessar; quando possuir divisão configurada no frontend,
 * mantém-se compatibilidade com o filtro da Sala Arthur Saboya.
 */
export function usuarioPodeAcessarPedidosPreProjetosArthurSaboya(
  usuario: IUsuario | null,
): boolean {
  if (!usuario?.permissao) return false;
  const p = String(usuario.permissao);
  if (p === "DEV") return true;
  if (p === "TEC") {
    const envDiv = process.env.NEXT_PUBLIC_DIVISAO_ID_PRE_PROJETOS?.trim();
    if (!envDiv || !usuario.divisaoId) return false;
    return usuario.divisaoId === envDiv;
  }
  if (p === "COORDENADOR") return true;
  if (p === "PONTO_FOCAL") return true;
  if (p !== "ADM") return false;
  const envDiv = process.env.NEXT_PUBLIC_DIVISAO_ID_PRE_PROJETOS?.trim();
  if (!envDiv || !usuario.divisaoId) return true;
  return usuario.divisaoId === envDiv;
}
