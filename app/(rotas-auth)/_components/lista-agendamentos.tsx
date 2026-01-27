'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import * as agendamento from '@/services/agendamentos';
import { IAgendamento, IPaginadoAgendamento } from '@/types/agendamento';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { IPermissao } from '@/types/usuario';
import AtribuirTecnico from './atribuir-tecnico';
import ConfirmarAtendimento from './confirmar-atendimento';
import { CheckCircle2, XCircle } from 'lucide-react';
import { StatusAgendamento } from '@/types/agendamento';

// Função auxiliar para formatar data/hora corretamente
// Considera que a data foi salva como UTC mas representa hora local
const formatarDataHora = (data: Date | string): string => {
	const dataObj = typeof data === 'string' ? new Date(data) : data;
	// Se a data foi salva como UTC mas representa hora local, precisamos ajustar
	// Extrai os componentes UTC e cria uma data local
	const ano = dataObj.getUTCFullYear();
	const mes = dataObj.getUTCMonth();
	const dia = dataObj.getUTCDate();
	const hora = dataObj.getUTCHours();
	const minuto = dataObj.getUTCMinutes();
	
	// Cria uma nova data local com esses valores
	const dataLocal = new Date(ano, mes, dia, hora, minuto);
	return format(dataLocal, "dd/MM/yyyy 'às' HH:mm");
};

// Função para mascarar CPF no formato NNN.XXX.XXX-NN
const mascararCPF = (cpf: string | null | undefined): string => {
	if (!cpf) return '-';
	
	// Remove caracteres não numéricos
	const apenasNumeros = cpf.replace(/\D/g, '');
	
	// Verifica se tem 11 dígitos
	if (apenasNumeros.length !== 11) {
		return cpf; // Retorna o CPF original se não tiver 11 dígitos
	}
	
	// Formato: NNN.XXX.XXX-NN
	// Mostra primeiros 3 dígitos, mascara 6 do meio, mostra últimos 2
	const primeiros3 = apenasNumeros.substring(0, 3);
	const ultimos2 = apenasNumeros.substring(9, 11);
	
	return `${primeiros3}.XXX.XXX-${ultimos2}`;
};

