"use client";

import { useState, useCallback, useEffect } from "react";
import { useSession } from "next-auth/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import * as agendamento from "@/services/agendamentos";
import { IAgendamento } from "@/types/agendamento";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import Pagination from "@/components/pagination";
import AtribuirTecnico from "./atribuir-tecnico";
import ConfirmarAtendimento from "./confirmar-atendimento";
import { Pencil, CheckCircle2 } from "lucide-react";
import { StatusAgendamento } from "@/types/agendamento";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { useEffectivePermissao } from "@/providers/ImpersonationProvider";

// Normaliza a data para horário local quando ela foi salva como UTC representando hora local
const normalizarDataLocal = (data: Date | string): Date => {
  const dataObj = typeof data === "string" ? new Date(data) : data;
  // Extrai os componentes UTC e cria uma data local
  const ano = dataObj.getUTCFullYear();
  const mes = dataObj.getUTCMonth();
  const dia = dataObj.getUTCDate();
  const hora = dataObj.getUTCHours();
  const minuto = dataObj.getUTCMinutes();

  // Cria uma nova data local com esses valores
  return new Date(ano, mes, dia, hora, minuto);
};

// Função auxiliar para formatar data/hora corretamente
// Considera que a data foi salva como UTC mas representa hora local
const formatarDataHora = (data: Date | string): string => {
  const dataLocal = normalizarDataLocal(data);
  return format(dataLocal, "dd/MM/yyyy 'às' HH:mm");
};

interface ListaAgendamentosProps {
  dados: IAgendamento[];
  total: number;
  pagina: number;
  limite: number;
  busca: string;
  status: string;
  dataInicio: string;
  dataFim: string;
  ultimaImportacao?: { dataHora: string; total: number; usuarioNome?: string | null } | null;
}

