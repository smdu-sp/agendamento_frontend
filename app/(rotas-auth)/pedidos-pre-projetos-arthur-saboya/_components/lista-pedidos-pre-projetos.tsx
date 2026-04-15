/** @format */

"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import * as agendamento from "@/services/agendamentos";
import * as coordenadorias from "@/services/coordenadorias";
import type { ISolicitacaoPreProjetoArthurSaboya } from "@/types/solicitacao-pre-projeto-arthur-saboya";
import type { ICoordenadoria } from "@/types/coordenadoria";

const LIMITE = 15;

const TEXTO_EMAIL_SOLICITAR_DATA =
  "Por favor enviar data e hora para atendimento";

function rotuloStatus(s: ISolicitacaoPreProjetoArthurSaboya["status"]) {
  switch (s) {
    case "SOLICITADO":
      return "Solicitado";
    case "RESPONDIDO":
      return "Respondido";
    case "AGUARDANDO_DATA":
      return "Aguardando data";
    case "AGENDAMENTO_CRIADO":
      return "Agendamento criado";
    default:
      return s;
  }
}

function montarMailto(
  to: string,
  subject: string,
  body: string,
  ccInstitucional?: string,
) {
  const q = new URLSearchParams();
  q.set("subject", subject);
  q.set("body", body);
  const cc = ccInstitucional?.trim();
  if (cc) q.set("cc", cc);
  return `mailto:${encodeURIComponent(to)}?${q.toString()}`;
}

