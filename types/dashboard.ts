export interface IDashboardPorMes {
  mes: number;
  ano: number;
  total: number;
}

export interface IDashboardPorAno {
  ano: number;
  total: number;
}

export interface IDashboardMotivoNaoRealizacao {
  motivoId: string | null;
  motivoTexto: string;
  total: number;
}

export interface IDashboard {
  totalGeral: number;
  realizados: number;
  naoRealizados: number;
  /** Apenas NAO_REALIZADO (para taxa de absenteísmo) */
  apenasNaoRealizado: number;
  /** Quantidade de dias distintos no período em que há pelo menos um agendamento */
  diasComAgendamentos: number;
  porMes: IDashboardPorMes[];
  porAno: IDashboardPorAno[];
  motivosNaoRealizacao: IDashboardMotivoNaoRealizacao[];
}

export interface IRespostaDashboard {
  ok: boolean;
  error: string | null;
  data: IDashboard | null;
  status: number;
}
