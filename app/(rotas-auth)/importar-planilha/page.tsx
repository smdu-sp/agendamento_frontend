/** @format */

import { auth } from '@/lib/auth/auth';
import { redirect } from 'next/navigation';
import { IPermissao } from '@/types/usuario';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import ImportarPlanilhaForm from './_components/importar-planilha-form';

export default async function ImportarPlanilhaPage() {
	const session = await auth();
	if (!session) {
		redirect(`${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}/login`);
	}

	// Verifica se o usuário tem permissão (ADM ou DEV)
	// A permissão pode vir como string do JWT ou como número do enum
	const permissao = session.usuario?.permissao;
	const isAdm = permissao as unknown as IPermissao === IPermissao.ADM || permissao === 'ADM';
	const isDev = permissao as unknown as IPermissao === IPermissao.DEV || permissao === 'DEV';
		if (!isAdm && !isDev) {
		redirect(`${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}/`);
	}

	return (
		<div className=' w-full relative px-0 md:px-8 pb-10 md:pb-0'>
			<h1 className='text-xl md:text-4xl font-bold mb-5'>Importar Planilha de Agendamentos</h1>
			<div className='flex flex-col gap-5 my-5 w-full max-w-2xl'>
				<Card>
					<CardHeader>
						<CardTitle>Upload de Planilha Excel</CardTitle>
						<CardDescription>
							Selecione o arquivo Excel (.xlsx ou .xls) com os agendamentos a serem importados.
							<br />
							<span className='text-xs'>
								Tamanho máximo: 10MB. A planilha deve conter as colunas: RF, Munícipe, RG, CPF, Processo, Data/Hora, Resumo.
							</span>
						</CardDescription>
					</CardHeader>
					<CardContent>
						<ImportarPlanilhaForm />
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
