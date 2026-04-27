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
import { abrirOutlookComposeAgendamentoTecnico } from "@/lib/outlook-agendamento-teams";

/** Converte valor da API (ISO em UTC) para `Date` do instante correto; formata no fuso do navegador. */
const paraDateAgendamento = (data: Date | string): Date =>
  typeof data === "string" ? new Date(data) : data;

const formatarDataHora = (data: Date | string): string => {
  return format(paraDateAgendamento(data), "dd/MM/yyyy 'às' HH:mm");
};

function montarAssuntoEIntervaloIsoOutlook(agend: IAgendamento) {
  const coordenadoriaSigla = agend.coordenadoria?.sigla ?? "";
  const processo = agend.processo ?? "";
  const assunto =
    `Agendamento Técnico - ${coordenadoriaSigla} - Processo: ${processo}`.trim();
  const inicio = paraDateAgendamento(agend.dataHora);
  const fim = agend.dataFim
    ? paraDateAgendamento(agend.dataFim)
    : new Date(inicio.getTime() + 60 * 60 * 1000);
  return {
    assunto,
    inicioIso: inicio.toISOString(),
    fimIso: fim.toISOString(),
  };
}

const PROCESSO_DIGITAL_REGEX = /^\d{4}\.\d{4}\/\d{7}-\d$/;

const isProcessoDigital = (processo?: string): boolean => {
  const valor = (processo || "").trim();
  return PROCESSO_DIGITAL_REGEX.test(valor);
};

const getTipoProcesso = (processo?: string): "Digital" | "Físico" =>
  isProcessoDigital(processo) ? "Digital" : "Físico";

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
    (updates: {
      pagina?: number;
      busca?: string;
      status?: string;
      tipoProcesso?: string;
      dataInicio?: string;
      dataFim?: string;
      /** true = listar todas as datas; false = remove o marcador da URL */
      todasDatas?: boolean;
    }) => {
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
      if (updates.tipoProcesso !== undefined) {
        if (updates.tipoProcesso) params.set("tipoProcesso", updates.tipoProcesso);
        else params.delete("tipoProcesso");
      }
      if (updates.dataInicio !== undefined) {
        if (updates.dataInicio) params.set("dataInicio", updates.dataInicio);
        else params.delete("dataInicio");
      }
      if (updates.dataFim !== undefined) {
        if (updates.dataFim) params.set("dataFim", updates.dataFim);
        else params.delete("dataFim");
      }
      if (updates.todasDatas !== undefined) {
        if (updates.todasDatas) params.set("todasDatas", "1");
        else params.delete("todasDatas");
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

  const tipoProcesso = searchParams.get("tipoProcesso") || "";

  const handleTipoProcessoChange = (valor: string) => {
    atualizarUrl({ tipoProcesso: valor, pagina: 1 });
  };

  useEffect(() => {
    setBuscaInput(busca);
  }, [busca]);

  const handleDataChange = (data: Date | undefined) => {
    if (!data) {
      atualizarUrl({
        dataInicio: "",
        dataFim: "",
        pagina: 1,
        todasDatas: true,
      });
      return;
    }
    const s = (n: number) => String(n).padStart(2, "0");
    const str = `${data.getFullYear()}-${s(data.getMonth() + 1)}-${s(data.getDate())}`;
    atualizarUrl({
      dataInicio: str,
      dataFim: str,
      pagina: 1,
      todasDatas: false,
    });
  };

  const handleLimparFiltros = () => {
    setBuscaInput("");
    atualizarUrl({
      busca: "",
      status: "",
      tipoProcesso: "",
      dataInicio: "",
      dataFim: "",
      pagina: 1,
      todasDatas: true,
    });
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

    const { assunto, inicioIso, fimIso } = montarAssuntoEIntervaloIsoOutlook(agend);
    const emailMunicipe = (agend.email || "").trim();
    const emailTecnico = (agend.tecnico?.email || "").trim();

    abrirOutlookComposeAgendamentoTecnico({
      emailOrganizadorCoordenadoria: emailCoordenadoria,
      assunto,
      inicioIso,
      fimIso,
      emailsParticipantes: [emailMunicipe, emailTecnico],
    });
    setAgendamentoParaConfirmarOutlook(agend);
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
            <span>
              {total} agendamento(s) encontrado(s)
            </span>
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
            {(status || tipoProcesso || dataSelecionada || busca) && (
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

          {/* Filtro de tipo de processo */}
          <div className="flex flex-wrap gap-2 mb-6">
            <Badge
              variant={tipoProcesso === "" ? "default" : "outline"}
              className={cn(
                "cursor-pointer transition-colors select-none",
                tipoProcesso === "" && "bg-primary text-primary-foreground",
              )}
              onClick={() => handleTipoProcessoChange("")}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleTipoProcessoChange("");
                }
              }}
            >
              Todos os processos
            </Badge>
            <Badge
              variant={tipoProcesso === "DIGITAL" ? "default" : "outline"}
              className={cn(
                "cursor-pointer transition-colors select-none",
                tipoProcesso === "DIGITAL" && "bg-primary text-primary-foreground",
              )}
              onClick={() => handleTipoProcessoChange("DIGITAL")}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleTipoProcessoChange("DIGITAL");
                }
              }}
            >
              Digitais
            </Badge>
            <Badge
              variant={tipoProcesso === "FISICO" ? "default" : "outline"}
              className={cn(
                "cursor-pointer transition-colors select-none",
                tipoProcesso === "FISICO" && "bg-primary text-primary-foreground",
              )}
              onClick={() => handleTipoProcessoChange("FISICO")}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleTipoProcessoChange("FISICO");
                }
              }}
            >
              Físicos
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
                      <TableHead>Tipo</TableHead>
                      <TableHead>Divisão</TableHead>
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
                            {getTipoProcesso(agend.processo)}
                          </TableCell>
                          <TableCell>{agend.tecnico?.divisao?.sigla || "-"}</TableCell>
                          <TableCell>
                            {podeAtribuir ? (
                              <div className="flex flex-col gap-1">
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
                              <div className="flex flex-col gap-1">
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
                              </div>
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

                            {(isPontoFocal || isCoordenador || isAdm || isDev) && (
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
