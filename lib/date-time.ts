const SAO_PAULO_TZ = "America/Sao_Paulo";

type DateInput = Date | string | null | undefined;

export function formatarDataHoraSaoPaulo(
  valor: DateInput,
  incluirAs: boolean = false,
): string {
  if (!valor) return "—";
  const data = valor instanceof Date ? valor : new Date(valor);
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
