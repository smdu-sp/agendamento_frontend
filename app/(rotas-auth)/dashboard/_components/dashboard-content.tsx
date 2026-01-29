"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import * as agendamentos from "@/services/agendamentos";
import * as coordenadorias from "@/services/coordenadorias";
import { IDashboard, IDashboardPorMes } from "@/types/dashboard";
import { ICoordenadoria } from "@/types/coordenadoria";
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
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Calendar, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

const MESES = [
  "Jan",
  "Fev",
  "Mar",
  "Abr",
  "Mai",
  "Jun",
  "Jul",
  "Ago",
  "Set",
  "Out",
  "Nov",
  "Dez",
];

function formatarPorMes(porMes: IDashboardPorMes[]) {
  return porMes.map((p) => ({
    mes: MESES[p.mes - 1],
    total: p.total,
    fill: "hsl(var(--chart-1))",
  }));
}

export default function DashboardContent() {
  const { data: session } = useSession();
  const [dashboard, setDashboard] = useState<IDashboard | null>(null);
  const [coordenadoriasLista, setCoordenadoriasLista] = useState<
    ICoordenadoria[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [ano, setAno] = useState(() => new Date().getFullYear());
  const [coordenadoriaId, setCoordenadoriaId] = useState<string>("");

  const permissao = String(session?.usuario?.permissao ?? "");
  const isAdmOuDev = permissao === "ADM" || permissao === "DEV";
  const podeVerDashboard =
    permissao === "ADM" ||
    permissao === "DEV" ||
    permissao === "PONTO_FOCAL" ||
    permissao === "COORDENADOR";

  useEffect(() => {
    if (!podeVerDashboard) return;
    if (isAdmOuDev) {
      coordenadorias.listaCompleta(session?.access_token).then((r) => {
        if (r.ok && r.data) setCoordenadoriasLista(r.data);
      });
    }
  }, [isAdmOuDev, podeVerDashboard, session?.access_token]);

  useEffect(() => {
    if (!session?.access_token || !podeVerDashboard) {
      setLoading(false);
      return;
    }
    setLoading(true);
    agendamentos
      .getDashboard(session.access_token, ano, coordenadoriaId || undefined)
      .then((r) => {
        if (r.ok && r.data) setDashboard(r.data);
        else if (r.error)
          toast.error("Erro ao carregar dashboard", { description: r.error });
        setLoading(false);
      });
  }, [session?.access_token, ano, coordenadoriaId, podeVerDashboard]);

  if (!podeVerDashboard) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-xl text-muted-foreground text-center">
          Você não tem permissão para acessar o dashboard.
        </p>
      </div>
    );
  }

  if (loading && !dashboard) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] gap-2">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span>Carregando dashboard...</span>
      </div>
    );
  }

  const dados = dashboard ?? {
    totalGeral: 0,
    realizados: 0,
    naoRealizados: 0,
    porMes: [],
    porAno: [],
    motivosNaoRealizacao: [],
  };

  const chartConfigMes: ChartConfig = {
    mes: { label: "Mês" },
    total: { label: "Agendamentos" },
  };

  const chartConfigAno: ChartConfig = {
    ano: { label: "Ano" },
    total: { label: "Agendamentos" },
  };

  const chartConfigMotivos: ChartConfig = {
    motivo: { label: "Motivo" },
    total: { label: "Quantidade" },
  };

  const dadosPorMes = formatarPorMes(dados.porMes);
  const dadosPorAno = dados.porAno.map((p) => ({
    ano: String(p.ano),
    total: p.total,
    fill: "hsl(var(--chart-2))",
  }));
  const dadosMotivos = dados.motivosNaoRealizacao.map((m) => ({
    motivo:
      m.motivoTexto.length > 30
        ? m.motivoTexto.slice(0, 30) + "…"
        : m.motivoTexto,
    total: m.total,
    fill: "hsl(var(--chart-3))",
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
          <div className="space-y-2">
            <Label htmlFor="ano">Ano</Label>
            <Select
              value={String(ano)}
              onValueChange={(v) => setAno(Number(v))}
            >
              <SelectTrigger id="ano" className="w-[120px]">
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
          {isAdmOuDev && (
            <div className="space-y-2">
              <Label htmlFor="coordenadoria">Coordenadoria</Label>
              <Select
                value={coordenadoriaId || "todos"}
                onValueChange={(v) =>
                  setCoordenadoriaId(v === "todos" ? "" : v)
                }
              >
                <SelectTrigger id="coordenadoria" className="w-[200px]">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  {coordenadoriasLista.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.sigla}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total no ano</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dados.totalGeral}</div>
            <p className="text-xs text-muted-foreground">
              Agendamentos em {ano}
              {coordenadoriaId ? " (filtro por coordenadoria)" : ""}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Realizados</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {dados.realizados}
            </div>
            <p className="text-xs text-muted-foreground">Status: Atendido</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Não realizados
            </CardTitle>
            <XCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {dados.naoRealizados}
            </div>
            <p className="text-xs text-muted-foreground">
              Status: Não realizado
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Agendamentos por mês</CardTitle>
            <CardDescription>
              Quantidade por mês no ano selecionado
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={chartConfigMes}
              className="h-[280px] w-full"
            >
              <BarChart data={dadosPorMes} margin={{ left: 12, right: 12 }}>
                <ChartTooltip content={<ChartTooltipContent />} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="mes" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <Bar dataKey="total" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Agendamentos por ano</CardTitle>
            <CardDescription>Últimos anos (visão geral)</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={chartConfigAno}
              className="h-[280px] w-full"
            >
              <BarChart data={dadosPorAno} margin={{ left: 12, right: 12 }}>
                <ChartTooltip content={<ChartTooltipContent />} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="ano" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <Bar dataKey="total" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Motivos de não realização</CardTitle>
          <CardDescription>
            Quantidade por motivo quando o status é &quot;Não realizado&quot;
          </CardDescription>
        </CardHeader>
        <CardContent>
          {dadosMotivos.length === 0 ? (
            <p className="text-muted-foreground py-4 text-center">
              Nenhum agendamento com status &quot;Não realizado&quot; no
              período.
            </p>
          ) : (
            <ChartContainer
              config={chartConfigMotivos}
              className="h-[300px] w-full"
            >
              <BarChart
                data={dadosMotivos}
                layout="vertical"
                margin={{ left: 8, right: 40 }}
              >
                <ChartTooltip content={<ChartTooltipContent />} />
                <CartesianGrid horizontal={false} />
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="motivo"
                  tickLine={false}
                  axisLine={false}
                  width={180}
                  tick={{ fontSize: 12 }}
                />
                <Bar dataKey="total" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
