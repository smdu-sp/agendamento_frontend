/** @format */

'use server';

import { auth } from '@/lib/auth/auth';
import { getApiUrl } from '@/lib/api-url';
import { revalidatePath, revalidateTag } from 'next/cache';
import { redirect } from 'next/navigation';
import { IRespostaUsuario, IUpdateUsuario, IUsuario } from '@/types/usuario';

export async function atualizar(
  id: string,
  data: IUpdateUsuario,
): Promise<IRespostaUsuario> {
  const session = await auth();
  const baseURL = getApiUrl();
  if (!session) redirect('/login');
  try {
    const response: Response = await fetch(`${baseURL}usuarios/atualizar/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session?.access_token}`,
      },
      body: JSON.stringify(data),
    });
    const dataResponse = await response.json();
    if (response.status === 200) {
      revalidateTag('users', 'max');
      revalidateTag('user-by-id', 'max');
      revalidatePath('/');
      return {
        ok: true,
        error: null,
        data: dataResponse as IUsuario,
        status: 200,
      };
    }
    if (!dataResponse) {
      return {
        ok: false,
        error: 'Erro ao atualizar usuário.',
        data: null,
        status: 500,
      };
    }
    const rawMessage = (dataResponse as { message?: unknown })?.message;
    const errorMessage = Array.isArray(rawMessage)
      ? rawMessage.join(' ')
      : typeof rawMessage === 'string'
        ? rawMessage
        : 'Erro ao atualizar usuário.';
    return {
      ok: false,
      error: errorMessage,
      data: null,
      status: (dataResponse as { statusCode?: number })?.statusCode ?? response.status ?? 500,
    };
  } catch (error) {
    console.log(error);
    return {
      ok: false,
      error:
        error instanceof Error && /fetch|ECONNREFUSED|network/i.test(error.message)
          ? 'API indisponível. Verifique se o backend está em execução.'
          : 'Erro ao atualizar usuário.',
      data: null,
      status: 500,
    };
  }
}
