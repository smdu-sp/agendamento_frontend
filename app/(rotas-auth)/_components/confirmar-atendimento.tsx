'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { CheckCircle2, XCircle } from 'lucide-react';
import { IAgendamento, StatusAgendamento } from '@/types/agendamento';
import * as agendamentoClient from '@/services/agendamentos/client-functions';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import * as motivoService from '@/services/motivos';
import { IMotivo } from '@/types/motivo';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';

interface ConfirmarAtendimentoProps {
	agendamento: IAgendamento;
	onClose: () => void;
	onSuccess: () => void;
	tipoConfirmacao?: 'atendido' | 'nao-realizado';
}

export default function ConfirmarAtendimento({
	agendamento,
	onClose,
	onSuccess,
	tipoConfirmacao,
}: ConfirmarAtendimentoProps) {
	const { data: session } = useSession();
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);
	const [motivoSelecionado, setMotivoSelecionado] = useState<string>('');
	const [motivos, setMotivos] = useState<IMotivo[]>([]);
	const [showMotivoSelect, setShowMotivoSelect] = useState(tipoConfirmacao === 'nao-realizado');

	// Carrega motivos quando necessário
	const carregarMotivos = async () => {
		if (!session?.access_token) return;
		try {
			const response = await motivoService.listaCompleta(session.access_token);
			if (response.ok && response.data) {
				setMotivos(response.data as IMotivo[]);
			}
		} catch (error) {
			console.error('Erro ao carregar motivos:', error);
		}
	};

	// Carrega motivos quando necessário
	useEffect(() => {
		if (showMotivoSelect && motivos.length === 0 && session?.access_token) {
			carregarMotivos();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [showMotivoSelect]);

	const handleConfirmarRealizado = async () => {
		if (!session?.access_token) {
			toast.error('Não autorizado');
			return;
		}

		setIsLoading(true);
		try {
			const response = await agendamentoClient.atualizar(
				agendamento.id,
				{
					status: StatusAgendamento.ATENDIDO,
				},
				session.access_token,
			);

			if (response.error) {
				toast.error('Erro ao confirmar atendimento', { description: response.error });
			} else {
				toast.success('Atendimento confirmado com sucesso!', {
					description: 'O status foi atualizado para "Atendido".',
				});
				onSuccess();
				onClose();
				router.refresh();
			}
		} catch (error) {
			toast.error('Erro inesperado', {
				description: 'Não foi possível confirmar o atendimento.',
			});
		} finally {
			setIsLoading(false);
		}
	};

	const handleConfirmarNaoRealizado = async () => {
		if (!session?.access_token) {
			toast.error('Não autorizado');
			return;
		}

		if (!motivoSelecionado) {
			toast.error('Selecione um motivo', {
				description: 'É necessário selecionar um motivo para não realização.',
			});
			return;
		}

		setIsLoading(true);
		try {
			const response = await agendamentoClient.atualizar(
				agendamento.id,
				{
					status: StatusAgendamento.NAO_REALIZADO,
					motivoId: motivoSelecionado,
				},
				session.access_token,
			);

			if (response.error) {
				toast.error('Erro ao registrar não realização', { description: response.error });
			} else {
				toast.success('Não realização registrada com sucesso!', {
					description: 'O status foi atualizado para "Não Realizado".',
				});
				onSuccess();
				onClose();
				router.refresh();
			}
		} catch (error) {
			toast.error('Erro inesperado', {
				description: 'Não foi possível registrar a não realização.',
			});
		} finally {
			setIsLoading(false);
		}
	};

	const handleNaoRealizadoClick = async () => {
		if (motivos.length === 0) {
			await carregarMotivos();
		}
		setShowMotivoSelect(true);
	};

	return (
		<Dialog open={true} onOpenChange={onClose}>
			<DialogContent className='sm:max-w-[500px]'>
				<DialogHeader>
					<DialogTitle>
						{tipoConfirmacao === 'atendido' 
							? 'Confirmar Atendimento Realizado'
							: tipoConfirmacao === 'nao-realizado'
							? 'Registrar Não Realização'
							: 'Confirmar Atendimento'}
					</DialogTitle>
					<DialogDescription>
						{tipoConfirmacao === 'atendido' 
							? `Confirme que o atendimento foi realizado para ${agendamento.municipe || 'N/A'}.`
							: tipoConfirmacao === 'nao-realizado'
							? `Registre que o atendimento não foi realizado para ${agendamento.municipe || 'N/A'}.`
							: `Confirme se o atendimento foi realizado ou não para o agendamento de ${agendamento.municipe || 'N/A'}.`}
					</DialogDescription>
				</DialogHeader>

				{showMotivoSelect && (
					<div className='space-y-4 py-4'>
						<div className='space-y-2'>
							<label className='text-sm font-medium'>
								Selecione o motivo da não realização:
							</label>
							<Select
								value={motivoSelecionado}
								onValueChange={setMotivoSelecionado}>
								<SelectTrigger>
									<SelectValue placeholder='Selecione um motivo...' />
								</SelectTrigger>
								<SelectContent>
									{motivos.map((motivo) => (
										<SelectItem key={motivo.id} value={motivo.id}>
											{motivo.texto}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</div>
				)}

				<DialogFooter className='flex-col sm:flex-row gap-2'>
					<Button
						variant='outline'
						onClick={onClose}
						disabled={isLoading}
						className='w-full sm:w-auto'>
						Cancelar
					</Button>
					{tipoConfirmacao === 'atendido' ? (
						<Button
							onClick={handleConfirmarRealizado}
							disabled={isLoading}
							className='w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white'>
							<CheckCircle2 className='mr-2 h-4 w-4' />
							Confirmar Atendido
						</Button>
					) : !showMotivoSelect ? (
						<>
							<Button
								variant='destructive'
								onClick={handleNaoRealizadoClick}
								disabled={isLoading}
								className='w-full sm:w-auto bg-red-600 hover:bg-red-700'>
								<XCircle className='mr-2 h-4 w-4' />
								Não Realizado
							</Button>
							<Button
								onClick={handleConfirmarRealizado}
								disabled={isLoading}
								className='w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white'>
								<CheckCircle2 className='mr-2 h-4 w-4' />
								Atendido
							</Button>
						</>
					) : (
						<Button
							variant='destructive'
							onClick={handleConfirmarNaoRealizado}
							disabled={isLoading || !motivoSelecionado}
							className='w-full sm:w-auto bg-red-600 hover:bg-red-700'>
							<XCircle className='mr-2 h-4 w-4' />
							Confirmar Não Realizado
						</Button>
					)}
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
