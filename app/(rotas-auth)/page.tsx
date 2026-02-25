/** @format */

import { TableSkeleton } from "@/components/data-table";
import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { IPermissao } from "@/types/usuario";
import * as agendamento from "@/services/agendamentos";
import { IAgendamento } from "@/types/agendamento";
import ImportarPlanilha from "./_components/importar-planilha";
import ListaAgendamentos from "./_components/lista-agendamentos";

function hojeStr(): string {
  const d = new Date();
  const s = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${s(d.getMonth() + 1)}-${s(d.getDate())}`;
}

export default async function HomeSuspense({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  return (
    <Suspense fallback={<TableSkeleton />}>
      <Home searchParams={searchParams} />
    </Suspense>
  );
}

async function Home({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await auth();
  if (!session) {
    redirect("/login");
  }

  const permissao = session.usuario?.permissao;
  const isUsr = permissao as unknown as IPermissao === IPermissao.USR || permissao === "USR";
  if (isUsr) {
    return (
      <div className="w-full relative px-0 md:px-8 pb-10 md:pb-0 flex items-center justify-center min-h-[50vh]">
        <p className="text-xl text-muted-foreground text-center">
          Você não tem permissão para visualizar conteúdo.
        </p>
      </div>
    );
  }

  const sp = await searchParams;
  const hasAnyParam = Object.keys(sp).length > 0;
  const pagina = Number(sp.pagina) || 1;
  const limite = Number(sp.limite) || 10;
  const busca = (sp.busca as string) ?? "";
  const status = (sp.status as string) ?? "";
  const dataInicio = (sp.dataInicio as string) ?? (hasAnyParam ? "" : hojeStr());
  const dataFim = (sp.dataFim as string) ?? (hasAnyParam ? "" : hojeStr());

  let dados: IAgendamento[] = [];
  let total = 0;

  let ultimaImportacao: { dataHora: string; total: number } | null = null;
  if (session.access_token) {
    const response = await agendamento.buscarTudo(
      session.access_token,
      pagina,
      limite,
      busca,
      status,
      dataInicio,
      dataFim,
    );
    if (response.ok && response.data && "data" in response.data) {
      dados = response.data.data ?? [];
      total = response.data.total ?? 0;
    }
    const resUltima = await agendamento.getUltimaImportacaoPlanilha(
      session.access_token,
    );
    if (resUltima.ok && resUltima.data) ultimaImportacao = resUltima.data;
  }

  let titulo = "Agendamentos";
  if (permissao as unknown as IPermissao === IPermissao.TEC) {
    titulo = "Meus Agendamentos";
  } else if (
    permissao as unknown as IPermissao === IPermissao.PONTO_FOCAL ||
    permissao as unknown as IPermissao === IPermissao.COORDENADOR
  ) {
    titulo = "Agendamentos da Coordenadoria";
  }

  return (
    <div className=" w-full relative px-0 md:px-8 pb-10 md:pb-0">
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-xl md:text-4xl font-bold">{titulo}</h1>
        {(session.usuario?.permissao as unknown as IPermissao === IPermissao.ADM ||
          session.usuario?.permissao as unknown as IPermissao === IPermissao.DEV) && (
          <ImportarPlanilha />
        )}
      </div>
      <ListaAgendamentos
        dados={dados}
        total={total}
        pagina={pagina}
        limite={limite}
        busca={busca}
        status={status}
        dataInicio={dataInicio}
        dataFim={dataFim}
        ultimaImportacao={ultimaImportacao}
      />
    </div>
  );
}
