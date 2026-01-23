/** @format */

import { auth } from '@/lib/auth/auth';
import { redirect } from 'next/navigation';
import * as agendamento from '@/services/agendamentos';
import { IAgendamento } from '@/types/agendamento';
import { IPermissao } from '@/types/usuario';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import ImportarPlanilha from './_components/importar-planilha';
import AtribuirTecnico from './_components/atribuir-tecnico';

export default async function Home() {
	const session = await auth();
	if (!session) {
		redirect('/login');
	}

	let agendamentos: IAgendamento[] = [];
	let titulo = 'Agendamentos do Dia';

	if (session && session.access_token) {
		const response = await agendamento.buscarDoDia(session.access_token);
		if (response.ok && response.data) {
			agendamentos = response.data as IAgendamento[];
		}

		// Define título baseado na permissão
		const permissao = session.usuario?.permissao;
		if (permissao === IPermissao.TEC) {
			titulo = 'Meus Agendamentos do Dia';
		} else if (permissao === IPermissao.PONTO_FOCAL) {
			titulo = 'Agendamentos da Coordenadoria';
		}
	}

	return (
		<div className=' w-full relative px-0 md:px-8 pb-10 md:pb-0'>
			<div className='flex justify-between items-center mb-5'>
				<h1 className='text-xl md:text-4xl font-bold'>{titulo}</h1>
				{(session.usuario?.permissao === IPermissao.ADM || session.usuario?.permissao === IPermissao.DEV) && (
					<ImportarPlanilha />
				)}
			</div>
			<div className='flex flex-col gap-5 my-5 w-full'>
				<Card>
					<CardHeader>
						<CardTitle>Agendamentos de {format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</CardTitle>
						<CardDescription>
							{agendamentos.length} agendamento(s) encontrado(s)
						</CardDescription>
					</CardHeader>
					<CardContent>
						{agendamentos.length === 0 ? (
							<p className='text-center text-muted-foreground py-8'>
								Nenhum agendamento encontrado para hoje.
							</p>
						) : (
							<div className='rounded-md border'>
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>Horário</TableHead>
											<TableHead>Munícipe</TableHead>
											<TableHead>Processo</TableHead>
											<TableHead>Coordenadoria</TableHead>
											<TableHead>Técnico</TableHead>
											<TableHead>Status</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{agendamentos.map((agend) => {
											const isPontoFocal = session.usuario?.permissao === IPermissao.PONTO_FOCAL;
											const semTecnico = !agend.tecnico;
											const podeAtribuir = isPontoFocal && semTecnico && agend.coordenadoriaId;

											return (
												<TableRow key={agend.id}>
													<TableCell>
														{format(new Date(agend.dataHora), 'HH:mm')}
														{agend.dataFim && ` - ${format(new Date(agend.dataFim), 'HH:mm')}`}
													</TableCell>
													<TableCell>{agend.municipe || '-'}</TableCell>
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
																agend.status === 'CONCLUIDO'
																	? 'default'
																	: agend.status === 'CANCELADO'
																		? 'destructive'
																		: 'secondary'
															}>
															{agend.status}
														</Badge>
													</TableCell>
												</TableRow>
											);
										})}
									</TableBody>
								</Table>
							</div>
						)}
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
