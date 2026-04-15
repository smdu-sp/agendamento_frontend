/** @format */

export type StatusSolicitacaoPreProjetoArthurSaboya =
  | "SOLICITADO"
  | "RESPONDIDO"
  | "AGUARDANDO_DATA"
  | "AGENDAMENTO_CRIADO";

export interface ISolicitacaoPreProjetoArthurSaboya {
  id: string;
  protocolo: string;
  criadoEm: string;
  nome: string;
  email: string;
  formacaoValor: string;
  formacaoOutro?: string | null;
  formacaoTexto: string;
  naturezaValor: string;
  naturezaOutro?: string | null;
  naturezaTexto: string;
  duvida: string;
  status: StatusSolicitacaoPreProjetoArthurSaboya;
  agendamentoId?: string | null;
  /** E-mail institucional sugerido (coordenadoria da divisão ou da solicitação). */
  emailContatoDivisao?: string | null;
  coordenadoriaId?: string | null;
  divisaoId?: string | null;
}

export interface IPaginadoSolicitacoesPreProjetoArthurSaboya {
  total: number;
  pagina: number;
  limite: number;
  data: ISolicitacaoPreProjetoArthurSaboya[];
}

export interface IRespostaSolicitacoesPreProjetoArthurSaboya {
  ok: boolean;
  error: string | null;
  data: IPaginadoSolicitacoesPreProjetoArthurSaboya | null;
  status: number;
}
