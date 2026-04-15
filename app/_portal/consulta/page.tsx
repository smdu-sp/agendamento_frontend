"use client"

import { useEffect, useState } from "react"
import { AlertCircle, ArrowLeft, Calendar, CheckCircle2, Clock, FileText, Search, User, XCircle } from "lucide-react"
import Link from "next/link"
import { ArthurSaboyaFooter } from "@/components/arthur-saboya/footer"
import { ArthurSaboyaHeader } from "@/components/arthur-saboya/header"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { EVENTO_SESSAO_MUNICIPE, municipeEstaLogado } from "@/lib/municipe-sessao"

const BASE = "/portal"
type AgendamentoStatus = "confirmado" | "cancelado" | "realizado" | null
interface Agendamento { protocolo: string; tipo: "processo" | "pre-projeto"; data: string; horario: string; nome: string; numeroProcesso?: string; tipoConsulta?: string; status: AgendamentoStatus }
const mockAgendamentos: Record<string, Agendamento> = {
  "AG-12345678": { protocolo: "AG-12345678", tipo: "processo", data: "2026-04-01", horario: "10:00", nome: "João da Silva", numeroProcesso: "2026/00123", status: "confirmado" },
  "PP-87654321": { protocolo: "PP-87654321", tipo: "pre-projeto", data: "2026-04-02", horario: "14:30", nome: "Maria Santos", tipoConsulta: "Consulta de Viabilidade", status: "confirmado" },
}

