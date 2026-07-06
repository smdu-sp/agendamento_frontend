/** @format */

import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { validaUsuario } from "@/services/usuarios";
import { usuarioPodeAcessarPedidosPreProjetosArthurSaboya } from "@/lib/pedidos-pre-projetos-arthur-saboya-acesso";
import { AppPageShell } from "@/components/layout/app-page-shell";
import DashboardArthurSaboyaContent from "./_components/dashboard-arthur-saboya-content";
import type { IUsuario } from "@/types/usuario";

export const metadata = {
  title: "Dashboard Arthur Saboya | Agendamentos",
  description:
    "Indicadores de gestão do fluxo Sala Arthur Saboya — demanda, resolução e gargalos.",
};

export default async function DashboardArthurSaboyaPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const { ok, data: usuario } = await validaUsuario();
  const usuarioLogado =
    usuario &&
    typeof usuario === "object" &&
    "permissao" in usuario &&
    "id" in usuario
      ? (usuario as IUsuario)
      : null;

  if (
    !ok ||
    !usuarioLogado ||
    !usuarioPodeAcessarPedidosPreProjetosArthurSaboya(usuarioLogado)
  ) {
    redirect("/");
  }

  return (
    <AppPageShell
      title="Dashboard Arthur Saboya"
      breadcrumbs={[
        { label: "Pedidos Arthur Saboya", href: "/pedidos-pre-projetos-arthur-saboya" },
        { label: "Dashboard" },
      ]}
    >
      <DashboardArthurSaboyaContent />
    </AppPageShell>
  );
}