export default function ListaPedidosPreProjetos() {
  const { data: session, status } = useSession();
  const token = session?.access_token;
  const [buscaInput, setBuscaInput] = useState("");
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<
    "" | "SOLICITADO" | "AGUARDANDO_DATA"
  >("");
  const [pagina, setPagina] = useState(1);
  const [total, setTotal] = useState(0);
  const [itens, setItens] = useState<ISolicitacaoPreProjetoArthurSaboya[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [detalhe, setDetalhe] = useState<ISolicitacaoPreProjetoArthurSaboya | null>(
    null,
  );
  const [rascunhoResposta, setRascunhoResposta] = useState("");
  const [confirmRespostaAberto, setConfirmRespostaAberto] = useState(false);
  const [confirmAguardandoAberto, setConfirmAguardandoAberto] = useState(false);
  const [agendarAberto, setAgendarAberto] = useState(false);
  const [dataHoraAgendamento, setDataHoraAgendamento] = useState("");
  const [coordenadoriaAgendamento, setCoordenadoriaAgendamento] = useState("");
  const [listaCoord, setListaCoord] = useState<ICoordenadoria[]>([]);
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

  const totalPaginas = Math.max(1, Math.ceil(total / LIMITE));

  const abrirMailtoResponder = (row: ISolicitacaoPreProjetoArthurSaboya) => {
    const de = row.emailContatoDivisao?.trim() || "";
    const corpo = [
      de
        ? `Enviar preferencialmente pelo e-mail institucional da divisão: ${de}`
        : "Cadastre o e-mail da coordenadoria vinculada à divisão para exibir o remetente institucional sugerido.",
      "",
      "--- Dúvida do munícipe ---",
      "",
      row.duvida,
      "",
      "--- Resposta ---",
      "",
      rascunhoResposta.trim(),
      "",
    ].join("\n");
    const href = montarMailto(
      row.email,
      `Pré-projetos — protocolo ${row.protocolo}`,
      corpo,
      de,
    );
    window.location.href = href;
    setConfirmRespostaAberto(true);
  };

  const abrirMailtoAgendar = (row: ISolicitacaoPreProjetoArthurSaboya) => {
    const de = row.emailContatoDivisao?.trim() || "";
    const corpo = [
      de
        ? `Enviar preferencialmente pelo e-mail institucional da divisão: ${de}`
        : "",
      "",
      TEXTO_EMAIL_SOLICITAR_DATA,
    ]
      .filter(Boolean)
      .join("\n");
    const href = montarMailto(
      row.email,
      `Pré-projetos — protocolo ${row.protocolo}`,
      corpo,
      de,
    );
    window.location.href = href;
    setConfirmAguardandoAberto(true);
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
    toast.success("Status atualizado para Respondido.");
    setConfirmRespostaAberto(false);
    if (res.data) setDetalhe(res.data);
    void carregar();
  };

  const handleConfirmarAguardandoData = async () => {
    if (!token || !detalhe) return;
    setSalvando(true);
    const res = await agendamento.marcarAguardandoDataPortalArthurSaboya(
      token,
      detalhe.id,
    );
    setSalvando(false);
    if (!res.ok) {
      toast.error(res.error ?? "Não foi possível atualizar o status.");
      return;
    }
    toast.success("Status atualizado para Aguardando data.");
    setConfirmAguardandoAberto(false);
    if (res.data) setDetalhe(res.data);
    void carregar();
  };

  const abrirDialogAgendar = () => {
    setDataHoraAgendamento("");
    setCoordenadoriaAgendamento("");
    setAgendarAberto(true);
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
    setSalvando(true);
    const iso = new Date(dataHoraAgendamento).toISOString();
    const res = await agendamento.criarAgendamentoDaSolicitacaoPortalArthurSaboya(
      token,
      detalhe.id,
      { dataHora: iso, coordenadoriaId: coordenadoriaAgendamento },
    );
    setSalvando(false);
    if (!res.ok) {
      toast.error(res.error ?? "Falha ao criar agendamento.");
      return;
    }
    toast.success("Agendamento registrado na coordenadoria.");
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
            </TableRow>
          </TableHeader>
          <TableBody>
            {carregando ? (
              <TableRow>
                <TableCell colSpan={7} className="text-muted-foreground">
                  Carregando…
                </TableCell>
              </TableRow>
            ) : itens.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-muted-foreground">
                  Nenhum pedido encontrado.
                </TableCell>
              </TableRow>
            ) : (
              itens.map((row) => (
                <TableRow
                  key={row.id}
                  className="cursor-pointer"
                  onClick={() => {
                    setDetalhe(row);
                    setRascunhoResposta("");
                  }}
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
                {detalhe.status === "SOLICITADO" ? (
                  <div className="space-y-2">
                    <label className="font-medium" htmlFor="resposta-rascunho">
                      Rascunho da resposta (será incluído no e-mail)
                    </label>
                    <Textarea
                      id="resposta-rascunho"
                      rows={4}
                      value={rascunhoResposta}
                      onChange={(e) => setRascunhoResposta(e.target.value)}
                      placeholder="Digite a resposta ao munícipe…"
                    />
                  </div>
                ) : null}
              </div>
              <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-end">
                {detalhe.status === "SOLICITADO" ? (
                  <>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => abrirMailtoResponder(detalhe)}
                    >
                      Responder dúvida
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => abrirMailtoAgendar(detalhe)}
                    >
                      Necessário agendar
                    </Button>
                  </>
                ) : null}
                {detalhe.status === "RESPONDIDO" ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => abrirMailtoAgendar(detalhe)}
                  >
                    Necessário agendar
                  </Button>
                ) : null}
                {detalhe.status === "AGUARDANDO_DATA" && !detalhe.agendamentoId ? (
                  <Button type="button" onClick={abrirDialogAgendar}>
                    Enviar agendamento à coordenadoria
                  </Button>
                ) : null}
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
            <DialogTitle>Confirmar envio</DialogTitle>
          </DialogHeader>
          <p className="text-sm">
            O e-mail foi enviado e a dúvida foi respondida? Ao confirmar, o status
            passa para <strong>Respondido</strong>.
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

      <Dialog
        open={confirmAguardandoAberto}
        onOpenChange={setConfirmAguardandoAberto}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar envio</DialogTitle>
          </DialogHeader>
          <p className="text-sm">
            Confirma que o e-mail foi enviado e deseja marcar a solicitação como{" "}
            <strong>Aguardando data</strong>?
          </p>
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setConfirmAguardandoAberto(false)}
              disabled={salvando}
            >
              Não
            </Button>
            <Button
              type="button"
              onClick={handleConfirmarAguardandoData}
              disabled={salvando}
            >
              Sim
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={agendarAberto} onOpenChange={setAgendarAberto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agendamento na coordenadoria</DialogTitle>
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
              Registrar agendamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
