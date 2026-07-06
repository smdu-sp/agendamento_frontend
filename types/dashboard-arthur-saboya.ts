/** @format */

export interface IDashboardArthurSaboyaFaixaTempo {
  faixa: string;
  quantidade: number;
  percentual: number;
}

export interface IDashboardArthurSaboyaFunil {
  etapa: string;
  quantidade: number;
  percentual: number;
}

export interface IDashboardArthurSaboyaPorSemana {
  semana: number;
  label: string;
  abertos: number;
  resolvidos: number;
}

export interface IDashboardArthurSaboyaPorNatureza {
  natureza: string;
  volume: number;
  resolvidosSala: number;
  encaminhados: number;
  tempoMedioResolucaoDias: number | null;
}

export interface IDashboardArthurSaboyaPorCoordenadoria {
  coordenadoriaId: string;
  coordenadoriaSigla: string;
  encaminhados: number;
  concluidos: number;
  tempoEsperaMedioDias: number | null;
  taxaNoShow: number;
}

export interface IDashboardArthurSaboyaAging {
  faixa: string;
  quantidade: number;
}

export interface IDashboardArthurSaboyaAgingEtapa {
  etapa: string;
  quantidade: number;
}

export interface IDashboardArthurSaboyaChamadoAntigo {
  protocolo: string;
  natureza: string;
  etapa: string;
  coordenadoria: string | null;
  idadeDias: number;
}

export interface IDashboardArthurSaboyaTempoEtapa {
  etapa: string;
  mediaDias: number;
  medianaDias: number;
}

export interface IDashboardArthurSaboya {
  chamadosRecebidos: number;
  encerradosSala: number;
  taxaResolucaoSala: number;
  encaminhados: number;
  taxaEncaminhamento: number;
  tempoMedioPrimeiraRespostaDias: number | null;
  tempoMedianoPrimeiraRespostaDias: number | null;
  tempoMedioResolucaoDias: number | null;
  chamadosEmAberto: number;
  chamadosForaPrazo: number;
  funil: IDashboardArthurSaboyaFunil[];
  taxaAgendamentoAposEncaminhamento: number;
  taxaComparecimento: number;
  taxaNoShow: number;
  taxaConclusaoAposAtendimento: number;
  distribuicaoPrimeiraResposta: IDashboardArthurSaboyaFaixaTempo[];
  temposPorEtapa: IDashboardArthurSaboyaTempoEtapa[];
  porSemana: IDashboardArthurSaboyaPorSemana[];
  porNatureza: IDashboardArthurSaboyaPorNatureza[];
  porCoordenadoria: IDashboardArthurSaboyaPorCoordenadoria[];
  aging: IDashboardArthurSaboyaAging[];
  agingPorEtapa: IDashboardArthurSaboyaAgingEtapa[];
  chamadosMaisAntigos: IDashboardArthurSaboyaChamadoAntigo[];
  satisfacaoMedia: number | null;
  percentualAvaliacoesPositivas: number | null;
}

export interface IRespostaDashboardArthurSaboya {
  ok: boolean;
  error: string | null;
  data: IDashboardArthurSaboya | null;
  status: number;
}
