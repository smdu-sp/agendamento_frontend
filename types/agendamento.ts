/** @format */

export enum StatusAgendamento {
	AGENDADO = 'AGENDADO',
	CANCELADO = 'CANCELADO',
	CONCLUIDO = 'CONCLUIDO',
	ATENDIDO = 'ATENDIDO',
	NAO_REALIZADO = 'NAO_REALIZADO',
}

export interface IAgendamento {
	id: string;
	municipe?: string;
	rg?: string;
	cpf?: string;
	processo?: string;
	dataHora: Date;
	dataFim?: Date;
	duracao?: number;
	importado: boolean;
	legado: boolean;
	resumo?: string;
	motivoId?: string;
	coordenadoriaId?: string;
	tecnicoId?: string;
	tecnicoRF?: string;
	email?: string;
	status: StatusAgendamento;
	criadoEm: Date;
	atualizadoEm: Date;
	motivo?: { id: string; texto: string } | null;
	coordenadoria?: { id: string; sigla: string; nome?: string | null } | null;
	tecnico?: { id: string; nome: string; login: string } | null;
}

export interface ICreateAgendamento {
	municipe?: string;
	rg?: string;
	cpf?: string;
	processo?: string;
	dataHora: string;
	dataFim?: string;
	duracao?: number;
	resumo?: string;
	motivoId?: string;
	coordenadoriaId?: string;
	tecnicoId?: string;
	tecnicoRF?: string;
	email?: string;
}

export interface IUpdateAgendamento {
	municipe?: string;
	rg?: string;
	cpf?: string;
	processo?: string;
	dataHora?: string;
	dataFim?: string;
	duracao?: number;
	resumo?: string;
	motivoId?: string;
	coordenadoriaId?: string;
	tecnicoId?: string;
	tecnicoRF?: string;
	email?: string;
	status?: StatusAgendamento;
}

export interface IPaginadoAgendamento {
	data: IAgendamento[];
	total: number;
	pagina: number;
	limite: number;
}

export interface IRespostaAgendamento {
	ok: boolean;
	error: string | null;
	data:
		| IAgendamento
		| IAgendamento[]
		| IPaginadoAgendamento
		| { excluido: boolean }
		| { importados: number; erros: number }
		| null;
	status: number;
}
