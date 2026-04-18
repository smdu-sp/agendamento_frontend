/** @format */

"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Search } from "lucide-react";
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
import * as agendamento from "@/services/agendamentos";
import type { ISolicitacaoPreProjetoArthurSaboya } from "@/types/solicitacao-pre-projeto-arthur-saboya";

const LIMITE = 15;
const PATH_CHAMADO = "/pedidos-pre-projetos-arthur-saboya";

type FiltroStatus = "" | "SOLICITADO" | "RESPONDIDO" | "AGUARDANDO_DATA" | "AGENDAMENTO_CRIADO";

function rotuloStatus(s: ISolicitacaoPreProjetoArthurSaboya["status"]) {
  switch (s) {
    case "SOLICITADO":
      return "Solicitado";
    case "RESPONDIDO":
      return "Solucionado";
    case "AGUARDANDO_DATA":
      return "Aguardando data";
    case "AGENDAMENTO_CRIADO":
      return "Enviado à coord.";
    default:
      return s;
  }
}

function StatusChip({ status }: { status: ISolicitacaoPreProjetoArthurSaboya["status"] }) {
  const configs: Record<string, { bg: string; text: string; dot: string }> = {
    SOLICITADO: { bg: "#EAF0FB", text: "#0A328D", dot: "#0A328D" },
    RESPONDIDO: { bg: "#EDF7F5", text: "#0f8578", dot: "#5CC9BD" },
    AGUARDANDO_DATA: { bg: "#FDF3EB", text: "#a94a08", dot: "#E56E14" },
    AGENDAMENTO_CRIADO: { bg: "#F3F0FB", text: "#4a2098", dot: "#7c3aed" },
  };
  const cfg = configs[status] ?? { bg: "#F1F5F9", text: "#475569", dot: "#94A3B8" };
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold"
      style={{ backgroundColor: cfg.bg, color: cfg.text }}
    >
      <span
        className="inline-block h-1.5 w-1.5 shrink-0 rounded-full"
        style={{ backgroundColor: cfg.dot }}
      />
      {rotuloStatus(status)}
    </span>
  );
}

interface Stats {
  total: number;
  solicitados: number;
  aguardando: number;
  respondidos: number;
  enviados: number;
}

