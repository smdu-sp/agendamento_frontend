/** @format */

import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { IPermissao } from "@/types/usuario";
import ImportarPlanilha from "./_components/importar-planilha";
import ListaAgendamentos from "./_components/lista-agendamentos";

export default async function Home() {
  const session = await auth();
  if (!session) {
    redirect("/login");
  }

  // Usuário (USR) não tem permissão para ver nada
  const permissao = session.usuario?.permissao;
  const isUsr = permissao === IPermissao.USR || permissao === "USR";
  if (isUsr) {
    return (
      <div className="w-full relative px-0 md:px-8 pb-10 md:pb-0 flex items-center justify-center min-h-[50vh]">
        <p className="text-xl text-muted-foreground text-center">
          Você não tem permissão para visualizar conteúdo.
        </p>
      </div>
    );
  }

  let titulo = "Agendamentos";
  if (permissao === IPermissao.TEC) {
    titulo = "Meus Agendamentos";
  } else if (
    permissao === IPermissao.PONTO_FOCAL ||
    permissao === IPermissao.COORDENADOR
  ) {
    titulo = "Agendamentos da Coordenadoria";
  }

  return (
    <div className=" w-full relative px-0 md:px-8 pb-10 md:pb-0">
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-xl md:text-4xl font-bold">{titulo}</h1>
        {(session.usuario?.permissao === IPermissao.ADM ||
          session.usuario?.permissao === IPermissao.DEV) && (
          <ImportarPlanilha />
        )}
      </div>
      <ListaAgendamentos />
    </div>
  );
}
