/** @format */

/** Detalhe de chamado: `/…/pedidos-pre-projetos-arthur-saboya/<slug>` (ex.: protocolo). */
export function isChamadoArthurSaboyaDetalhePath(pathname: string): boolean {
  const parts = pathname.split("/").filter(Boolean);
  const i = parts.indexOf("pedidos-pre-projetos-arthur-saboya");
  return i !== -1 && Boolean(parts[i + 1]);
}
