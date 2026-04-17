/** @format */

"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CheckCircle2, Search, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import * as agendamento from "@/services/agendamentos";
import * as coordenadorias from "@/services/coordenadorias";
import * as usuario from "@/services/usuarios";
import type { ITecnico } from "@/services/usuarios";
import type { ISolicitacaoPreProjetoArthurSaboya } from "@/types/solicitacao-pre-projeto-arthur-saboya";
import type { ICoordenadoria } from "@/types/coordenadoria";

const LIMITE = 15;

function rotuloStatus(s: ISolicitacaoPreProjetoArthurSaboya["status"]) {
  switch (s) {
    case "SOLICITADO":
      return "Solicitado";
    case "RESPONDIDO":
      return "Solucionado";
    case "AGUARDANDO_DATA":
      return "Aguardando data";
    case "AGENDAMENTO_CRIADO":
      return "Enviado para coordenadoria";
    default:
      return s;
  }
}

export default function ListaPedidosPreProjetos() {
  const { data: session, status } = useSession();
  const token = session?.access_token;
  const [buscaInput, setBuscaInput] = useState("");
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<
    "" | "SOLICITADO" | "RESPONDIDO" | "AGUARDANDO_DATA" | "AGENDAMENTO_CRIADO"
  >("");
  const [pagina, setPagina] = useState(1);
  const [total, setTotal] = useState(0);
  const [itens, setItens] = useState<ISolicitacaoPreProjetoArthurSaboya[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [detalhe, setDetalhe] = useState<ISolicitacaoPreProjetoArthurSaboya | null>(
    null,
  );
  const [confirmRespostaAberto, setConfirmRespostaAberto] = useState(false);
  const [agendarAberto, setAgendarAberto] = useState(false);
  const [dataHoraAgendamento, setDataHoraAgendamento] = useState("");
  const [coordenadoriaAgendamento, setCoordenadoriaAgendamento] = useState("");
  const [tecnicoArthurIdAgendamento, setTecnicoArthurIdAgendamento] =
    useState("");
  const [listaCoord, setListaCoord] = useState<ICoordenadoria[]>([]);
  const [tecnicosArthur, setTecnicosArthur] = useState<ITecnico[]>([]);
  const [salvando, setSalvando] = useState(false);

  const carregar = useCallback(async () => {
    if (!token) return;
    setCarregando(true);
    setErro(null);
    const res = await agendamento.buscarSolicitacoesPortalArthurSaboya(
      token,
      pagina,
      LIMITE,
      busca,
      filtroStatus,
    );
    if (!res.ok || !res.data) {
      setErro(res.error ?? "Falha ao carregar.");
      setItens([]);
      setTotal(0);
      setCarregando(false);
      return;
    }
    setItens(res.data.data);
    setTotal(res.data.total);
    setCarregando(false);
  }, [token, pagina, busca, filtroStatus]);

  useEffect(() => {
    if (status === "loading") return;
    if (!token) {
      setCarregando(false);
      return;
    }
    void carregar();
  }, [status, token, carregar]);

  useEffect(() => {
    if (!token || status === "loading") return;
    void (async () => {
      const r = await coordenadorias.listaCompleta(token);
      if (r.ok && Array.isArray(r.data)) {
        setListaCoord((r.data as ICoordenadoria[]).filter((c) => c.status));
      }
    })();
  }, [token, status]);

  useEffect(() => {
    if (!token || status === "loading") return;
    const divisaoArthur = process.env.NEXT_PUBLIC_DIVISAO_ID_PRE_PROJETOS?.trim();
    if (!divisaoArthur) return;
    void (async () => {
      const r = await usuario.buscarTecnicosPorDivisao(divisaoArthur, token);
      if (r.ok && Array.isArray(r.data)) {
        setTecnicosArthur(r.data as ITecnico[]);
      }
    })();
  }, [token, status]);

  const totalPaginas = Math.max(1, Math.ceil(total / LIMITE));

  const abrirConfirmarRespondido = (row: ISolicitacaoPreProjetoArthurSaboya) => {
    setDetalhe(row);
    setConfirmRespostaAberto(true);
  };

  const abrirDialogAgendar = (row: ISolicitacaoPreProjetoArthurSaboya) => {
    setDetalhe(row);
    setDataHoraAgendamento("");
    setCoordenadoriaAgendamento("");
    setTecnicoArthurIdAgendamento("");
    if (row.coordenadoriaId) setCoordenadoriaAgendamento(row.coordenadoriaId);
    setAgendarAberto(true);
  };

  const handleConfirmarRespondido = async () => {
    if (!token || !detalhe) return;
    setSalvando(true);
    const res = await agendamento.confirmarRespostaEnviadaPortalArthurSaboya(
      token,
      detalhe.id,
    );
    setSalvando(false);
    if (!res.ok) {
      toast.error(res.error ?? "Não foi possível atualizar o status.");
      return;
    }
    toast.success("Status atualizado para Solucionado.");
    setConfirmRespostaAberto(false);
    if (res.data) setDetalhe(res.data);
    void carregar();
  };

  const handleCriarAgendamento = async () => {
    if (!token || !detalhe) return;
    if (!dataHoraAgendamento.trim()) {
      toast.error("Informe data e hora do agendamento.");
      return;
    }
    if (!coordenadoriaAgendamento) {
      toast.error("Selecione a coordenadoria.");
      return;
    }
    if (!tecnicoArthurIdAgendamento) {
      toast.error("Selecione o técnico da Sala Arthur Saboya.");
      return;
    }
    setSalvando(true);
    const iso = new Date(dataHoraAgendamento).toISOString();
    const res = await agendamento.criarAgendamentoDaSolicitacaoPortalArthurSaboya(
      token,
      detalhe.id,
      {
        dataHora: iso,
        coordenadoriaId: coordenadoriaAgendamento,
        tecnicoId: tecnicoArthurIdAgendamento,
      },
    );
    setSalvando(false);
    if (!res.ok) {
      toast.error(res.error ?? "Falha ao criar agendamento.");
      return;
    }
    toast.success("Solicitação enviada para a coordenadoria.");
    setAgendarAberto(false);
    setDetalhe(null);
    void carregar();
  };

  if (status === "loading" || !token) {
    return (
      <p className="text-sm text-muted-foreground">
        {status === "loading" ? "Carregando sessão…" : "Sessão indisponível."}
      </p>
    );
  }

  return (
    <TooltipProvider delayDuration={300}>
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1 space-y-2">
          <label htmlFor="busca-pedidos" className="text-sm font-medium">
            Buscar
          </label>
          <Input
            id="busca-pedidos"
            value={buscaInput}
            onChange={(e) => setBuscaInput(e.target.value)}
            placeholder="Nome, e-mail, protocolo ou trecho da dúvida"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setPagina(1);
                setBusca(buscaInput.trim());
              }
            }}
          />
        </div>
        <Button
          type="button"
          variant="secondary"
          className="shrink-0"
          onClick={() => {
            setPagina(1);
            setBusca(buscaInput.trim());
          }}
        >
          <Search className="mr-2 h-4 w-4" />
          Buscar
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        <span className="mr-2 self-center text-sm text-muted-foreground">
          Filtro por status:
        </span>
        <Button
          type="button"
          size="sm"
          variant={filtroStatus === "" ? "default" : "outline"}
          onClick={() => {
            setPagina(1);
            setFiltroStatus("");
          }}
        >
          Todos
        </Button>
        <Button
          type="button"
          size="sm"
          variant={filtroStatus === "SOLICITADO" ? "default" : "outline"}
          onClick={() => {
            setPagina(1);
            setFiltroStatus("SOLICITADO");
          }}
        >
          Solicitados
        </Button>
        <Button
          type="button"
          size="sm"
          variant={filtroStatus === "AGUARDANDO_DATA" ? "default" : "outline"}
          onClick={() => {
            setPagina(1);
            setFiltroStatus("AGUARDANDO_DATA");
          }}
        >
          Aguardando data
        </Button>
        <Button
          type="button"
          size="sm"
          variant={filtroStatus === "RESPONDIDO" ? "default" : "outline"}
          onClick={() => {
            setPagina(1);
            setFiltroStatus("RESPONDIDO");
          }}
        >
          Solucionados
        </Button>
        <Button
          type="button"
          size="sm"
          variant={filtroStatus === "AGENDAMENTO_CRIADO" ? "default" : "outline"}
          onClick={() => {
            setPagina(1);
            setFiltroStatus("AGENDAMENTO_CRIADO");
          }}
        >
          Enviados
        </Button>
      </div>

      {erro ? (
        <div
          role="alert"
          className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {erro}
        </div>
      ) : null}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Protocolo</TableHead>
              <TableHead>Munícipe</TableHead>
              <TableHead>E-mail</TableHead>
              <TableHead>Formação</TableHead>
              <TableHead>Natureza</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[260px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {carregando ? (
              <TableRow>
                <TableCell colSpan={8} className="text-muted-foreground">
                  Carregando…
                </TableCell>
              </TableRow>
            ) : itens.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-muted-foreground">
                  Nenhum pedido encontrado.
                </TableCell>
              </TableRow>
            ) : (
              itens.map((row) => (
                <TableRow
                  key={row.id}
                  className="cursor-pointer"
                  onClick={() => setDetalhe(row)}
                >
                  <TableCell className="whitespace-nowrap text-sm">
                    {format(new Date(row.criadoEm), "dd/MM/yyyy HH:mm", {
                      locale: ptBR,
                    })}
                  </TableCell>
                  <TableCell className="font-mono text-sm">{row.protocolo}</TableCell>
                  <TableCell>{row.nome}</TableCell>
                  <TableCell className="max-w-[200px] truncate text-sm">
                    {row.email}
                  </TableCell>
                  <TableCell className="max-w-[160px] text-sm text-muted-foreground">
                    {row.formacaoTexto}
                  </TableCell>
                  <TableCell className="max-w-[180px] text-sm text-muted-foreground">
                    {row.naturezaTexto}
                  </TableCell>
                  <TableCell className="text-sm">{rotuloStatus(row.status)}</TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <div className="flex flex-wrap gap-2">
                      <TooltipPrimitive.Root>
                        <TooltipPrimitive.Trigger asChild>
                          <span className="inline-flex">
                            <Button
                              type="button"
                              size="icon"
                              variant="secondary"
                              className="h-8 w-8 shrink-0"
                              disabled={row.status !== "SOLICITADO" || salvando}
                              onClick={() => abrirConfirmarRespondido(row)}
                              aria-label="Dúvida respondida"
                            >
                              <CheckCircle2 />
                            </Button>
                          </span>
                        </TooltipPrimitive.Trigger>
                        <TooltipContent side="top" className="max-w-xs text-center">
                          Marcar que a dúvida já foi respondida ao munícipe; o status
                          passa a <strong>Solucionado</strong>.
                        </TooltipContent>
                      </TooltipPrimitive.Root>
                      <TooltipPrimitive.Root>
                        <TooltipPrimitive.Trigger asChild>
                          <span className="inline-flex">
                            <Button
                              type="button"
                              size="icon"
                              className="h-8 w-8 shrink-0"
                              disabled={
                                !!row.agendamentoId ||
                                !["SOLICITADO", "AGUARDANDO_DATA"].includes(
                                  row.status,
                                ) || salvando
                              }
                              onClick={() => abrirDialogAgendar(row)}
                              aria-label="Enviar para coordenadoria"
                            >
                              <Send />
                            </Button>
                          </span>
                        </TooltipPrimitive.Trigger>
                        <TooltipContent side="top" className="max-w-xs text-center">
                          Enviar à coordenadoria quando precisar de técnico no local.
                          Informe data, coordenadoria e técnico da Arthur Saboya.
                        </TooltipContent>
                      </TooltipPrimitive.Root>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {total > LIMITE ? (
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
          <span>
            Página {pagina} de {totalPaginas} — {total} registro(s)
          </span>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={pagina <= 1 || carregando}
              onClick={() => setPagina((p) => Math.max(1, p - 1))}
            >
              Anterior
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={pagina >= totalPaginas || carregando}
              onClick={() => setPagina((p) => p + 1)}
            >
              Próxima
            </Button>
          </div>
        </div>
      ) : total > 0 ? (
        <p className="text-sm text-muted-foreground">{total} pedido(s).</p>
      ) : null}

      <Dialog
        open={!!detalhe}
        onOpenChange={(open) => {
          if (!open) setDetalhe(null);
        }}
      >
        <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto sm:max-w-xl">
          {detalhe ? (
            <>
              <DialogHeader>
                <DialogTitle>Pedido {detalhe.protocolo}</DialogTitle>
              </DialogHeader>
              <div className="space-y-3 text-sm">
                <p>
                  <span className="font-medium">Data:</span>{" "}
                  {format(new Date(detalhe.criadoEm), "dd/MM/yyyy HH:mm", {
                    locale: ptBR,
                  })}
                </p>
                <p>
                  <span className="font-medium">Munícipe:</span> {detalhe.nome}
                </p>
                <p>
                  <span className="font-medium">E-mail:</span> {detalhe.email}
                </p>
                <p>
                  <span className="font-medium">Formação:</span>{" "}
                  {detalhe.formacaoTexto}
                </p>
                <p>
                  <span className="font-medium">Natureza:</span>{" "}
                  {detalhe.naturezaTexto}
                </p>
                <p>
                  <span className="font-medium">Status:</span>{" "}
                  {rotuloStatus(detalhe.status)}
                </p>
                <div>
                  <p className="font-medium">Dúvida</p>
                  <p className="mt-1 whitespace-pre-wrap rounded-md border bg-muted/40 p-3">
                    {detalhe.duvida}
                  </p>
                </div>
              </div>
              <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-end">
                <Button type="button" variant="ghost" onClick={() => setDetalhe(null)}>
                  Fechar
                </Button>
              </DialogFooter>
            </>
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog open={confirmRespostaAberto} onOpenChange={setConfirmRespostaAberto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar status</DialogTitle>
          </DialogHeader>
          <p className="text-sm">
            Confirma que a dúvida foi solucionada? Ao confirmar, o status passa
            para <strong>Solucionado</strong>.
          </p>
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setConfirmRespostaAberto(false)}
              disabled={salvando}
            >
              Não
            </Button>
            <Button type="button" onClick={handleConfirmarRespondido} disabled={salvando}>
              Sim
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={agendarAberto} onOpenChange={setAgendarAberto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enviar para a coordenadoria</DialogTitle>
          </DialogHeader>
          {detalhe ? (
            <div className="space-y-3 text-sm">
              <p>
                <span className="font-medium">Munícipe:</span> {detalhe.nome}
              </p>
              <p>
                <span className="font-medium">E-mail:</span> {detalhe.email}
              </p>
              <div className="space-y-1">
                <label className="font-medium" htmlFor="dt-ag">
                  Data e hora
                </label>
                <Input
                  id="dt-ag"
                  type="datetime-local"
                  value={dataHoraAgendamento}
                  onChange={(e) => setDataHoraAgendamento(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="font-medium" htmlFor="coord-ag">
                  Coordenadoria
                </label>
                <select
                  id="coord-ag"
                  className="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                  value={coordenadoriaAgendamento}
                  onChange={(e) => setCoordenadoriaAgendamento(e.target.value)}
                >
                  <option value="">Selecione…</option>
                  {listaCoord.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.sigla}
                      {c.nome ? ` — ${c.nome}` : ""}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="font-medium" htmlFor="tecnico-arthur-ag">
                  Técnico da Sala Arthur Saboya
                </label>
                <select
                  id="tecnico-arthur-ag"
                  className="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                  value={tecnicoArthurIdAgendamento}
                  onChange={(e) => setTecnicoArthurIdAgendamento(e.target.value)}
                >
                  <option value="">Selecione…</option>
                  {tecnicosArthur.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.nome}
                      {t.login ? ` (${t.login})` : ""}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ) : null}
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setAgendarAberto(false)}
              disabled={salvando}
            >
              Cancelar
            </Button>
            <Button type="button" onClick={handleCriarAgendamento} disabled={salvando}>
              Enviar para coordenadoria
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
    </TooltipProvider>
  );
}
