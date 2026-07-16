/** @format */

"use client";

import { useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Clock,
  Loader2,
  TrendingUp,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import * as agendamentos from "@/services/agendamentos";
import type { TipoPeriodoDashboard } from "@/services/agendamentos/query-functions/dashboard";
import * as coordenadorias from "@/services/coordenadorias";
import * as usuario from "@/services/usuarios";
import type { IDashboardArthurSaboya } from "@/types/dashboard-arthur-saboya";
import type { ICoordenadoria } from "@/types/coordenadoria";
import type { IUsuario, IUsuarioSession } from "@/types/usuario";
import { usuarioPodeAcessarPedidosPreProjetosArthurSaboya } from "@/lib/pedidos-pre-projetos-arthur-saboya-acesso";
import { isAdministradorSistema } from "@/lib/arthur-saboya-perfis";
import { useEffectivePermissao } from "@/providers/ImpersonationProvider";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const MESES = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
  "Jul", "Ago", "Set", "Out", "Nov", "Dez",
];

const NATUREZAS = [
  { valor: "", label: "Todas as naturezas" },
  { valor: "his-hmp-parcelamento", label: "HIS / HMP ou Parcelamento" },
  {
    valor: "residencial-unifamiliar-certificado",
    label: "Residencial Unifamiliar",
  },
  { valor: "residencial-multifamiliar", label: "Residencial Multifamiliar" },
  { valor: "servicos-institucional", label: "Serviços ou Institucional" },
  { valor: "comercio-industria", label: "Comércio ou Indústria" },
  { valor: "regularizacao-imoveis", label: "Regularização de Imóveis" },
  {
    valor: "acessibilidade-seguranca",
    label: "Acessibilidade ou Segurança",
  },
];

function getSegundaFeira(d: Date): Date {
  const d2 = new Date(d);
  const day = d2.getDay();
  const diff = d2.getDate() - day + (day === 0 ? -6 : 1);
  d2.setDate(diff);
  d2.setHours(0, 0, 0, 0);
  return d2;
}

function formatarIntervaloSemana(semanaInicio: string): string {
  const seg = new Date(semanaInicio + "T12:00:00");
  const dom = new Date(seg);
  dom.setDate(dom.getDate() + 6);
  return `${format(seg, "dd/MM/yyyy", { locale: ptBR })} – ${format(dom, "dd/MM/yyyy", { locale: ptBR })}`;
}

function formatarDias(val: number | null | undefined): string {
  if (val == null) return "—";
  return `${val.toLocaleString("pt-BR", { maximumFractionDigits: 1 })} d`;
}

function KpiCard({
  titulo,
  valor,
  descricao,
  destaque,
  alerta,
}: {
  titulo: string;
  valor: string;
  descricao?: string;
  destaque?: boolean;
  alerta?: boolean;
}) {
  return (
    <Card
      className={
        destaque
          ? "border-[#0A328D]/30 bg-[#EAF0FB]/50"
          : alerta
            ? "border-orange-200 bg-[#FDF3EB]/40"
            : undefined
      }
    >
      <CardHeader className="pb-2">
        <CardDescription className="text-xs font-medium uppercase tracking-wide">
          {titulo}
        </CardDescription>
        <CardTitle
          className={`text-3xl tabular-nums ${destaque ? "text-[#0A328D]" : alerta ? "text-[#a94a08]" : ""}`}
        >
          {valor}
        </CardTitle>
      </CardHeader>
      {descricao && (
        <CardContent className="pt-0">
          <p className="text-xs text-muted-foreground">{descricao}</p>
        </CardContent>
      )}
    </Card>
  );
}