export default function ListaPedidosPreProjetos() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const token = session?.access_token;
  const [buscaInput, setBuscaInput] = useState("");
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<FiltroStatus>("");
  const [pagina, setPagina] = useState(1);
  const [total, setTotal] = useState(0);
  const [itens, setItens] = useState<ISolicitacaoPreProjetoArthurSaboya[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);

  const carregarStats = useCallback(async () => {
    if (!token) return;
    const [resAll, resSol, resAguard, resResp, resEnv] = await Promise.all([
      agendamento.buscarSolicitacoesPortalArthurSaboya(token, 1, 1, "", ""),
      agendamento.buscarSolicitacoesPortalArthurSaboya(token, 1, 1, "", "SOLICITADO"),
      agendamento.buscarSolicitacoesPortalArthurSaboya(token, 1, 1, "", "AGUARDANDO_DATA"),
      agendamento.buscarSolicitacoesPortalArthurSaboya(token, 1, 1, "", "RESPONDIDO"),
      agendamento.buscarSolicitacoesPortalArthurSaboya(token, 1, 1, "", "AGENDAMENTO_CRIADO"),
    ]);
    setStats({
      total: resAll.data?.total ?? 0,
      solicitados: resSol.data?.total ?? 0,
      aguardando: resAguard.data?.total ?? 0,
      respondidos: resResp.data?.total ?? 0,
      enviados: resEnv.data?.total ?? 0,
    });
  }, [token]);

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
    if (status === "loading" || !token) return;
    void carregarStats();
  }, [status, token, carregarStats]);

  const totalPaginas = Math.max(1, Math.ceil(total / LIMITE));

  if (status === "loading" || !token) {
    return (
      <p className="text-sm text-muted-foreground">
        {status === "loading" ? "Carregando sessão…" : "Sessão indisponível."}
      </p>
    );
  }

  const FILTROS: { k: FiltroStatus; label: string; count: number | undefined }[] = [
    { k: "", label: "Todos", count: stats?.total },
    { k: "SOLICITADO", label: "Solicitados", count: stats?.solicitados },
    { k: "AGUARDANDO_DATA", label: "Aguardando data", count: stats?.aguardando },
    { k: "RESPONDIDO", label: "Solucionados", count: stats?.respondidos },
    { k: "AGENDAMENTO_CRIADO", label: "Enviados", count: stats?.enviados },
  ];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
        {[
          { label: "Total", value: stats?.total, accent: "#0A328D" },
          { label: "Solicitados", value: stats?.solicitados, accent: "#0A328D" },
          { label: "Aguardando data", value: stats?.aguardando, accent: "#E56E14" },
          { label: "Solucionados", value: stats?.respondidos, accent: "#5CC9BD" },
          { label: "Enviados", value: stats?.enviados, accent: "#7c3aed" },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-xl border bg-card px-4 py-3 shadow-sm"
            style={{ borderLeftWidth: 3, borderLeftColor: s.accent }}
          >
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {s.label}
            </p>
            <p className="mt-1 text-2xl font-bold tracking-tight" style={{ color: s.accent }}>
              {s.value ?? "—"}
            </p>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="busca-pedidos"
            value={buscaInput}
            onChange={(e) => setBuscaInput(e.target.value)}
            placeholder="Nome, e-mail, protocolo ou trecho da dúvida"
            className="pl-9"
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

      <div
        className="inline-flex flex-wrap gap-1 rounded-xl p-1"
        style={{ backgroundColor: "#F1F5F9" }}
      >
        {FILTROS.map((f) => {
          const active = filtroStatus === f.k;
          return (
            <button
              key={f.k}
              type="button"
              onClick={() => {
                setPagina(1);
                setFiltroStatus(f.k);
              }}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all"
              style={
                active
                  ? {
                      backgroundColor: "#fff",
                      color: "#0A328D",
                      boxShadow: "0 1px 2px rgba(15,23,42,.06)",
                    }
                  : { color: "#64748B" }
              }
            >
              {f.label}
              {f.count !== undefined && (
                <span
                  className="rounded-full px-1.5 py-px text-[10px] font-bold"
                  style={
                    active
                      ? { backgroundColor: "#EAF0FB", color: "#0A328D" }
                      : { backgroundColor: "rgba(0,0,0,0.07)", color: "#64748B" }
                  }
                >
                  {f.count}
                </span>
              )}
            </button>
          );
        })}
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
              <TableHead>Coordenadoria</TableHead>
              <TableHead>Formação</TableHead>
              <TableHead>Natureza</TableHead>
              <TableHead>Status</TableHead>
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
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() =>
                    router.push(`${PATH_CHAMADO}/${encodeURIComponent(row.protocolo)}`)
                  }
                >
                  <TableCell className="whitespace-nowrap text-sm">
                    {format(new Date(row.criadoEm), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                  </TableCell>
                  <TableCell className="font-mono text-sm">{row.protocolo}</TableCell>
                  <TableCell>{row.nome}</TableCell>
                  <TableCell className="max-w-[200px] truncate text-sm">{row.email}</TableCell>
                  <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground">
                    {row.coordenadoriaTexto?.trim() || "—"}
                  </TableCell>
                  <TableCell className="max-w-[160px] text-sm text-muted-foreground">
                    {row.formacaoTexto}
                  </TableCell>
                  <TableCell className="max-w-[180px] text-sm text-muted-foreground">
                    {row.naturezaTexto}
                  </TableCell>
                  <TableCell>
                    <StatusChip status={row.status} />
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
    </div>
  );
}
