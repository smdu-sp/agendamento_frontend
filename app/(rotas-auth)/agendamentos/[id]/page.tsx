/** @format */

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import * as agendamentoService from "@/services/agendamentos";
import { AppPageShell } from "@/components/layout/app-page-shell";
import { isAdmArthurSaboya } from "@/lib/arthur-saboya-perfis";
import { ROTA_PEDIDOS_ARTHUR_SABOYA } from "@/lib/pedidos-arthur-saboya-route";
import { AgendamentoDetalheView } from "../../_components/agendamento-detalhe-view";

export default async function AgendamentoDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.access_token) redirect("/login");

  if (isAdmArthurSaboya(String(session.usuario?.permissao ?? ""))) {
    redirect(ROTA_PEDIDOS_ARTHUR_SABOYA);
  }

  const { id } = await params;
  const resp = await agendamentoService.buscarPorId(id, session.access_token);
  if (!resp.ok || !resp.data || Array.isArray(resp.data) || !("id" in resp.data)) {
    redirect("/agendamentos");
  }

  return (
    <AppPageShell
      title="Detalhes do Agendamento"
      breadcrumbs={[
        { label: "Agendamentos", href: "/agendamentos" },
        { label: "Detalhes" },
      ]}
    >
      <AgendamentoDetalheView agendamento={resp.data} />
    </AppPageShell>
  );
}
