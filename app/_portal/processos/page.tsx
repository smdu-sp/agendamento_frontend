"use client"

import { ArrowLeft, ExternalLink, FileText } from "lucide-react"
import Link from "next/link"
import { ArthurSaboyaFooter } from "@/components/arthur-saboya/footer"
import { ArthurSaboyaHeader } from "@/components/arthur-saboya/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const BASE = "/portal"
const SMUL_AGENDAMENTO_URL = "https://smulagendamento.prefeitura.sp.gov.br/PaginasPublicas/frmPaginaInicial.aspx"

export default function ProcessosPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <ArthurSaboyaHeader />
      <main className="flex-1">
        <section className="border-b border-border bg-gradient-to-br from-primary/5 via-background to-primary/10 py-12">
          <div className="container mx-auto px-4">
            <Link href={BASE} className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
              <ArrowLeft className="h-4 w-4" />Voltar ao Início
            </Link>
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary"><FileText className="h-7 w-7 text-primary-foreground" /></div>
              <div><h1 className="text-3xl font-bold text-foreground">Processos em Trâmite</h1><p className="text-muted-foreground">Agendamento para processos já protocolados</p></div>
            </div>
          </div>
        </section>
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-2xl">
              <Card className="border-primary/20 shadow-md transition-shadow hover:shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl"><ExternalLink className="h-5 w-5 text-primary" />Agendamento On-line - SMUL</CardTitle>
                  <CardDescription>O agendamento de atendimento para processos em trâmite é feito pela plataforma oficial da Secretaria Municipal de Urbanismo e Licenciamento (SMUL). Lá você pode solicitar horário, consultar ou cancelar seu agendamento.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-muted-foreground">Você será direcionado para o site da Prefeitura de São Paulo.</p>
                  <Button asChild size="lg" className="shrink-0 gap-2">
                    <a href={SMUL_AGENDAMENTO_URL} target="_blank" rel="noopener noreferrer">Ir para o agendamento<ExternalLink className="h-4 w-4" /></a>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <ArthurSaboyaFooter />
    </div>
  )
}
