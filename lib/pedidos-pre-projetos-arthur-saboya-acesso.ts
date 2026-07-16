/** @format */

import type { IUsuario } from "@/types/usuario";
import {
  isAdministradorSistema,
  isAcessoSomenteArthurSaboya,
  isTecnicoArthurSaboya,
} from "@/lib/arthur-saboya-perfis";

/**
 * Quem pode ver a tela interna de pedidos de pré-projetos.
 * - TEC: pode acessar (a listagem é filtrada por atribuição no fluxo).
 * - ARTHUR_SABOYA / ADM_ARTHUR_SABOYA: acesso aos pedidos da Sala Arthur Saboya.
 * - COORDENADOR/PONTO_FOCAL: acesso com filtro por coordenadoria.
 * - ADM/DEV: acesso total.
 * - ADM_ARTHUR_SABOYA: acesso aos pedidos Arthur (sem agendamentos gerais).
 */
export function usuarioPodeAcessarPedidosPreProjetosArthurSaboya(
  usuario: { permissao?: string | null } | IUsuario | null,
): boolean {
  if (!usuario?.permissao) return false;
  const p = String(usuario.permissao);
  if (p === "DEV" || isAdministradorSistema(p)) return true;
  if (isTecnicoArthurSaboya(p) || p === "TEC_AS") return true;
  if (p === "TEC") return true;
  if (p === "COORDENADOR") return true;
  if (p === "PONTO_FOCAL") return true;
  return false;
}

/** Home/lista de agendamentos gerais bloqueadas; só fluxo Arthur Saboya. */
export function usuarioTemAcessoSomenteArthurSaboya(
  usuario: { permissao?: string | null } | IUsuario | null,
): boolean {
  return isAcessoSomenteArthurSaboya(
    usuario?.permissao ? String(usuario.permissao) : null,
  );
}
