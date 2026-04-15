/** @format */

import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { validaUsuario } from "@/services/usuarios";
import { usuarioPodeAcessarPedidosPreProjetosArthurSaboya } from "@/lib/pedidos-pre-projetos-arthur-saboya-acesso";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import ListaPedidosPreProjetos from "./_components/lista-pedidos-pre-projetos";

export default async function PedidosPreProjetosArthurSaboyaPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const { ok, data: usuario } = await validaUsuario();
  if (!ok || !usuario || !usuarioPodeAcessarPedidosPreProjetosArthurSaboya(usuario)) {
    redirect("/");
  }

  return (
    <div className="relative w-full px-0 pb-10 md:px-8 md:pb-0">
      <h1 className="mb-2 text-xl font-bold md:text-4xl">
        Pedidos — Pré-projetos (Arthur Saboya)
      </h1>
      <p className="mb-6 text-sm text-muted-foreground md:text-base">
        Solicitações públicas registradas na Sala Arthur Saboya. Acesso restrito
        ao ponto focal da divisão configurada (e administradores).
      </p>
      <Card>
        <CardHeader>
          <CardTitle>Listagem</CardTitle>
          <CardDescription>
            Dados da tabela de solicitações; use a busca para filtrar por nome,
            e-mail, protocolo ou texto da dúvida.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ListaPedidosPreProjetos />
        </CardContent>
      </Card>
    </div>
  );
}
