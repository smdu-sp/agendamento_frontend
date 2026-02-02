/** @format */

import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import DashboardContent from "./_components/dashboard-content";

export const metadata = {
  title: "Dashboard | Agendamentos",
  description:
    "Indicadores de agendamentos por mês, ano, realizados e não realizados.",
};

export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect(`${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}/login`);

  const permissao = String(session.usuario?.permissao ?? "");
  const podeVerDashboard =
    permissao === "ADM" ||
    permissao === "DEV" ||
    permissao === "PONTO_FOCAL" ||
    permissao === "COORDENADOR";

  if (!podeVerDashboard) {
    return (
      <div className="w-full relative px-0 md:px-8 pb-10 md:pb-0 flex items-center justify-center min-h-[50vh]">
        <p className="text-xl text-muted-foreground text-center">
          Você não tem permissão para acessar o dashboard.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full relative px-0 md:px-8 pb-10 md:pb-0">
      <h1 className="text-xl md:text-4xl font-bold mb-6">Dashboard</h1>
      <DashboardContent />
    </div>
  );
}
