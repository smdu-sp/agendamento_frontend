"use client"

import { useCallback, useEffect, useState } from "react"
import { ArrowLeft, FileText } from "lucide-react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { ArthurSaboyaFooter } from "@/components/arthur-saboya/footer"
import { ArthurSaboyaHeader } from "@/components/arthur-saboya/header"
import { ArthurSaboyaPageBackgroundBanner } from "@/components/arthur-saboya/page-background-banner"
import { PreProjetoChamadoChat } from "@/components/arthur-saboya/pre-projeto-chamado-chat"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  EVENTO_SESSAO_MUNICIPE,
  municipeEstaLogado,
  obterTokenMunicipe,
} from "@/lib/municipe-sessao"
import * as agendamento from "@/services/agendamentos"
import type { ISolicitacaoPreProjetoArthurSaboyaDetalhe } from "@/types/solicitacao-pre-projeto-arthur-saboya"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

const BASE = "/portal"

function rotuloStatus(s: ISolicitacaoPreProjetoArthurSaboyaDetalhe["status"]) {
  switch (s) {
    case "SOLICITADO":
      return "Solicitado"
    case "RESPONDIDO":
      return "Solucionado"
    case "AGUARDANDO_DATA":
      return "Aguardando data"
    case "AGENDAMENTO_CRIADO":
      return "Enviado à coordenadoria"
    default:
      return s
  }
}

export default function ConsultaChamadoDetalhePage() {
  const params = useParams()
  const router = useRouter()
  const id = typeof params?.id === "string" ? params.id : ""
  const [hidratar, setHidratar] = useState(false)
  const [autenticado, setAutenticado] = useState(false)
  const [chamado, setChamado] = useState<ISolicitacaoPreProjetoArthurSaboyaDetalhe | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  const carregar = useCallback(async () => {
    const token = obterTokenMunicipe()
    if (!token || !id) {
      setCarregando(false)
      return
    }
    setCarregando(true)
    setErro(null)
    const res = await agendamento.obterChamadoPreProjetosMunicipe(token, id)
    if (!res.ok || !res.data) {
      setErro(res.error ?? "Chamado não encontrado.")
      setChamado(null)
      setCarregando(false)
      return
    }
    setChamado(res.data)
    setCarregando(false)
  }, [id])

  useEffect(() => {
    const sync = () => setAutenticado(municipeEstaLogado())
    sync()
    setHidratar(true)
    window.addEventListener(EVENTO_SESSAO_MUNICIPE, sync)
    return () => window.removeEventListener(EVENTO_SESSAO_MUNICIPE, sync)
  }, [])

  useEffect(() => {
    if (!autenticado || !id) {
      setCarregando(false)
      return
    }
    void carregar()
  }, [autenticado, id, carregar])

  const enviar = async (texto: string) => {
    const token = obterTokenMunicipe()
    if (!token || !id) return
    setEnviando(true)
    const res = await agendamento.enviarMensagemChamadoPreProjetosMunicipe(token, id, texto)
    setEnviando(false)
    if (!res.ok || !res.data) {
      setErro(res.error ?? "Falha ao enviar.")
      return
    }
    setErro(null)
    setChamado(res.data)
  }

  if (!hidratar) {
    return (
      <div className="flex min-h-screen flex-col">
        <ArthurSaboyaHeader />
        <main className="flex flex-1 items-center justify-center bg-[#D1EBE8]/20 px-4">
          <p className="text-sm text-muted-foreground">Carregando…</p>
        </main>
        <ArthurSaboyaFooter />
      </div>
    )
  }

  if (!autenticado) {
    return (
      <div className="flex min-h-screen flex-col">
        <ArthurSaboyaHeader />
        <ArthurSaboyaPageBackgroundBanner>
          <Link
            href={`${BASE}/acesso?proxima=${encodeURIComponent(`${BASE}/consulta/${id}`)}`}
            className="mb-4 inline-flex items-center gap-2 text-sm text-white/90 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Entrar para ver este chamado
          </Link>
          <h1 className="text-2xl font-bold text-white">Chamado</h1>
        </ArthurSaboyaPageBackgroundBanner>
        <main className="flex-1 bg-[#D1EBE8]/20 py-12">
          <div className="container mx-auto max-w-lg px-4">
            <Card>
              <CardHeader>
                <CardTitle>Login necessário</CardTitle>
                <CardDescription>Autentique-se para ver o histórico e enviar mensagens.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                <Button asChild>
                  <Link href={`${BASE}/acesso?proxima=${encodeURIComponent(`${BASE}/consulta/${id}`)}`}>
                    Entrar
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href={`${BASE}/consulta`}>Voltar à lista</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
        <ArthurSaboyaFooter />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <ArthurSaboyaHeader />
      <ArthurSaboyaPageBackgroundBanner>
        <button
          type="button"
          onClick={() => router.push(`${BASE}/consulta`)}
          className="mb-4 inline-flex items-center gap-2 text-sm text-white/90 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar à lista
        </button>
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#E56E14]">
            <FileText className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white md:text-3xl">
              {chamado ? `Chamado ${chamado.protocolo}` : "Chamado"}
            </h1>
            <p className="text-white/90">Pré-projetos — Sala Arthur Saboya</p>
          </div>
        </div>
      </ArthurSaboyaPageBackgroundBanner>
      <main className="flex-1 bg-[#D1EBE8]/20 py-10">
        <div className="container mx-auto max-w-3xl px-4">
          {erro ? (
            <div
              role="alert"
              className="mb-4 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive"
            >
              {erro}
            </div>
          ) : null}
          {carregando ? (
            <p className="text-sm text-muted-foreground">Carregando chamado…</p>
          ) : chamado ? (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Dados do pedido</CardTitle>
                  <CardDescription>
                    Aberto em{" "}
                    {format(new Date(chamado.criadoEm), "dd/MM/yyyy HH:mm", { locale: ptBR })} — status:{" "}
                    <strong>{rotuloStatus(chamado.status)}</strong>
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-2 text-sm sm:grid-cols-2">
                  <p>
                    <span className="text-muted-foreground">Solicitante:</span> {chamado.nome}
                  </p>
                  <p>
                    <span className="text-muted-foreground">E-mail:</span> {chamado.email}
                  </p>
                  <p className="sm:col-span-2">
                    <span className="text-muted-foreground">Formação:</span> {chamado.formacaoTexto}
                  </p>
                  <p className="sm:col-span-2">
                    <span className="text-muted-foreground">Natureza:</span> {chamado.naturezaTexto}
                  </p>
                </CardContent>
              </Card>
              <PreProjetoChamadoChat
                mensagens={chamado.mensagens ?? []}
                onEnviar={enviar}
                enviando={enviando}
                titulo="Andamentos do chamado"
              />
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Não foi possível exibir este chamado.</p>
          )}
        </div>
      </main>
      <ArthurSaboyaFooter />
    </div>
  )
}
