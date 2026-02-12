"use client";

import { getApiUrl } from '@/lib/api-url';
import { getAuthHeaders } from '@/lib/api-headers';
import { IDashboard, IRespostaDashboard } from "@/types/dashboard";

export type TipoPeriodoDashboard = "semana" | "mes" | "ano";

export async function getDashboard(
  access_token: string,
  opts?: {
    tipoPeriodo?: TipoPeriodoDashboard;
    ano?: number;
    mes?: number;
    semanaInicio?: string;
    dataInicio?: string;
    dataFim?: string;
    coordenadoriaId?: string;
  },
): Promise<IRespostaDashboard> {
  const baseURL = getApiUrl();
  try {
    const params = new URLSearchParams();
    if (opts?.tipoPeriodo) params.set("tipoPeriodo", opts.tipoPeriodo);
    if (opts?.ano != null) params.set("ano", String(opts.ano));
    if (opts?.mes != null) params.set("mes", String(opts.mes));
    if (opts?.semanaInicio) params.set("semanaInicio", opts.semanaInicio);
    if (opts?.dataInicio) params.set("dataInicio", opts.dataInicio);
    if (opts?.dataFim) params.set("dataFim", opts.dataFim);
    if (opts?.coordenadoriaId) params.set("coordenadoriaId", opts.coordenadoriaId);

    const url = `${baseURL}agendamentos/dashboard${params.toString() ? `?${params}` : ""}`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(access_token),
      },
      cache: "no-store",
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
