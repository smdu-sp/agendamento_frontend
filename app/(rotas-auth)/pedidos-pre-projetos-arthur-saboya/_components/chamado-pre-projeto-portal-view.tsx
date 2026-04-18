/** @format */

"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ArrowLeft, CheckCircle2, Send } from "lucide-react";
import { toast } from "sonner";
import { PreProjetoChamadoChat } from "@/components/arthur-saboya/pre-projeto-chamado-chat";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import * as agendamento from "@/services/agendamentos";
import * as coordenadorias from "@/services/coordenadorias";
import * as usuario from "@/services/usuarios";
import type { ITecnico } from "@/services/usuarios";
import type { ISolicitacaoPreProjetoArthurSaboyaDetalhe } from "@/types/solicitacao-pre-projeto-arthur-saboya";
import type { ICoordenadoria } from "@/types/coordenadoria";

const LISTA_PATH = "/pedidos-pre-projetos-arthur-saboya";

function rotuloStatus(s: ISolicitacaoPreProjetoArthurSaboyaDetalhe["status"]) {
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

function chipStatus(status: ISolicitacaoPreProjetoArthurSaboyaDetalhe["status"]) {
  const base =
    "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold tracking-wide";
  switch (status) {
    case "SOLICITADO":
      return `${base} bg-amber-100 text-amber-900 dark:bg-amber-950/50 dark:text-amber-100`;
    case "RESPONDIDO":
      return `${base} bg-emerald-100 text-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-100`;
    case "AGUARDANDO_DATA":
      return `${base} bg-sky-100 text-sky-900 dark:bg-sky-950/50 dark:text-sky-100`;
    case "AGENDAMENTO_CRIADO":
      return `${base} bg-violet-100 text-violet-900 dark:bg-violet-950/50 dark:text-violet-100`;
    default:
      return `${base} bg-muted text-muted-foreground`;
  }
}

export default function ChamadoPreProjetoPortalView({
  referenciaChamado,
}: {
  /** UUID (links antigos) ou protocolo exibido (`PP-…`), como na URL. */
  referenciaChamado: string;
}) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const token = session?.access_token;

  const [chamado, setChamado] = useState<ISolicitacaoPreProjetoArthurSaboyaDetalhe | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [enviandoChat, setEnviandoChat] = useState(false);

  const [confirmAberto, setConfirmAberto] = useState(false);
  const [agendarAberto, setAgendarAberto] = useState(false);
  const [dataHoraAgendamento, setDataHoraAgendamento] = useState("");
  const [coordenadoriaAgendamento, setCoordenadoriaAgendamento] = useState("");
  const [tecnicoArthurIdAgendamento, setTecnicoArthurIdAgendamento] = useState("");
  const [listaCoord, setListaCoord] = useState<ICoordenadoria[]>([]);
  const [tecnicosArthur, setTecnicosArthur] = useState<ITecnico[]>([]);
  const [salvando, setSalvando] = useState(false);

  const carregarChamado = useCallback(async () => {
    if (!token || !referenciaChamado) return;
    setCarregando(true);
    setErro(null);
    const r = await agendamento.obterChamadoPortalArthurSaboya(token, referenciaChamado);
    if (!r.ok || !r.data) {
      setErro(r.error ?? "Chamado não encontrado ou sem permissão.");
      setChamado(null);
      setCarregando(false);
      return;
    }
    setChamado(r.data);
    setCarregando(false);
  }, [token, referenciaChamado]);

  useEffect(() => {
    if (status === "loading" || !token) return;
    void carregarChamado();
  }, [status, token, carregarChamado]);

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

  const handleEnviarMensagem = async (texto: string) => {
    if (!token) return;
    setEnviandoChat(true);
    const ref = chamado?.protocolo ?? referenciaChamado;
    const r = await agendamento.enviarMensagemChamadoPortalArthurSaboya(token, ref, texto);
    setEnviandoChat(false);
    if (!r.ok || !r.data) {
      toast.error(r.error ?? "Não foi possível enviar a mensagem.");
      return;
    }
    setChamado(r.data);
    toast.success("Mensagem registrada.");
  };

  const handleConfirmarRespondido = async () => {
    if (!token || !chamado) return;
    setSalvando(true);
    const res = await agendamento.confirmarRespostaEnviadaPortalArthurSaboya(
      token,
      chamado.protocolo,
    );
    setSalvando(false);
    if (!res.ok) {
      toast.error(res.error ?? "Não foi possível atualizar o status.");
      return;
    }
    toast.success("Status atualizado para Solucionado.");
    setConfirmAberto(false);
    void carregarChamado();
  };

  const abrirAgendar = () => {
    if (!chamado) return;
    setDataHoraAgendamento("");
    setCoordenadoriaAgendamento(chamado.coordenadoriaId ?? "");
    setTecnicoArthurIdAgendamento("");
    setAgendarAberto(true);
  };

  const handleCriarAgendamento = async () => {
    if (!token || !chamado) return;
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
      chamado.protocolo,
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
    void carregarChamado();
  };

  if (status === "loading" || !token) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-muted-foreground">
        {status === "loading" ? "Carregando sessão…" : "Sessão indisponível."}
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100dvh-4.5rem)] flex-col bg-gradient-to-b from-muted/50 via-background to-background">
      <header className="sticky top-0 z-20 border-b border-border/60 bg-background/90 shadow-sm backdrop-blur-md">
        <div className="mx-auto max-w-[1600px] px-4 pb-2 pt-3 md:px-8">
          <nav className="text-sm text-muted-foreground" aria-label="Localização no sistema">
            <ol className="flex flex-wrap items-center gap-1.5">
              <li>
                <Link href={LISTA_PATH} className="font-medium text-foreground hover:underline">
                  Arthur Saboya
                </Link>
              </li>
              <li aria-hidden className="select-none text-muted-foreground/80">
                /
              </li>
              <li className="font-mono text-sm font-semibold tracking-tight text-foreground md:text-base">
                {chamado?.protocolo ?? referenciaChamado}
              </li>
            </ol>
          </nav>
        </div>
        <div className="mx-auto flex max-w-[1600px] flex-col gap-4 border-t border-border/40 px-4 py-4 md:flex-row md:items-center md:justify-between md:px-8">
          <div className="flex flex-wrap items-center gap-3 md:gap-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="shrink-0 gap-2 border-dashed"
              onClick={() => router.push(LISTA_PATH)}
            >
              <ArrowLeft className="h-4 w-4" />
              Lista de pedidos
            </Button>
            {chamado ? (
              <>
                <div className="hidden h-8 w-px bg-border sm:block" aria-hidden />
                <span className={chipStatus(chamado.status)}>{rotuloStatus(chamado.status)}</span>
              </>
            ) : (
              <span className="text-sm text-muted-foreground">Carregando chamado…</span>
            )}
          </div>
          {chamado ? (
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                variant="secondary"
                className="gap-2"
                disabled={chamado.status !== "SOLICITADO" || salvando}
                onClick={() => setConfirmAberto(true)}
              >
                <CheckCircle2 className="h-4 w-4" />
                Marcar solucionado
              </Button>
              <Button
                type="button"
                size="sm"
                className="gap-2 bg-[#E56E14] text-white hover:bg-[#CC5F10]"
                disabled={
                  !!chamado.agendamentoId ||
                  !["SOLICITADO", "AGUARDANDO_DATA"].includes(chamado.status) ||
                  salvando
                }
                onClick={abrirAgendar}
              >
                <Send className="h-4 w-4" />
                Enviar à coordenadoria
              </Button>
            </div>
          ) : null}
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-[1600px] flex-1 min-h-0 flex-col gap-5 px-4 py-5 md:flex-row md:gap-6 md:px-8 md:py-6">
        <aside className="flex w-full shrink-0 flex-col md:w-[min(100%,380px)]">
          <Card className="border-border/80 shadow-md md:sticky md:top-24">
            <CardHeader className="border-b border-border/60 bg-muted/30 pb-4">
              <CardTitle className="text-base font-semibold">Solicitante e pedido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-5">
              {carregando ? (
                <p className="text-sm text-muted-foreground">Carregando dados…</p>
              ) : erro ? (
                <p className="text-sm text-destructive">{erro}</p>
              ) : chamado ? (
                <dl className="space-y-3 text-sm">
                  <div>
                    <dt className="text-xs font-medium uppercase text-muted-foreground">Abertura</dt>
                    <dd className="mt-0.5 font-medium">
                      {format(new Date(chamado.criadoEm), "dd/MM/yyyy 'às' HH:mm", {
                        locale: ptBR,
                      })}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium uppercase text-muted-foreground">Munícipe</dt>
                    <dd className="mt-0.5">{chamado.nome}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium uppercase text-muted-foreground">E-mail</dt>
                    <dd className="mt-0.5 break-all">{chamado.email}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium uppercase text-muted-foreground">Formação</dt>
                    <dd className="mt-0.5 text-muted-foreground">{chamado.formacaoTexto}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium uppercase text-muted-foreground">Natureza</dt>
                    <dd className="mt-0.5 text-muted-foreground">{chamado.naturezaTexto}</dd>
                  </div>
                  {chamado.emailContatoDivisao ? (
                    <div className="rounded-lg border border-dashed bg-muted/20 p-3 text-xs">
                      <p className="font-medium text-foreground">Contato institucional</p>
                      <p className="mt-1 break-all text-muted-foreground">{chamado.emailContatoDivisao}</p>
                    </div>
                  ) : null}
                </dl>
              ) : null}
            </CardContent>
          </Card>
        </aside>

        <main className="flex min-h-0 min-w-0 flex-1 flex-col">
          {carregando ? (
            <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed bg-muted/20 p-8 text-sm text-muted-foreground">
              Carregando conversa…
            </div>
          ) : chamado ? (
            <PreProjetoChamadoChat
              variante="painel"
              mensagens={chamado.mensagens ?? []}
              onEnviar={handleEnviarMensagem}
              enviando={enviandoChat}
              titulo="Linha do tempo"
              placeholder="Escreva a resposta ao munícipe (registrada no chamado)…"
            />
          ) : (
            <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed p-8 text-sm text-muted-foreground">
              Não foi possível carregar o chamado.
            </div>
          )}
        </main>
      </div>

      <Dialog open={confirmAberto} onOpenChange={setConfirmAberto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar status</DialogTitle>
          </DialogHeader>
          <p className="text-sm">
            Confirma que a dúvida foi solucionada? O status passa para{" "}
            <strong>Solucionado</strong>.
          </p>
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setConfirmAberto(false)}
              disabled={salvando}
            >
              Não
            </Button>
            <Button type="button" onClick={() => void handleConfirmarRespondido()} disabled={salvando}>
              Sim, confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={agendarAberto} onOpenChange={setAgendarAberto}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Enviar para a coordenadoria</DialogTitle>
          </DialogHeader>
          {chamado ? (
            <div className="space-y-3 text-sm">
              <p>
                <span className="font-medium">Munícipe:</span> {chamado.nome}
              </p>
              <div className="space-y-1">
                <label className="font-medium" htmlFor="dt-ag-full">
                  Data e hora
                </label>
                <Input
                  id="dt-ag-full"
                  type="datetime-local"
                  value={dataHoraAgendamento}
                  onChange={(e) => setDataHoraAgendamento(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="font-medium" htmlFor="coord-ag-full">
                  Coordenadoria
                </label>
                <select
                  id="coord-ag-full"
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
                <label className="font-medium" htmlFor="tecnico-arthur-full">
                  Técnico da Sala Arthur Saboya
                </label>
                <select
                  id="tecnico-arthur-full"
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
            <Button type="button" onClick={() => void handleCriarAgendamento()} disabled={salvando}>
              Enviar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