export default function DashboardArthurSaboyaContent() {
  const { data: session } = useSession();
  const effectivePermissao = useEffectivePermissao();
  const [dashboard, setDashboard] = useState<IDashboardArthurSaboya | null>(null);
  const [coordenadoriasLista, setCoordenadoriasLista] = useState<
    ICoordenadoria[]
  >([]);
  const [coordenadoriaUsuario, setCoordenadoriaUsuario] =
    useState<ICoordenadoria | null>(null);
  const [loading, setLoading] = useState(true);
  const [tipoPeriodo, setTipoPeriodo] = useState<TipoPeriodoDashboard>("ano");
  const [ano, setAno] = useState(() => new Date().getFullYear());
  const [mes, setMes] = useState(() => new Date().getMonth() + 1);
  const [semanaInicio, setSemanaInicio] = useState(() =>
    format(getSegundaFeira(new Date()), "yyyy-MM-dd"),
  );
  const [coordenadoriaId, setCoordenadoriaId] = useState("");
  const [naturezaValor, setNaturezaValor] = useState("");
  const requestIdRef = useRef(0);

  const permissao = String(
    effectivePermissao ?? session?.usuario?.permissao ?? "",
  );
  const isAdmOuDev =
    isAdministradorSistema(permissao) || permissao === "DEV";
  const isCoordenador = permissao === "COORDENADOR";
  const isPontoFocal = permissao === "PONTO_FOCAL";
  const podeVer =
    !!permissao &&
    usuarioPodeAcessarPedidosPreProjetosArthurSaboya({ permissao });

  useEffect(() => {
    if (!podeVer || !isAdmOuDev) return;
    coordenadorias
      .listaCompleta(session?.access_token)
      .then((resp) => {
        if (resp.ok && Array.isArray(resp.data)) {
          setCoordenadoriasLista(resp.data);
        }
      });
  }, [podeVer, isAdmOuDev, session?.access_token]);

  useEffect(() => {
    if (!podeVer || !session?.access_token) return;
    if (!isCoordenador && !isPontoFocal) return;
    const userId = (session.usuario as IUsuarioSession).sub;
    if (!userId) return;
    usuario.buscarPorId(userId, session.access_token).then((resp) => {
      if (!resp.ok || !resp.data) return;
      const u = resp.data as IUsuario;
      if (u.divisao?.coordenadoria) {
        const coord = u.divisao.coordenadoria as ICoordenadoria;
        setCoordenadoriaUsuario(coord);
        setCoordenadoriaId(coord.id);
      }
    });
  }, [
    podeVer,
    session?.access_token,
    session?.usuario,
    isCoordenador,
    isPontoFocal,
  ]);

  useEffect(() => {
    if (!session?.access_token || !podeVer) {
      setLoading(false);
      return;
    }
    setDashboard(null);
    setLoading(true);
    const id = ++requestIdRef.current;

    let dataInicio: string | undefined;
    let dataFim: string | undefined;
    if (tipoPeriodo === "semana" && semanaInicio) {
      const seg = new Date(semanaInicio + "T00:00:00");
      const dom = new Date(seg);
      dom.setDate(dom.getDate() + 6);
      dom.setHours(23, 59, 59, 999);
      dataInicio = seg.toISOString();
      dataFim = dom.toISOString();
    } else if (tipoPeriodo === "mes" && mes >= 1 && mes <= 12) {
      const inicio = new Date(ano, mes - 1, 1, 0, 0, 0, 0);
      const ultimoDia = new Date(ano, mes, 0).getDate();
      const fim = new Date(ano, mes - 1, ultimoDia, 23, 59, 59, 999);
      dataInicio = inicio.toISOString();
      dataFim = fim.toISOString();
    } else if (tipoPeriodo === "ano") {
      const inicio = new Date(ano, 0, 1, 0, 0, 0, 0);
      const fim = new Date(ano, 11, 31, 23, 59, 59, 999);
      dataInicio = inicio.toISOString();
      dataFim = fim.toISOString();
    }

    agendamentos
      .getDashboardArthurSaboya(session.access_token, {
        tipoPeriodo,
        ano,
        mes,
        semanaInicio: tipoPeriodo === "semana" ? semanaInicio : undefined,
        dataInicio,
        dataFim,
        coordenadoriaId: coordenadoriaId || undefined,
        naturezaValor: naturezaValor || undefined,
      })
      .then((resp) => {
        if (id !== requestIdRef.current) return;
        if (resp.ok && resp.data) {
          setDashboard(resp.data);
        } else {
          toast.error(resp.error ?? "Erro ao carregar dashboard.");
        }
      })
      .finally(() => {
        if (id === requestIdRef.current) setLoading(false);
      });
  }, [
    session?.access_token,
    podeVer,
    tipoPeriodo,
    ano,
    mes,
    semanaInicio,
    coordenadoriaId,
    naturezaValor,
  ]);

  if (!podeVer) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-center text-xl text-muted-foreground">
          Você não tem permissão para acessar este dashboard.
        </p>
      </div>
    );
  }

  if (loading && !dashboard) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center gap-2">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span>Carregando indicadores...</span>
      </div>
    );
  }

  const d = dashboard ?? {
    chamadosRecebidos: 0,
    encerradosSala: 0,
    taxaResolucaoSala: 0,
    encaminhados: 0,
    taxaEncaminhamento: 0,
    tempoMedioPrimeiraRespostaDias: null,
    tempoMedianoPrimeiraRespostaDias: null,
    tempoMedioResolucaoDias: null,
    chamadosEmAberto: 0,
    chamadosForaPrazo: 0,
    funil: [],
    taxaAgendamentoAposEncaminhamento: 0,
    taxaComparecimento: 0,
    taxaNoShow: 0,
    taxaConclusaoAposAtendimento: 0,
    distribuicaoPrimeiraResposta: [],
    temposPorEtapa: [],
    porSemana: [],
    porNatureza: [],
    porCoordenadoria: [],
    aging: [],
    agingPorEtapa: [],
    chamadosMaisAntigos: [],
    satisfacaoMedia: null,
    percentualAvaliacoesPositivas: null,
  };

  const chartConfigSemana: ChartConfig = {
    abertos: { label: "Abertos", color: "#0A328D" },
    resolvidos: { label: "Resolvidos", color: "#5CC9BD" },
  };

  const chartConfigFaixa: ChartConfig = {
    percentual: { label: "% chamados", color: "#0A328D" },
  };

  const chartConfigAging: ChartConfig = {
    quantidade: { label: "Chamados", color: "#E56E14" },
  };

  const dadosSemana = d.porSemana.map((p) => ({
    label: p.label,
    abertos: p.abertos,
    resolvidos: p.resolvidos,
  }));

  const dadosFaixa = d.distribuicaoPrimeiraResposta.map((f) => ({
    faixa: f.faixa,
    percentual: f.percentual,
  }));

  const dadosAging = d.aging.map((a) => ({
    faixa: a.faixa,
    quantidade: a.quantidade,
  }));

  const labelSemana =
    tipoPeriodo === "semana" && semanaInicio
      ? formatarIntervaloSemana(semanaInicio)
      : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-end">
          <div className="space-y-2">
            <Label htmlFor="tipoPeriodo">Período</Label>
            <Select
              value={tipoPeriodo}
              onValueChange={(v) => setTipoPeriodo(v as TipoPeriodoDashboard)}
            >
              <SelectTrigger id="tipoPeriodo" className="w-[130px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="semana">Semana</SelectItem>
                <SelectItem value="mes">Mês</SelectItem>
                <SelectItem value="ano">Ano</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {tipoPeriodo === "ano" && (
            <div className="space-y-2">
              <Label htmlFor="ano">Ano</Label>
              <Select
                value={String(ano)}
                onValueChange={(v) => setAno(Number(v))}
              >
                <SelectTrigger id="ano" className="w-[100px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[0, 1, 2, 3, 4].map((i) => {
                    const y = new Date().getFullYear() - i;
                    return (
                      <SelectItem key={y} value={String(y)}>
                        {y}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          )}

          {tipoPeriodo === "mes" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="ano-mes">Ano</Label>
                <Select
                  value={String(ano)}
                  onValueChange={(v) => setAno(Number(v))}
                >
                  <SelectTrigger id="ano-mes" className="w-[100px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[0, 1, 2, 3, 4].map((i) => {
                      const y = new Date().getFullYear() - i;
                      return (
                        <SelectItem key={y} value={String(y)}>
                          {y}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="mes">Mês</Label>
                <Select
                  value={String(mes)}
                  onValueChange={(v) => setMes(Number(v))}
                >
                  <SelectTrigger id="mes" className="w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MESES.map((nome, i) => (
                      <SelectItem key={nome} value={String(i + 1)}>
                        {nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {tipoPeriodo === "semana" && (
            <div className="flex items-end gap-1">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => {
                  const dt = new Date(semanaInicio + "T12:00:00");
                  dt.setDate(dt.getDate() - 7);
                  setSemanaInicio(format(getSegundaFeira(dt), "yyyy-MM-dd"));
                }}
                aria-label="Semana anterior"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="min-w-[160px] rounded-md border bg-muted/50 px-2 py-2 text-center text-sm">
                {labelSemana ?? "—"}
              </div>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => {
                  const dt = new Date(semanaInicio + "T12:00:00");
                  dt.setDate(dt.getDate() + 7);
                  setSemanaInicio(format(getSegundaFeira(dt), "yyyy-MM-dd"));
                }}
                aria-label="Próxima semana"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}

          {(isAdmOuDev || isCoordenador || isPontoFocal) && (
            <div className="space-y-2">
              <Label htmlFor="coordenadoria">Coordenadoria</Label>
              <Select
                value={coordenadoriaId || "todos"}
                onValueChange={(v) =>
                  setCoordenadoriaId(v === "todos" ? "" : v)
                }
                disabled={!isAdmOuDev}
              >
                <SelectTrigger id="coordenadoria" className="w-[200px]">
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  {isAdmOuDev && (
                    <SelectItem value="todos">Todas</SelectItem>
                  )}
                  {(isAdmOuDev
                    ? coordenadoriasLista
                    : coordenadoriaUsuario
                      ? [coordenadoriaUsuario]
                      : []
                  ).map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.sigla}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="natureza">Natureza do projeto</Label>
            <Select
              value={naturezaValor || "todas"}
              onValueChange={(v) =>
                setNaturezaValor(v === "todas" ? "" : v)
              }
            >
              <SelectTrigger id="natureza" className="w-[220px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {NATUREZAS.map((n) => (
                  <SelectItem
                    key={n.valor || "todas"}
                    value={n.valor || "todas"}
                  >
                    {n.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          titulo="Taxa resolução Sala"
          valor={`${d.taxaResolucaoSala}%`}
          descricao="KPI principal — resolvidos sem encaminhamento"
          destaque
        />
        <KpiCard
          titulo="Chamados recebidos"
          valor={String(d.chamadosRecebidos)}
          descricao="Volume no período"
        />
        <KpiCard
          titulo="Encerrados na Sala"
          valor={String(d.encerradosSala)}
        />
        <KpiCard
          titulo="Encaminhados p/ técnico"
          valor={String(d.encaminhados)}
          descricao={`${d.taxaEncaminhamento}% do total`}
        />
        <KpiCard
          titulo="Tempo médio 1ª resposta"
          valor={formatarDias(d.tempoMedioPrimeiraRespostaDias)}
          descricao={
            d.tempoMedianoPrimeiraRespostaDias != null
              ? `Mediana: ${formatarDias(d.tempoMedianoPrimeiraRespostaDias)}`
              : undefined
          }
        />
        <KpiCard
          titulo="Tempo médio resolução"
          valor={formatarDias(d.tempoMedioResolucaoDias)}
        />
        <KpiCard
          titulo="Em aberto"
          valor={String(d.chamadosEmAberto)}
          descricao="Estoque atual"
        />
        <KpiCard
          titulo="Fora do prazo"
          valor={String(d.chamadosForaPrazo)}
          descricao="Abertos há mais de 7 dias"
          alerta={d.chamadosForaPrazo > 0}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-4 w-4 text-[#0A328D]" />
              Funil do atendimento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {d.funil.map((f, i) => {
              const largura = Math.max(
                30,
                d.funil[0]?.quantidade
                  ? (f.quantidade / d.funil[0].quantidade) * 100
                  : 0,
              );
              const pctLabel =
                i === 0
                  ? "do total"
                  : i === 5
                    ? "dos agendamentos"
                    : i === 4
                      ? "dos encaminhados"
                      : i === 2
                        ? "dos analisados"
                        : "do total";
              return (
                <div key={f.etapa} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>{f.etapa}</span>
                    <span className="text-muted-foreground tabular-nums">
                      {f.quantidade} ({f.percentual}% {pctLabel})
                    </span>
                  </div>
                  <div
                    className="mx-auto flex h-7 items-center justify-center rounded bg-[#EAF0FB] text-xs font-semibold text-[#0A328D]"
                    style={{ width: `${largura}%` }}
                  >
                    {f.quantidade}
                  </div>
                  {i < d.funil.length - 1 && (
                    <p className="text-center text-muted-foreground">↓</p>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ClipboardList className="h-4 w-4 text-[#0A328D]" />
              Evolução semanal
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dadosSemana.length > 0 ? (
              <ChartContainer config={chartConfigSemana} className="h-[260px] w-full">
                <LineChart data={dadosSemana}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" fontSize={12} />
                  <YAxis fontSize={12} allowDecimals={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="abertos"
                    stroke="var(--color-abertos)"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="resolvidos"
                    stroke="var(--color-resolvidos)"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ChartContainer>
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Sem dados no período selecionado.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          titulo="Agendamento após encaminhamento"
          valor={`${d.taxaAgendamentoAposEncaminhamento}%`}
        />
        <KpiCard titulo="Comparecimento" valor={`${d.taxaComparecimento}%`} />
        <KpiCard titulo="No-show" valor={`${d.taxaNoShow}%`} alerta />
        <KpiCard
          titulo="Conclusão pós-atendimento"
          valor={`${d.taxaConclusaoAposAtendimento}%`}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="h-4 w-4 text-[#0A328D]" />
              Tempo até 1ª resposta (distribuição)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dadosFaixa.length > 0 ? (
              <ChartContainer config={chartConfigFaixa} className="h-[220px] w-full">
                <BarChart data={dadosFaixa}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="faixa" fontSize={11} />
                  <YAxis fontSize={12} unit="%" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar
                    dataKey="percentual"
                    fill="var(--color-percentual)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ChartContainer>
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Sem respostas registradas no período.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tempo por etapa (dias)</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Etapa</TableHead>
                  <TableHead className="text-right">Média</TableHead>
                  <TableHead className="text-right">Mediana</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {d.temposPorEtapa.map((t) => (
                  <TableRow key={t.etapa}>
                    <TableCell className="text-sm">{t.etapa}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatarDias(t.mediaDias)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatarDias(t.medianaDias)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Demanda por natureza</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Natureza</TableHead>
                  <TableHead className="text-right">Vol.</TableHead>
                  <TableHead className="text-right">Sala</TableHead>
                  <TableHead className="text-right">Enc.</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {d.porNatureza.map((n) => (
                  <TableRow key={n.natureza}>
                    <TableCell className="max-w-[180px] truncate text-sm">
                      {n.natureza}
                    </TableCell>
                    <TableCell className="text-right">{n.volume}</TableCell>
                    <TableCell className="text-right">{n.resolvidosSala}</TableCell>
                    <TableCell className="text-right">{n.encaminhados}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="h-4 w-4 text-[#0A328D]" />
              Por coordenadoria
            </CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sigla</TableHead>
                  <TableHead className="text-right">Enc.</TableHead>
                  <TableHead className="text-right">Espera</TableHead>
                  <TableHead className="text-right">Concl.</TableHead>
                  <TableHead className="text-right">No-show</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {d.porCoordenadoria.map((c) => (
                  <TableRow key={c.coordenadoriaId}>
                    <TableCell className="text-sm font-medium">
                      {c.coordenadoriaSigla}
                    </TableCell>
                    <TableCell className="text-right">{c.encaminhados}</TableCell>
                    <TableCell className="text-right">
                      {formatarDias(c.tempoEsperaMedioDias)}
                    </TableCell>
                    <TableCell className="text-right">{c.concluidos}</TableCell>
                    <TableCell className="text-right">{c.taxaNoShow}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Aging do backlog</CardTitle>
            <CardDescription>Chamados em aberto por idade</CardDescription>
          </CardHeader>
          <CardContent>
            {dadosAging.some((a) => a.quantidade > 0) ? (
              <ChartContainer config={chartConfigAging} className="h-[200px] w-full">
                <BarChart data={dadosAging}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="faixa" fontSize={11} />
                  <YAxis fontSize={12} allowDecimals={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar
                    dataKey="quantidade"
                    fill="var(--color-quantidade)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ChartContainer>
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Nenhum chamado em aberto no recorte atual.
              </p>
            )}
            {d.agingPorEtapa.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {d.agingPorEtapa.map((e) => (
                  <span
                    key={e.etapa}
                    className="rounded-full bg-muted px-3 py-1 text-xs"
                  >
                    {e.etapa}: {e.quantidade}
                  </span>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Chamados mais antigos</CardTitle>
            {d.chamadosForaPrazo > 0 && (
              <CardDescription className="text-[#a94a08]">
                {d.chamadosForaPrazo} fora do prazo (&gt;7 dias)
              </CardDescription>
            )}
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Protocolo</TableHead>
                  <TableHead>Etapa</TableHead>
                  <TableHead>Coord.</TableHead>
                  <TableHead className="text-right">Idade</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {d.chamadosMaisAntigos.map((c) => (
                  <TableRow key={c.protocolo}>
                    <TableCell className="font-mono text-xs">
                      {c.protocolo}
                    </TableCell>
                    <TableCell className="text-sm">{c.etapa}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {c.coordenadoria ?? "—"}
                    </TableCell>
                    <TableCell
                      className={`text-right tabular-nums ${c.idadeDias > 7 ? "font-semibold text-[#a94a08]" : ""}`}
                    >
                      {c.idadeDias}d
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {(d.satisfacaoMedia != null || d.percentualAvaliacoesPositivas != null) && (
        <div className="grid gap-4 sm:grid-cols-2">
          {d.satisfacaoMedia != null && (
            <KpiCard
              titulo="Satisfação média"
              valor={`${d.satisfacaoMedia} / 5`}
            />
          )}
          {d.percentualAvaliacoesPositivas != null && (
            <KpiCard
              titulo="Avaliações positivas (≥4)"
              valor={`${d.percentualAvaliacoesPositivas}%`}
            />
          )}
        </div>
      )}
    </div>
  );
}
