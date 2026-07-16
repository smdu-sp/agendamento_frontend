/** @format */

/** Perfis da Sala Arthur Saboya (técnico e administrador com escopo da sala). */

export const PERFIS_TECNICO_ARTHUR_SABOYA = [
  "ARTHUR_SABOYA",
  "ADM_ARTHUR_SABOYA",
] as const;

export function isTecnicoArthurSaboya(permissao?: string | null): boolean {
  if (!permissao) return false;
  return (PERFIS_TECNICO_ARTHUR_SABOYA as readonly string[]).includes(
    permissao,
  );
}

/** Administrador Arthur Saboya: painel admin + técnico da sala; sem agendamentos normais. */
export function isAdmArthurSaboya(permissao?: string | null): boolean {
  return permissao === "ADM_ARTHUR_SABOYA";
}

/** Apenas ADM global (não inclui Administrador Arthur Saboya). */
export function isAdmGlobal(permissao?: string | null): boolean {
  return permissao === "ADM";
}

/** ADM global ou Administrador Arthur Saboya (menus/APIs administrativas). */
export function isAdministradorSistema(permissao?: string | null): boolean {
  return isAdmGlobal(permissao) || isAdmArthurSaboya(permissao);
}

/**
 * Perfil que não deve ver a lista/home de agendamentos normais —
 * só o fluxo da Sala Arthur Saboya.
 */
export function isAcessoSomenteArthurSaboya(permissao?: string | null): boolean {
  return isAdmArthurSaboya(permissao);
}

export function podeOperarComoStaffArthurSaboya(
  permissao?: string | null,
): boolean {
  return isTecnicoArthurSaboya(permissao);
}

export function usaDivisaoFixaArthurSaboya(permissao?: string | null): boolean {
  return isTecnicoArthurSaboya(permissao);
}

export const STATUS_QUE_PERMITEM_CONCLUSAO_CHAMADO = [
  "SOLICITADO",
  "AGUARDANDO_DATA",
  "AGENDAMENTO_CRIADO",
] as const;

export function statusPermiteConclusaoChamadoArthurSaboya(
  status?: string | null,
): boolean {
  if (!status) return false;
  return (STATUS_QUE_PERMITEM_CONCLUSAO_CHAMADO as readonly string[]).includes(
    status,
  );
}

/** Quem pode marcar chamado/atendimento como solucionado (fechar ticket). */
export function podeConcluirChamadoArthurSaboya(
  permissao?: string | null,
  permissaoReal?: string | null,
): boolean {
  if (permissao === "DEV" || permissaoReal === "DEV") return true;
  return podeOperarComoStaffArthurSaboya(permissao);
}

export function rotuloBotaoConclusaoChamadoArthurSaboya(
  status?: string | null,
): string {
  if (status === "AGENDAMENTO_CRIADO") return "Concluir atendimento";
  if (status === "AGUARDANDO_DATA") return "Encerrar chamado";
  return "Marcar solucionado";
}