export default function ListaAgendamentos() {
	const { data: session } = useSession();
	const [agendamentos, setAgendamentos] = useState<IAgendamento[]>([]);
	const [pagina, setPagina] = useState(1);
	const [limite] = useState(10);
	const [total, setTotal] = useState(0);
	const [busca, setBusca] = useState('');
	const [status, setStatus] = useState('');
	const [dataSelecionada, setDataSelecionada] = useState<Date | undefined>(undefined);
	const [loading, setLoading] = useState(true);
	const [agendamentoParaConfirmar, setAgendamentoParaConfirmar] = useState<(IAgendamento & { _tipoConfirmacao?: 'atendido' | 'nao-realizado' }) | null>(null);

	useEffect(() => {
		carregarAgendamentos();
	}, [pagina, busca, status, dataSelecionada, session]);

	const carregarAgendamentos = async () => {
		if (!session?.access_token) return;

		setLoading(true);
		try {
			// Se há data selecionada, filtra apenas esse dia
			let dataInicio = '';
			let dataFim = '';
			
			if (dataSelecionada) {
				// Formata a data manualmente para evitar problemas de timezone
				// Usa os componentes locais da data, não UTC
				const ano = dataSelecionada.getFullYear();
				const mes = String(dataSelecionada.getMonth() + 1).padStart(2, '0');
				const dia = String(dataSelecionada.getDate()).padStart(2, '0');
				
				// Início do dia selecionado (00:00:00)
				dataInicio = `${ano}-${mes}-${dia}`;
				
				// Fim do dia selecionado (mesmo dia, mas o backend vai usar até 23:59:59)
				dataFim = `${ano}-${mes}-${dia}`;
			}

			const response = await agendamento.buscarTudo(
				session.access_token,
				pagina,
				limite,
				busca,
				status,
				dataInicio,
				dataFim,
			);

			if (response.ok && response.data) {
				const dados = response.data as IPaginadoAgendamento;
				setAgendamentos(dados.data);
				setTotal(dados.total);
			}
		} catch (error) {
			console.error('Erro ao carregar agendamentos:', error);
		} finally {
			setLoading(false);
		}
	};

	const totalPaginas = Math.ceil(total / limite);

	const handleBusca = (valor: string) => {
		setBusca(valor);
		setPagina(1); // Reset para primeira página ao buscar
	};

	const handleStatusChange = (valor: string) => {
		setStatus(valor);
		setPagina(1); // Reset para primeira página ao filtrar
	};

	const handleDataChange = (data: Date | undefined) => {
		setDataSelecionada(data);
		setPagina(1); // Reset para primeira página ao mudar data
	};

	return (
		<div className='flex flex-col gap-5 my-5 w-full'>
			<Card>
				<CardHeader>
					<CardTitle>
						Agendamentos
						{dataSelecionada && (
							<span className='text-base font-normal text-muted-foreground ml-2'>
								- {format(dataSelecionada, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
							</span>
						)}
					</CardTitle>
					<CardDescription>
						{total} agendamento(s) encontrado(s)
					</CardDescription>
				</CardHeader>
				<CardContent>
					{/* Filtros */}
					<div className='flex flex-col md:flex-row gap-4 mb-6'>
						{/* Calendário para selecionar data */}
						<Popover>
							<PopoverTrigger asChild>
								<Button
									variant='outline'
									className={cn(
										'w-full md:w-[240px] justify-start text-left font-normal',
										!dataSelecionada && 'text-muted-foreground'
									)}
								>
									<CalendarIcon className='mr-2 h-4 w-4' />
									{dataSelecionada ? (
										format(dataSelecionada, "dd/MM/yyyy", { locale: ptBR })
									) : (
										<span>Selecione uma data</span>
									)}
								</Button>
							</PopoverTrigger>
							<PopoverContent className='w-auto p-0' align='start'>
								<Calendar
									mode='single'
									selected={dataSelecionada}
									onSelect={handleDataChange}
									initialFocus
									locale={ptBR}
								/>
							</PopoverContent>
						</Popover>

						<Input
							placeholder='Buscar por munícipe, processo, CPF...'
							value={busca}
							onChange={(e) => handleBusca(e.target.value)}
							className='flex-1'
						/>
						<Select value={status || undefined} onValueChange={handleStatusChange}>
							<SelectTrigger className='w-full md:w-[180px]'>
								<SelectValue placeholder='Todos os status' />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value='AGENDADO'>Agendado</SelectItem>
								<SelectItem value='CONCLUIDO'>Concluído</SelectItem>
								<SelectItem value='CANCELADO'>Cancelado</SelectItem>
							</SelectContent>
						</Select>
						{(status || dataSelecionada) && (
							<Button
								variant='outline'
								size='sm'
								onClick={() => {
									handleStatusChange('');
									setDataSelecionada(undefined);
								}}
								className='w-full md:w-auto'
							>
								Limpar filtros
							</Button>
						)}
					</div>

					{loading ? (
						<p className='text-center text-muted-foreground py-8'>
							Carregando agendamentos...
						</p>
					) : agendamentos.length === 0 ? (
						<p className='text-center text-muted-foreground py-8'>
							Nenhum agendamento encontrado.
						</p>
					) : (
						<>
							<div className='rounded-md border'>
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>Data e Hora de início</TableHead>
											<TableHead>Munícipe</TableHead>
											<TableHead>CPF</TableHead>
											<TableHead>Processo</TableHead>
											<TableHead>Coordenadoria</TableHead>
											<TableHead>Técnico</TableHead>
											<TableHead>Status</TableHead>
											<TableHead>Ações</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{agendamentos.map((agend) => {
											const permissao = session?.usuario?.permissao;
											const isPontoFocal = permissao === IPermissao.PONTO_FOCAL || permissao === 'PONTO_FOCAL';
											const isTecnico = permissao === IPermissao.TEC || permissao === 'TEC';
											const isAdm = permissao === IPermissao.ADM || permissao === 'ADM';
											const isDev = permissao === IPermissao.DEV || permissao === 'DEV';
											const semTecnico = !agend.tecnico;
											const podeAtribuir = isPontoFocal && semTecnico && agend.coordenadoriaId;
											
											// Verifica se o técnico logado é o técnico do agendamento
											// O JWT usa 'sub' como campo do ID do usuário
											const usuarioId = session?.usuario?.sub || (session?.usuario as any)?.id;
											const tecnicoIdMatch = agend.tecnicoId === usuarioId;
											
											// Botões aparecem apenas para agendamentos que ainda não foram finalizados
											// (AGENDADO ou CONCLUIDO, mas não ATENDIDO ou NAO_REALIZADO)
											const statusPermiteConfirmacao = agend.status === StatusAgendamento.AGENDADO || 
												agend.status === StatusAgendamento.CONCLUIDO;
											
											// Permite confirmar se:
											// 1. É técnico E é o técnico do agendamento
											// 2. OU é ADM/DEV (para testes e administração)
											const podeConfirmar = (isTecnico && tecnicoIdMatch && statusPermiteConfirmacao) ||
												((isAdm || isDev) && tecnicoIdMatch && statusPermiteConfirmacao);
											

											return (
												<TableRow 
													key={agend.id}
													className={semTecnico ? 'bg-orange-100 hover:bg-orange-200' : ''}
												>
													<TableCell>
														<span className='text-sm text-muted-foreground'>
															{formatarDataHora(agend.dataHora)}
														</span>
													</TableCell>
													<TableCell>{agend.municipe || '-'}</TableCell>
													<TableCell>
														<span className='text-sm font-mono'>
															{mascararCPF(agend.cpf)}
														</span>
													</TableCell>
													<TableCell>{agend.processo || '-'}</TableCell>
													<TableCell>
														{agend.coordenadoria?.sigla || '-'}
													</TableCell>
													<TableCell>
														{podeAtribuir ? (
															<AtribuirTecnico
																agendamentoId={agend.id}
																coordenadoriaId={agend.coordenadoriaId!}
																tecnicoAtual={agend.tecnico}
															/>
														) : (
															agend.tecnico?.nome || (
																<span className='text-muted-foreground italic'>Sem técnico</span>
															)
														)}
													</TableCell>
													<TableCell>
														<Badge
															variant={
																agend.status === StatusAgendamento.CONCLUIDO || agend.status === StatusAgendamento.ATENDIDO
																	? 'default'
																	: agend.status === StatusAgendamento.CANCELADO || agend.status === StatusAgendamento.NAO_REALIZADO
																		? 'destructive'
																		: 'secondary'
															}>
															{agend.status === StatusAgendamento.ATENDIDO ? 'Atendido' :
															 agend.status === StatusAgendamento.NAO_REALIZADO ? 'Não Realizado' :
															 agend.status === StatusAgendamento.CONCLUIDO ? 'Concluído' :
															 agend.status === StatusAgendamento.CANCELADO ? 'Cancelado' :
															 'Agendado'}
														</Badge>
													</TableCell>
													<TableCell>
														{podeConfirmar ? (
															<div className='flex gap-2'>
																<Button
																	size='sm'
																	variant='default'
																	onClick={() => {
																		setAgendamentoParaConfirmar({ ...agend, _tipoConfirmacao: 'atendido' } as any);
																	}}
																	className='bg-blue-600 hover:bg-blue-700 text-white'>
																	<CheckCircle2 className='h-4 w-4 mr-1' />
																	Atendido
																</Button>
																<Button
																	size='sm'
																	variant='destructive'
																	onClick={() => {
																		setAgendamentoParaConfirmar({ ...agend, _tipoConfirmacao: 'nao-realizado' } as any);
																	}}
																	className='bg-red-600 hover:bg-red-700'>
																	<XCircle className='h-4 w-4 mr-1' />
																	Não Realizado
																</Button>
															</div>
														) : (
															<span className='text-muted-foreground text-sm'>-</span>
														)}
													</TableCell>
												</TableRow>
											);
										})}
									</TableBody>
								</Table>
							</div>

							{/* Paginação */}
							{totalPaginas > 1 && (
								<div className='flex items-center justify-between mt-4'>
									<div className='text-sm text-muted-foreground'>
										Página {pagina} de {totalPaginas}
									</div>
									<div className='flex gap-2'>
										<Button
											variant='outline'
											size='sm'
											onClick={() => setPagina((p) => Math.max(1, p - 1))}
											disabled={pagina === 1 || loading}
										>
											Anterior
										</Button>
										<Button
											variant='outline'
											size='sm'
											onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
											disabled={pagina === totalPaginas || loading}
										>
											Próxima
										</Button>
									</div>
								</div>
							)}
						</>
					)}
				</CardContent>
			</Card>

			{agendamentoParaConfirmar && (
				<ConfirmarAtendimento
					agendamento={agendamentoParaConfirmar}
					tipoConfirmacao={agendamentoParaConfirmar._tipoConfirmacao}
					onClose={() => setAgendamentoParaConfirmar(null)}
					onSuccess={() => {
						setAgendamentoParaConfirmar(null);
						carregarAgendamentos();
					}}
				/>
			)}
		</div>
	);
}
