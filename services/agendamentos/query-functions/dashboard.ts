"use client";

import { getApiUrl } from '@/lib/api-url';
import { IDashboard, IRespostaDashboard } from "@/types/dashboard";

export async function getDashboard(
  access_token: string,
  ano?: number,
  coordenadoriaId?: string,
): Promise<IRespostaDashboard> {
  const baseURL = getApiUrl();
  try {
    const params = new URLSearchParams();
    if (ano != null) params.set("ano", String(ano));
    if (coordenadoriaId) params.set("coordenadoriaId", coordenadoriaId);

    const url = `${baseURL}agendamentos/dashboard${params.toString() ? `?${params}` : ""}`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`,
      },
    });
    const data = await response.json();

    if (response.status === 200) {
      return {
        ok: true,
        error: null,
        data: data as IDashboard,
        status: 200,
      };
    }
    return {
      ok: false,
      error: data.message ?? "Erro ao carregar dashboard.",
      data: null,
      status: data.statusCode ?? response.status,
    };
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : "Não foi possível carregar o dashboard.",
      data: null,
      status: 400,
    };
  }
}
