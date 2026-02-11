"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import * as agendamento from "@/services/agendamentos";
import { IAgendamento, IPaginadoAgendamento } from "@/types/agendamento";
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

export default function ListaAgendamentos() {
  const { data: session } = useSession();
  const [agendamentos, setAgendamentos] = useState<IAgendamento[]>([]);
  const [pagina, setPagina] = useState(1);
  const [limite] = useState(10);
  const [total, setTotal] = useState(0);
  const [busca, setBusca] = useState("");
  const [status, setStatus] = useState("");
  const [dataSelecionada, setDataSelecionada] = useState<Date | undefined>(
    () => new Date(),
  );
  const [loading, setLoading] = useState(true);
  const [agendamentoParaConfirmar, setAgendamentoParaConfirmar] =
    useState<IAgendamento | null>(null);
  const [agendamentoParaConfirmarOutlook, setAgendamentoParaConfirmarOutlook] =
    useState<IAgendamento | null>(null);
  const [confirmandoOutlook, setConfirmandoOutlook] = useState(false);

  useEffect(() => {
    carregarAgendamentos();
  }, [pagina, busca, status, dataSelecionada, session]);

  const carregarAgendamentos = async () => {
    if (!session?.access_token) return;

    setLoading(true);
    try {
      // Se há data selecionada, filtra apenas esse dia
      let dataInicio = "";
      let dataFim = "";

      if (dataSelecionada) {
        // Formata a data manualmente para evitar problemas de timezone
        // Usa os componentes locais da data, não UTC
        const ano = dataSelecionada.getFullYear();
        const mes = String(dataSelecionada.getMonth() + 1).padStart(2, "0");
        const dia = String(dataSelecionada.getDate()).padStart(2, "0");

        // Início do dia selecionado (00:00:00)
        dataInicio = `${ano}-${mes}-${dia}`;

        // Fim do dia selecionado (mesmo dia, mas o backend vai usar até 23:59:59)
        dataFim = `${ano}-${mes}-${dia}`;
      }

      const response = await agendamento.buscarTudo(
        session.access_token,
        pagina,
        limite,
        busca,
        status,
        dataInicio,
        dataFim,
      );

      if (response.ok && response.data) {
        const dados = response.data as IPaginadoAgendamento;
        setAgendamentos(dados.data);
        setTotal(dados.total);
      }
    } catch (error) {
      console.error("Erro ao carregar agendamentos:", error);
    } finally {
      setLoading(false);
    }
  };

  const totalPaginas = Math.ceil(total / limite);

  const handleBusca = (valor: string) => {
    setBusca(valor);
    setPagina(1); // Reset para primeira página ao buscar
  };

  const handleStatusChange = (valor: string) => {
    setStatus(valor);
    setPagina(1); // Reset para primeira página ao filtrar
  };

  const handleDataChange = (data: Date | undefined) => {
    setDataSelecionada(data);
    setPagina(1); // Reset para primeira página ao mudar data
  };

  const handleAgendarReuniaoOutlook = (agend: IAgendamento) => {
    const emailMunicipe = agend.email || "";
    const emailTecnico = agend.tecnico?.email ? agend.tecnico.email : "";
    const attendees = [emailMunicipe, emailTecnico].filter(Boolean).join(",");

    const coordenadoriaNome =
      agend.coordenadoria?.nome || agend.coordenadoria?.sigla || "";
    const processo = agend.processo || "";

    const subject =
      `Agendamento Técnico - ${coordenadoriaNome} - Processo: ${processo}`.trim();

    const inicio = normalizarDataLocal(agend.dataHora);
    const fim = agend.dataFim
      ? normalizarDataLocal(agend.dataFim)
      : new Date(inicio.getTime() + 60 * 60 * 1000);

    const startIso = inicio.toISOString();
    const endIso = fim.toISOString();

    const contentLines = [
      "Agendamento técnico",
      "",
      `Munícipe: ${agend.municipe || "-"}`,
      `Processo: ${processo || "-"}`,
      `Coordenadoria: ${coordenadoriaNome || "-"}`,
      `Técnico: ${agend.tecnico?.nome || "-"}`,
      `Tipo: ${agend.tipoAgendamento?.texto || "-"}`,
      "",
      "Observações:",
    ];
    const body = contentLines.join("\r\n");

    const params = new URLSearchParams({
      path: "/calendar/action/compose",
      rru: "addevent",
      startdt: startIso,
      enddt: endIso,
      subject,
      body,
      hideattn: "true", // Oculta a lista de participantes para os convidados (munícipe não vê e-mail do técnico).
    });
    if (attendees) params.set("to", attendees);

    const url = `https://outlook.office.com/calendar/0/deeplink/compose?${params.toString()}`;

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
        if (res.ok) carregarAgendamentos();
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
          <CardDescription>
            {total} agendamento(s) encontrado(s)
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
              value={busca}
              onChange={(e) => handleBusca(e.target.value)}
              className="flex-1"
            />
            {(status || dataSelecionada) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  handleStatusChange("");
                  setDataSelecionada(undefined);
                }}
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

          {loading ? (
            <p className="text-center text-muted-foreground py-8">
              Carregando agendamentos...
            </p>
          ) : agendamentos.length === 0 ? (
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
                      const permissao = session?.usuario?.permissao as
                        | string
                        | undefined;
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

                      // Agendar reunião: ponto focal ou coordenador, com técnico atribuído e status SOLICITADO
                      const podeAgendarReuniao =
                        (isPontoFocal || isCoordenador) &&
                        !semTecnico &&
                        agend.status === StatusAgendamento.SOLICITADO;

                      // Aplica cor de fundo para linhas sem técnico ou com status AGENDADO
                      const deveDestacar =
                        semTecnico ||
                        agend.status === StatusAgendamento.AGENDADO;

                      return (
                        <TableRow
                          key={agend.id}
                          className={deveDestacar ? "bg-yellow-100 hover:bg-yellow-200 text-black" : ""}
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
                              <AtribuirTecnico
                                agendamentoId={agend.id}
                                coordenadoriaId={agend.coordenadoriaId!}
                                tecnicoAtual={agend.tecnico}
                                onSuccess={carregarAgendamentos}
                              />
                            ) : (
                              agend.tecnico?.nome || (
                                <span className="text-muted-foreground italic">
                                  Sem técnico
                                </span>
                              )
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

              {/* Paginação */}
              {totalPaginas > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    Página {pagina} de {totalPaginas}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPagina((p) => Math.max(1, p - 1))}
                      disabled={pagina === 1 || loading}
                    >
                      Anterior
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setPagina((p) => Math.min(totalPaginas, p + 1))
                      }
                      disabled={pagina === totalPaginas || loading}
                    >
                      Próxima
                    </Button>
                  </div>
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
            carregarAgendamentos();
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
