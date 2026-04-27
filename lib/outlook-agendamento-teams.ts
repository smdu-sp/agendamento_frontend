/** @format */

/**
 * Texto legal exibido no corpo do convite (Teams / Outlook Web), com marcações
 * `[n]…[/n]` = negrito e `[l=url]…[/l]` = link.
 */
export function corpoHtmlCondicoesAtendimentoTecnicoOutlook(): string {
  const textoCondicoes =
    "[n]CONDIÇÕES DO ATENDIMENTO - LEIA COM ATENÇÃO![/n]\r\n\r\n" +
    "A realização do atendimento é condicionada à aceitação das condições aqui descritas, nos termos do [l=https://legislacao.prefeitura.sp.gov.br/leis/lei-18375-de-29-de-dezembro-de-2025]artigo 21 da Lei nº 18.375, de 29 de dezembro de 2025[/l], e dos [l=https://legislacao.prefeitura.sp.gov.br/leis/portaria-secretaria-municipal-de-urbanismo-e-licenciamento-smul-167-de-4-de-dezembro-de-2024]artigos 7º e 8º da Portaria SMUL nº 167, de 4 de dezembro de 2024[/l]. \r\n\r\n" +
    "Este atendimento será realizado exclusivamente por meio do Microsoft Teams (para informações sobre o aplicativo, [l=https://statics.teams.cdn.office.net/evergreen-assets/safelinks/2/atp-safelinks.html]acesse aqui[/l]), de maneira remota, asseguradas as disposições da [l=https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/L13709compilado.htm]Lei Geral de Proteção de Dados Pessoais (LGPD).[/l]\r\n\r\n" +
    "O atendimento técnico tem caráter meramente orientativo.\r\n\r\n" +
    "As informações trocadas entre técnico e a parte interessada durante o atendimento técnico [n]não vinculam[/n], sob qualquer hipótese, a análise e a decisão do pedido.\r\n\r\n" +
    "O ingresso e permanência na reunião remota na data e horário programados será considerado como aceitação tácita destas condições.";

  const bodyHtml = textoCondicoes
    .replace(/\[n\]([\s\S]*?)\[\/n\]/g, "<strong>$1</strong>")
    .replace(
      /\[l=([\s\S]*?)\]([\s\S]*?)\[\/l\]/g,
      (_, url: string, text: string) =>
        `<a href="${url.trim().replace(/&/g, "&amp;")}">${text}</a>`,
    )
    .replace(/\r\n\r\n/g, "</p><p>")
    .replace(/\r\n/g, "<br/>");
  return `<p>${bodyHtml}</p>`;
}

export type AbrirOutlookComposeAgendamentoParams = {
  /** E-mail da coordenadoria (calendário / organizador no Outlook Web). */
  emailOrganizadorCoordenadoria: string;
  assunto: string;
  inicioIso: string;
  fimIso: string;
  /** Munícipe + técnico(s); duplicatas removidas. */
  emailsParticipantes: string[];
};

/**
 * Abre o compose do Outlook Web com reunião online (Teams), igual ao fluxo da lista de agendamentos.
 */
export function abrirOutlookComposeAgendamentoTecnico(
  params: AbrirOutlookComposeAgendamentoParams,
): void {
  const org = params.emailOrganizadorCoordenadoria.trim();
  if (!org) return;

  const vistos = new Set<string>();
  const lista: string[] = [];
  for (const e of params.emailsParticipantes) {
    const t = (e || "").trim();
    if (!t) continue;
    const k = t.toLowerCase();
    if (vistos.has(k)) continue;
    vistos.add(k);
    lista.push(t);
  }
  const to = lista.join(",");

  const paramsUrl = new URLSearchParams({
    path: "/calendar/action/compose",
    rru: "addevent",
    startdt: params.inicioIso,
    enddt: params.fimIso,
    subject: params.assunto,
    body: corpoHtmlCondicoesAtendimentoTecnicoOutlook(),
    hideattn: "true",
    online: "true",
  });
  if (to) paramsUrl.set("to", to);

  const emailEncoded = encodeURIComponent(org);
  const url = `https://outlook.office.com/calendar/${emailEncoded}/deeplink/compose?${paramsUrl.toString()}`;
  if (typeof window !== "undefined") {
    window.open(url, "_blank", "noopener,noreferrer");
  }
}
