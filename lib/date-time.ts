const SAO_PAULO_TZ = "America/Sao_Paulo";

type DateInput = Date | string | null | undefined;

export function formatarDataHoraSaoPaulo(
  valor: DateInput,
  incluirAs: boolean = false,
): string {
  if (!valor) return "—";
  let data: Date;
  if (valor instanceof Date) {
    data = valor;
  } else {
    // Remove qualquer indicador de fuso e substitui por -03:00 (BRT fixo, sem DST desde 2019),
    // garantindo que a string seja interpretada como horário de São Paulo mesmo em servidores UTC.
    const semFuso = valor.replace('Z', '').replace(/[+-]\d{2}:\d{2}$/, '');
    data = new Date(semFuso + '-03:00');
  }
  if (Number.isNaN(data.getTime())) return "—";

  const partes = new Intl.DateTimeFormat("pt-BR", {
    timeZone: SAO_PAULO_TZ,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(data);

  const dia = partes.find((p) => p.type === "day")?.value ?? "00";
  const mes = partes.find((p) => p.type === "month")?.value ?? "00";
  const ano = partes.find((p) => p.type === "year")?.value ?? "0000";
  const hora = partes.find((p) => p.type === "hour")?.value ?? "00";
  const minuto = partes.find((p) => p.type === "minute")?.value ?? "00";
  const separador = incluirAs ? " às " : " ";
  return `${dia}/${mes}/${ano}${separador}${hora}:${minuto}`;
}