export default function ConsultaPage() {
  const [autenticado, setAutenticado] = useState(false)
  const [protocolo, setProtocolo] = useState("")
  const [cpf, setCpf] = useState("")
  const [agendamento, setAgendamento] = useState<Agendamento | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)

  useEffect(() => {
    const sync = () => setAutenticado(municipeEstaLogado())
    sync()
    window.addEventListener(EVENTO_SESSAO_MUNICIPE, sync)
    return () => window.removeEventListener(EVENTO_SESSAO_MUNICIPE, sync)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setNotFound(false)
    setAgendamento(null)
    const found = mockAgendamentos[protocolo.toUpperCase()]
    setNotFound(!found)
    if (found) setAgendamento(found)
  }
  const handleCancel = () => { if (agendamento) { setAgendamento({ ...agendamento, status: "cancelado" }); setShowCancelConfirm(false) } }
  const getStatusBadge = (status: AgendamentoStatus) => {
    switch (status) {
      case "confirmado": return <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800"><CheckCircle2 className="h-4 w-4" />Confirmado</span>
      case "cancelado": return <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-800"><XCircle className="h-4 w-4" />Cancelado</span>
      case "realizado": return <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800"><CheckCircle2 className="h-4 w-4" />Realizado</span>
      default: return null
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <ArthurSaboyaHeader />
      <main className="flex-1">
        <section className="border-b border-border bg-linear-to-br from-primary/5 via-background to-secondary/5 py-12">
          <div className="container mx-auto px-4">
            <Link href={BASE} className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"><ArrowLeft className="h-4 w-4" />Voltar ao Início</Link>
            <div className="flex items-center gap-4"><div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary"><Search className="h-7 w-7 text-primary-foreground" /></div><div><h1 className="text-3xl font-bold text-foreground">Consultar Agendamento</h1><p className="text-muted-foreground">Verifique o status ou cancele seu agendamento</p></div></div>
          </div>
        </section>
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-2xl">
              {!autenticado ? (
                <Card className="mb-8">
                  <CardHeader>
                    <CardTitle>Faça login para consultar</CardTitle>
                    <CardDescription>O acesso à consulta de agendamentos exige autenticação com e-mail e senha.</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                    <Button asChild className="w-full sm:w-auto">
                      <Link href="/portal/acesso?proxima=%2Fconsulta">Entrar</Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full sm:w-auto">
                      <Link href="/portal/cadastro?proxima=%2Fconsulta">Criar conta</Link>
                    </Button>
                  </CardContent>
                </Card>
              ) : null}
              {autenticado ? (
              <Card className="mb-8">
                <CardHeader><CardTitle>Buscar Agendamento</CardTitle><CardDescription>Informe o número do protocolo e CPF para consultar seu agendamento</CardDescription></CardHeader>
                <CardContent>
                  <form onSubmit={handleSearch} className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2"><Label htmlFor="protocolo">Número do Protocolo</Label><Input id="protocolo" value={protocolo} onChange={(e) => setProtocolo(e.target.value)} placeholder="Ex: AG-12345678" required /></div>
                      <div className="space-y-2"><Label htmlFor="cpf">CPF do Solicitante</Label><Input id="cpf" value={cpf} onChange={(e) => setCpf(e.target.value)} placeholder="000.000.000-00" required /></div>
                    </div>
                    <Button type="submit" className="w-full sm:w-auto"><Search className="mr-2 h-4 w-4" />Consultar</Button>
                  </form>
                </CardContent>
              </Card>
              ) : null}
              {autenticado && notFound && <Alert variant="destructive" className="mb-8"><AlertCircle className="h-4 w-4" /><AlertTitle>Agendamento não encontrado</AlertTitle><AlertDescription>Não foi possível localizar um agendamento com os dados informados. Verifique o número do protocolo e tente novamente.</AlertDescription></Alert>}
              {autenticado && agendamento && (
                <Card>
                  <CardHeader><div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><CardTitle className="flex items-center gap-2">{agendamento.tipo === "processo" ? <FileText className="h-5 w-5 text-primary" /> : <FileText className="h-5 w-5 text-secondary" />}{agendamento.tipo === "processo" ? "Processo em Trâmite" : "Pré-Projeto"}</CardTitle><CardDescription>Protocolo: {agendamento.protocolo}</CardDescription></div>{getStatusBadge(agendamento.status)}</div></CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="flex items-start gap-3"><Calendar className="mt-0.5 h-5 w-5 text-muted-foreground" /><div><p className="text-sm text-muted-foreground">Data</p><p className="font-medium">{new Date(agendamento.data + "T12:00:00").toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })}</p></div></div>
                      <div className="flex items-start gap-3"><Clock className="mt-0.5 h-5 w-5 text-muted-foreground" /><div><p className="text-sm text-muted-foreground">Horário</p><p className="font-medium">{agendamento.horario}</p></div></div>
                      <div className="flex items-start gap-3"><User className="mt-0.5 h-5 w-5 text-muted-foreground" /><div><p className="text-sm text-muted-foreground">Solicitante</p><p className="font-medium">{agendamento.nome}</p></div></div>
                      {agendamento.numeroProcesso && <div className="flex items-start gap-3"><FileText className="mt-0.5 h-5 w-5 text-muted-foreground" /><div><p className="text-sm text-muted-foreground">Número do Processo</p><p className="font-medium">{agendamento.numeroProcesso}</p></div></div>}
                    </div>
                    {agendamento.status === "confirmado" && !showCancelConfirm && <div className="flex flex-col gap-3 border-t border-border pt-6 sm:flex-row"><Button variant="outline" className="text-destructive hover:bg-destructive/10" onClick={() => setShowCancelConfirm(true)}><XCircle className="mr-2 h-4 w-4" />Cancelar Agendamento</Button></div>}
                    {showCancelConfirm && <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4"><p className="mb-4 text-sm text-destructive"><strong>Tem certeza que deseja cancelar este agendamento?</strong><br />Esta ação não pode ser desfeita.</p><div className="flex gap-3"><Button variant="destructive" size="sm" onClick={handleCancel}>Sim, Cancelar</Button><Button variant="outline" size="sm" onClick={() => setShowCancelConfirm(false)}>Não, Voltar</Button></div></div>}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </section>
      </main>
      <ArthurSaboyaFooter />
    </div>
  )
}
