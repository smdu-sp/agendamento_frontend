/** @format */

/**
 * Retorna a URL da API correta baseado no ambiente:
 * - Server-side (Docker): usa INTERNAL_API_URL para evitar timeout
 * - Client-side: usa NEXT_PUBLIC_API_URL
 */
export function getApiUrl(): string {
  // Em server-side, prefere INTERNAL_API_URL
  if (typeof window === 'undefined') {
    return process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || '';
  }
  // Em client-side, usa a URL pública
  return process.env.NEXT_PUBLIC_API_URL || '';
}

// Para compatibilidade com código existente
export const API_URL = getApiUrl();
