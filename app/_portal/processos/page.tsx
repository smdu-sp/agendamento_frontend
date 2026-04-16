"use client"

import { ArrowLeft, ExternalLink, FileText } from "lucide-react"
import Link from "next/link"
import { ArthurSaboyaFooter } from "@/components/arthur-saboya/footer"
import { ArthurSaboyaHeader } from "@/components/arthur-saboya/header"
import { ArthurSaboyaPageBackgroundBanner } from "@/components/arthur-saboya/page-background-banner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const BASE = "/portal"
const SMUL_AGENDAMENTO_URL = "https://smulagendamento.prefeitura.sp.gov.br/PaginasPublicas/frmPaginaInicial.aspx"

export default function ProcessosPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <ArthurSaboyaHeader />
      <ArthurSaboyaPageBackgroundBanner>
        <Link href={BASE} className="mb-4 inline-flex items-center gap-2 text-sm text-white/90 transition-colors hover:text-white">
          <ArrowLeft className="h-4 w-4" />Voltar ao Início
        </Link>
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#E56E14]">
            <FileText className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Processos em Trâmite</h1>
            <p className="text-white/90">Agendamento para processos já protocolados</p>
          </div>
        </div>
      </ArthurSaboyaPageBackgroundBanner>
      <main className="flex-1">
        <section className="bg-[#D1EBE8]/20 py-12">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-2xl">
              <Card className="h-[210px] rounded-2xl border border-[rgba(0,91,144,0.2)] bg-white shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.1)]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <ExternalLink className="h-5 w-5 text-[#E56E14]" />
                    Agendamento On-line - SMUL
                  </CardTitle>
                  <CardDescription>O agendamento de atendimento para processos em trâmite é feito pela plataforma oficial da Secretaria Municipal de Urbanismo e Licenciamento (SMUL). Lá você pode solicitar horário, consultar ou cancelar seu agendamento.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-muted-foreground">Você será direcionado para o site da Prefeitura de São Paulo.</p>
                  <Button asChild size="lg" className="shrink-0 gap-2 bg-[#E56E14] text-white hover:bg-[#CC5F10]">
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