export default function ListaAgendamentos({
  dados: agendamentos,
  total,
  pagina,
  limite,
  busca,
  status,
  dataInicio,
  ultimaImportacao,
}: ListaAgendamentosProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const effectivePermissao = useEffectivePermissao();
  const [agendamentoParaConfirmar, setAgendamentoParaConfirmar] =
    useState<IAgendamento | null>(null);
  const [agendamentoParaConfirmarOutlook, setAgendamentoParaConfirmarOutlook] =
    useState<IAgendamento | null>(null);
  const [confirmandoOutlook, setConfirmandoOutlook] = useState(false);
  const [buscaInput, setBuscaInput] = useState(busca);

  const atualizarUrl = useCallback(
    (updates: { pagina?: number; busca?: string; status?: string; dataInicio?: string; dataFim?: string }) => {
      const params = new URLSearchParams(searchParams.toString());
      if (updates.pagina !== undefined) params.set("pagina", String(updates.pagina));
      if (updates.busca !== undefined) {
        if (updates.busca) params.set("busca", updates.busca);
        else params.delete("busca");
      }
      if (updates.status !== undefined) {
        if (updates.status) params.set("status", updates.status);
        else params.delete("status");
      }
      if (updates.dataInicio !== undefined) {
        if (updates.dataInicio) params.set("dataInicio", updates.dataInicio);
        else params.delete("dataInicio");
      }
      if (updates.dataFim !== undefined) {
        if (updates.dataFim) params.set("dataFim", updates.dataFim);
        else params.delete("dataFim");
      }
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const recarregar = useCallback(() => router.refresh(), [router]);

  const dataSelecionada = dataInicio ? new Date(dataInicio + "T12:00:00") : undefined;

  const handleBusca = (valor: string) => {
    atualizarUrl({ busca: valor, pagina: 1 });
  };

  const handleStatusChange = (valor: string) => {
    atualizarUrl({ status: valor, pagina: 1 });
  };

  useEffect(() => {
    setBuscaInput(busca);
  }, [busca]);

  const handleDataChange = (data: Date | undefined) => {
    if (!data) {
      atualizarUrl({ dataInicio: "", dataFim: "", pagina: 1 });
      return;
    }
    const s = (n: number) => String(n).padStart(2, "0");
    const str = `${data.getFullYear()}-${s(data.getMonth() + 1)}-${s(data.getDate())}`;
    atualizarUrl({ dataInicio: str, dataFim: str, pagina: 1 });
  };

  const handleLimparFiltros = () => {
    setBuscaInput("");
    atualizarUrl({ busca: "", status: "", dataInicio: "", dataFim: "", pagina: 1 });
  };

  const handleAgendarReuniaoOutlook = (agend: IAgendamento) => {
    const emailCoordenadoria = agend.coordenadoria?.email?.trim();
    if (!emailCoordenadoria) {
      toast.error("E-mail da coordenadoria não cadastrado", {
        description:
          "Cadastre o e-mail da coordenadoria na página de Coordenadorias para que o convite seja enviado pela coordenadoria.",
      });
      return;
    }

    const emailMunicipe = agend.email || "";
    const emailTecnico = agend.tecnico?.email ? agend.tecnico.email : "";
    const attendees = [emailMunicipe, emailTecnico].filter(Boolean).join(",");

    const coordenadoriaSigla = agend.coordenadoria?.sigla || "";
    const processo = agend.processo || "";

    const subject =
      `Agendamento Técnico - ${coordenadoriaSigla} - Processo: ${processo}`.trim();

    const inicio = normalizarDataLocal(agend.dataHora);
    const fim = agend.dataFim
      ? normalizarDataLocal(agend.dataFim)
      : new Date(inicio.getTime() + 60 * 60 * 1000);

    const startIso = inicio.toISOString();
    const endIso = fim.toISOString();

    const textoCondicoes =
      "[n]CONDIÇÕES DO ATENDIMENTO - LEIA COM ATENÇÃO![/n]\r\n\r\n" +      
      "A realização do atendimento é condicionada à aceitação das condições aqui descritas, nos termos do [l=https://legislacao.prefeitura.sp.gov.br/leis/lei-18375-de-29-de-dezembro-de-2025]artigo 21 da Lei nº 18.375, de 29 de dezembro de 2025[/l], e dos [l=https://legislacao.prefeitura.sp.gov.br/leis/portaria-secretaria-municipal-de-urbanismo-e-licenciamento-smul-167-de-4-de-dezembro-de-2024]artigos 7º e 8º da Portaria SMUL nº 167, de 4 de dezembro de 2024[/l]. \r\n\r\n" +
      "Este atendimento será realizado exclusivamente por meio do Microsoft Teams (para informações sobre o aplicativo, [l=https://statics.teams.cdn.office.net/evergreen-assets/safelinks/2/atp-safelinks.html]acesse aqui[/l]), de maneira remota e com gravação de seu conteúdo, asseguradas as disposições da [l=https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/L13709compilado.htm]Lei Geral de Proteção de Dados Pessoais (LGPD).[/l]\r\n\r\n" +
      "O atendimento técnico tem caráter meramente orientativo. Sua realização não configura pré-condição e não isenta a parte interessada de responder integralmente ao comunicado ou, conforme o caso, interpor recurso contra indeferimento, dentro dos respectivos prazos legais, sob pena de indeferimento.\r\n\r\n" +
      "As informações trocadas entre técnico e a parte interessada durante o atendimento técnico [n]não vinculam[/n], sob qualquer hipótese, a análise e a decisão do pedido.\r\n\r\n" +
      "O ingresso e permanência na reunião remota na data e horário programados será considerado como aceitação tácita destas condições.";

    // Converte para HTML para o Outlook Web exibir negrito e links
    const bodyHtml = textoCondicoes
      .replace(/\[n\]([\s\S]*?)\[\/n\]/g, "<strong>$1</strong>")
      .replace(
        /\[l=([\s\S]*?)\]([\s\S]*?)\[\/l\]/g,
        (_, url, text) =>
          `<a href="${url.trim().replace(/&/g, "&amp;")}">${text}</a>`
      )
      .replace(/\r\n\r\n/g, "</p><p>")
      .replace(/\r\n/g, "<br/>");
    const body = `<p>${bodyHtml}</p>`;

    const params = new URLSearchParams({
      path: "/calendar/action/compose",
      rru: "addevent",
      startdt: startIso,
      enddt: endIso,
      subject,
      body,
      hideattn: "true", // Oculta a lista de participantes para os convidados (munícipe não vê e-mail do técnico).
      online: "true", // Marca a opção "Reunião do Teams" no formulário do Outlook.
    });
    if (attendees) params.set("to", attendees);

    const emailEncoded = encodeURIComponent(emailCoordenadoria);
    const url = `https://outlook.office.com/calendar/${emailEncoded}/deeplink/compose?${params.toString()}`;

    if (typeof window !== "undefined") {
      window.open(url, "_blank", "noopener,noreferrer");
      setAgendamentoParaConfirmarOutlook(agend);
    }
  };

  const handleConfirmarAgendadoOutlook = async (confirmado: boolean) => {
    if (!agendamentoParaConfirmarOutlook || !session?.access_token) {
      setAgendamentoParaConfirmarOutlook(null);
      return;
    }
    if (confirmado) {
      setConfirmandoOutlook(true);
      try {
        const res = await agendamento.atualizar(
          agendamentoParaConfirmarOutlook.id,
          { status: StatusAgendamento.AGENDADO },
        );
        if (res.ok) recarregar();
      } finally {
        setConfirmandoOutlook(false);
      }
    }
    setAgendamentoParaConfirmarOutlook(null);
  };

  return (
    <div className="flex flex-col gap-5 my-5 w-full">
      <Card>
        <CardHeader>
          <CardTitle>
            Data
            {dataSelecionada && (
              <span className="text-base font-normal text-muted-foreground ml-2">
                -{" "}
                {format(dataSelecionada, "dd 'de' MMMM 'de' yyyy", {
                  locale: ptBR,
                })}
              </span>
            )}
          </CardTitle>
          <CardDescription className="flex flex-col gap-0.5">
            <span>{total} agendamento(s) encontrado(s)</span>
            {ultimaImportacao?.dataHora && (
              <span className="text-muted-foreground text-xs mt-0.5">
                Última importação:{" "}
                {format(new Date(ultimaImportacao.dataHora), "dd/MM/yyyy 'às' HH:mm")}
                {ultimaImportacao.usuarioNome
                  ? ` por ${ultimaImportacao.usuarioNome}`
                  : ""}
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filtros */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            {/* Calendário para selecionar data */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full md:w-[240px] justify-start text-left font-normal",
                    !dataSelecionada && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dataSelecionada ? (
                    format(dataSelecionada, "dd/MM/yyyy", { locale: ptBR })
                  ) : (
                    <span>Selecione uma data</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dataSelecionada}
                  onSelect={handleDataChange}
                  initialFocus
                  locale={ptBR}
                />
              </PopoverContent>
            </Popover>

            <Input
              placeholder="Buscar por munícipe, processo, CPF..."
              value={buscaInput}
              onChange={(e) => setBuscaInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleBusca(buscaInput);
              }}
              className="flex-1"
            />
            {(status || dataSelecionada || busca) && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleLimparFiltros}
                className="w-full md:w-auto"
              >
                Limpar filtros
              </Button>
            )}
          </div>

          {/* Filtros de status com badges */}
          <div className="flex flex-wrap gap-2 mb-6">
            <Badge
              variant={status === "" ? "default" : "outline"}
              className={cn(
                "cursor-pointer transition-colors select-none",
                status === "" && "bg-primary text-primary-foreground",
              )}
              onClick={() => handleStatusChange("")}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleStatusChange("");
                }
              }}
            >
              Todos
            </Badge>
            <Badge
              variant={status === "SOLICITADO" ? "default" : "outline"}
              className={cn(
                "cursor-pointer transition-colors select-none",
                status === "SOLICITADO" && "bg-primary text-primary-foreground",
              )}
              onClick={() => handleStatusChange("SOLICITADO")}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleStatusChange("SOLICITADO");
                }
              }}
            >
              Solicitado
            </Badge>
            <Badge
              variant={status === "AGENDADO" ? "default" : "outline"}
              className={cn(
                "cursor-pointer transition-colors select-none",
                status === "AGENDADO" && "bg-primary text-primary-foreground",
              )}
              onClick={() => handleStatusChange("AGENDADO")}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleStatusChange("AGENDADO");
                }
              }}
            >
              Agendado
            </Badge>
            <Badge
              variant={status === "CONCLUIDO" ? "default" : "outline"}
              className={cn(
                "cursor-pointer transition-colors select-none",
                status === "CONCLUIDO" && "bg-primary text-primary-foreground",
              )}
              onClick={() => handleStatusChange("CONCLUIDO")}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleStatusChange("CONCLUIDO");
                }
              }}
            >
              Concluído
            </Badge>
            <Badge
              variant={status === "CANCELADO" ? "destructive" : "outline"}
              className={cn(
                "cursor-pointer transition-colors select-none",
                status === "CANCELADO" && "bg-destructive text-white",
              )}
              onClick={() => handleStatusChange("CANCELADO")}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleStatusChange("CANCELADO");
                }
              }}
            >
              Cancelado
            </Badge>
            <Badge
              variant={status === "ATENDIDO" ? "success" : "outline"}
              className={cn(
                "cursor-pointer transition-colors select-none",
                status === "ATENDIDO" && "bg-emerald-500 text-white",
              )}
              onClick={() => handleStatusChange("ATENDIDO")}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleStatusChange("ATENDIDO");
                }
              }}
            >
              Atendido
            </Badge>
            <Badge
              variant={status === "NAO_REALIZADO" ? "destructive" : "outline"}
              className={cn(
                "cursor-pointer transition-colors select-none",
                status === "NAO_REALIZADO" && "bg-destructive text-white",
              )}
              onClick={() => handleStatusChange("NAO_REALIZADO")}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleStatusChange("NAO_REALIZADO");
                }
              }}
            >
              Não Realizado
            </Badge>
          </div>

          {agendamentos.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Nenhum agendamento encontrado.
            </p>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data e Hora de início</TableHead>
                      <TableHead>Munícipe</TableHead>
                      <TableHead>CPF</TableHead>
                      <TableHead>Processo</TableHead>
                      <TableHead>Coordenadoria</TableHead>
                      <TableHead>Técnico</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {agendamentos.map((agend) => {
                      const permissao = (effectivePermissao ??
                        session?.usuario?.permissao) as string | undefined;
                      const isPontoFocal = permissao === "PONTO_FOCAL";
                      const isCoordenador = permissao === "COORDENADOR";
                      const isTecnico = permissao === "TEC";
                      const isAdm = permissao === "ADM";
                      const isDev = permissao === "DEV";
                      const semTecnico = !agend.tecnico;
                      // Atribuir/editar técnico: Ponto Focal e Coordenador (quando há coordenadoria); ADM/DEV só quando status Atendido ou Não Realizado
                      const podeAtribuir =
                        !!agend.coordenadoriaId &&
                        (isPontoFocal ||
                          isCoordenador ||
                          ((isAdm || isDev) &&
                            (agend.status === StatusAgendamento.ATENDIDO ||
                              agend.status ===
                                StatusAgendamento.NAO_REALIZADO)));

                      // Verifica se o técnico logado é o técnico do agendamento
                      // O JWT usa 'sub' como campo do ID do usuário
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      const usuarioId = session?.usuario?.sub || (session?.usuario as any)?.id;
                      const tecnicoIdMatch = agend.tecnicoId === usuarioId;

                      // Sem técnico: desabilita ações até o ponto focal atribuir
                      const acoesDesabilitadas = semTecnico;

                      // Pendentes: técnico ainda não confirmou (AGENDADO ou CONCLUIDO)
                      const statusPendente =
                        agend.status === StatusAgendamento.AGENDADO ||
                        agend.status === StatusAgendamento.CONCLUIDO;
                      // Já confirmados: técnico já alterou (ATENDIDO ou NAO_REALIZADO)
                      const statusJaConfirmado =
                        agend.status === StatusAgendamento.ATENDIDO ||
                        agend.status === StatusAgendamento.NAO_REALIZADO;

                      // Confirmar: técnico do agendamento, ou ADM/DEV, ou coordenador quando é o técnico
                      const basePode =
                        (isTecnico || isAdm || isDev || isCoordenador) &&
                        tecnicoIdMatch;
                      const podeConfirmar =
                        basePode && statusPendente && !acoesDesabilitadas;
                      // Alterar: técnico do agendamento OU ADM/DEV/Ponto Focal/Coordenador
                      const podeAlterar =
                        statusJaConfirmado &&
                        !acoesDesabilitadas &&
                        ((isTecnico && tecnicoIdMatch) ||
                          isAdm ||
                          isDev ||
                          isPontoFocal ||
                          isCoordenador);

                      // Agendar reunião: ponto focal, coordenador ou ADM/DEV, com técnico atribuído e status SOLICITADO
                      const podeAgendarReuniao =
                        (isPontoFocal || isCoordenador || isAdm || isDev) &&
                        !semTecnico &&
                        agend.status === StatusAgendamento.SOLICITADO;

                      // Aplica cor de fundo: vermelho para importação Outlook; amarelo para sem técnico/AGENDADO
                      const importadoOutlook = !!agend.importadoOutlook;
                      const deveDestacar =
                        semTecnico ||
                        agend.status === StatusAgendamento.AGENDADO;
                      const rowClassName = importadoOutlook
                        ? "bg-red-100 hover:bg-red-200 text-black"
                        : deveDestacar
                          ? "bg-yellow-100 hover:bg-yellow-200 text-black"
                          : "";

                      return (
                        <TableRow
                          key={agend.id}
                          className={rowClassName}
                        >
                          <TableCell>
                            <span className="text-sm text-muted-foreground">
                              {formatarDataHora(agend.dataHora)}
                            </span>
                          </TableCell>
                          <TableCell>{agend.municipe || "-"}</TableCell>
                          <TableCell>
                            <span className="text-sm font-mono">
                              {agend.cpf}
                            </span>
                          </TableCell>
                          <TableCell>{agend.processo || "-"}</TableCell>
                          <TableCell>
                            {agend.coordenadoria?.sigla || "-"}
                          </TableCell>
                          <TableCell>
                            {podeAtribuir ? (
                              <div className="flex flex-col gap-0.5">
                                <AtribuirTecnico
                                  agendamentoId={agend.id}
                                  coordenadoriaId={agend.coordenadoriaId!}
                                  tecnicoAtual={agend.tecnico}
                                  onSuccess={recarregar}
                                />
                                {agend.importadoOutlook && agend.tecnicoResponsavelPlanilha && !agend.tecnico && (
                                  <span className="text-xs text-muted-foreground">
                                    Planilha: {agend.tecnicoResponsavelPlanilha}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <>
                                {agend.tecnico?.nome || (
                                  agend.tecnicoResponsavelPlanilha ? (
                                    <span className="text-muted-foreground">
                                      Planilha: {agend.tecnicoResponsavelPlanilha}
                                    </span>
                                  ) : (
                                    <span className="text-muted-foreground italic">
                                      Sem técnico
                                    </span>
                                  )
                                )}
                              </>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                agend.status === StatusAgendamento.CONCLUIDO ||
                                agend.status === StatusAgendamento.ATENDIDO
                                  ? "default"
                                  : agend.status ===
                                        StatusAgendamento.CANCELADO ||
                                      agend.status ===
                                        StatusAgendamento.NAO_REALIZADO
                                    ? "destructive"
                                    : "secondary"
                              }
                            >
                              {agend.status === StatusAgendamento.ATENDIDO
                                ? "Atendido"
                                : agend.status ===
                                    StatusAgendamento.NAO_REALIZADO
                                  ? "Não Realizado"
                                  : agend.status === StatusAgendamento.CONCLUIDO
                                    ? "Concluído"
                                    : agend.status ===
                                        StatusAgendamento.CANCELADO
                                      ? "Cancelado"
                                      : agend.status ===
                                          StatusAgendamento.SOLICITADO
                                        ? "Solicitado"
                                        : "Agendado"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {podeConfirmar ? (
                              <Button
                                size="sm"
                                onClick={() =>
                                  setAgendamentoParaConfirmar(agend)
                                }
                                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                              >
                                <CheckCircle2 className="h-4 w-4 mr-1" />
                                Confirmar
                              </Button>
                            ) : podeAlterar ? (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  setAgendamentoParaConfirmar(agend)
                                }
                              >
                                <Pencil className="h-4 w-4 mr-1" />
                                Alterar
                              </Button>
                            ) : null}

                            {(isPontoFocal || isCoordenador) && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="ml-2"
                                disabled={!podeAgendarReuniao}
                                onClick={() => handleAgendarReuniaoOutlook(agend)}
                              >
                                Agendar reunião
                              </Button>
                            )}

                            {!podeConfirmar &&
                              !podeAlterar &&
                              !isPontoFocal &&
                              !isCoordenador && (
                                <span className="text-muted-foreground text-sm">
                                  -
                                </span>
                              )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {total > 0 && (
                <div className="mt-4">
                  <Pagination total={total} pagina={pagina} limite={limite} />
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {agendamentoParaConfirmar && (
        <ConfirmarAtendimento
          agendamento={agendamentoParaConfirmar}
          onClose={() => setAgendamentoParaConfirmar(null)}
          onSuccess={() => {
            setAgendamentoParaConfirmar(null);
            recarregar();
          }}
        />
      )}

      <AlertDialog
        open={!!agendamentoParaConfirmarOutlook}
        onOpenChange={(open) => !open && setAgendamentoParaConfirmarOutlook(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Foi agendado no Outlook?</AlertDialogTitle>
            <AlertDialogDescription>
              O Outlook Web foi aberto com o usuário logado. Após criar a
              reunião no Outlook, confirme aqui para atualizar o status do
              agendamento para &quot;Agendado&quot;.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => handleConfirmarAgendadoOutlook(false)}
              disabled={confirmandoOutlook}
            >
              Não
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleConfirmarAgendadoOutlook(true)}
              disabled={confirmandoOutlook}
            >
              {confirmandoOutlook ? "Atualizando…" : "Sim"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
