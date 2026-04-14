"use client"

import { useState } from "react"
import { Lightbulb, ArrowLeft, User, Mail, CheckCircle2, Send } from "lucide-react"
import Link from "next/link"
import { ArthurSaboyaHeader } from "@/components/arthur-saboya/header"
import { ArthurSaboyaFooter } from "@/components/arthur-saboya/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

const BASE = "/processos"

const FORMACOES = [
  { value: "engenheiro-civil", label: "Engenheiro Civil" },
  { value: "arquiteto", label: "Arquiteto" },
  { value: "tecnologo", label: "Tecnólogo" },
  { value: "outra", label: "Outra" },
] as const

const NATUREZAS_DUVIDA = [
  { value: "his-hmp-parcelamento", label: "HIS / HMP ou Parcelamento do Solo" },
  { value: "residencial-unifamiliar-certificado", label: "Residencial Unifamiliar ou Certificado de Conclusão" },
  { value: "residencial-multifamiliar", label: "Residencial Multifamiliar" },
  { value: "servicos-institucional", label: "Serviços ou Institucional" },
  { value: "comercio-industria", label: "Comércio ou Indústria" },
  { value: "regularizacao-imoveis", label: "Regularização de Imóveis" },
  { value: "acessibilidade-seguranca", label: "Acessibilidade ou Segurança da Edificação" },
  { value: "outra", label: "Outra" },
] as const

const initialForm = { nome: "", email: "", formacao: "", formacaoOutro: "", naturezaDuvida: "", naturezaOutro: "", descricao: "" }

function protocoloExibicao(id: string): string {
  const hex = id.replace(/-/g, "")
  return `PP-${hex.slice(0, 8).toUpperCase()}`
}

export default function PreProjetosPage() {
  const [submitted, setSubmitted] = useState(false)
  const [formData, setFormData] = useState(initialForm)
  const [protocoloId, setProtocoloId] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const base = process.env.NEXT_PUBLIC_AGENDAMENTOS_API_URL?.replace(/\/$/, "")
    if (!base) {
      setSubmitError("Defina NEXT_PUBLIC_AGENDAMENTOS_API_URL (ex.: http://localhost:3000) no .env.local.")
      return
    }
    setSubmitting(true)
    setSubmitError(null)
    try {
      const res = await fetch(`${base}/agendamentos/publico/pre-projetos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: formData.nome.trim(),
          email: formData.email.trim(),
          formacao: formData.formacao,
          ...(formData.formacao === "outra" && { formacaoOutro: formData.formacaoOutro.trim() }),
          naturezaDuvida: formData.naturezaDuvida,
          ...(formData.naturezaDuvida === "outra" && { naturezaOutro: formData.naturezaOutro.trim() }),
          descricao: formData.descricao.trim(),
        }),
      })
      const data = (await res.json().catch(() => null)) as { id?: string; message?: string | string[]; error?: string } | null
      if (!res.ok) {
        const msg = data?.message ?? data?.error
        const text = Array.isArray(msg) ? msg.join(" ") : msg || `Erro ${res.status}`
        throw new Error(text)
      }
      const id = data?.id ? String(data.id) : null
      if (!id) throw new Error("Resposta da API sem identificador.")
      setProtocoloId(id)
      setSubmitted(true)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Falha ao enviar. Tente novamente.")
    } finally {
      setSubmitting(false)
    }
  }

  const formacaoOk = formData.formacao && (formData.formacao !== "outra" || formData.formacaoOutro.trim().length > 0)
  const naturezaOk = formData.naturezaDuvida && (formData.naturezaDuvida !== "outra" || formData.naturezaOutro.trim().length > 0)
  const isFormValid = Boolean(formData.nome.trim()) && Boolean(formData.email.trim()) && formacaoOk && naturezaOk && Boolean(formData.descricao.trim())

  const getFormacaoLabel = () => (formData.formacao === "outra" ? formData.formacaoOutro.trim() : FORMACOES.find((f) => f.value === formData.formacao)?.label ?? formData.formacao)
  const getNaturezaLabel = () => (formData.naturezaDuvida === "outra" ? formData.naturezaOutro.trim() : NATUREZAS_DUVIDA.find((n) => n.value === formData.naturezaDuvida)?.label ?? formData.naturezaDuvida)

  return (
    <div className="flex min-h-screen flex-col">
      <ArthurSaboyaHeader />
      <main className="flex-1">
        <section className="border-b border-border bg-gradient-to-br from-secondary/5 via-background to-secondary/10 py-12">
          <div className="container mx-auto px-4">
            <Link href={BASE} className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"><ArrowLeft className="h-4 w-4" />Voltar ao Início</Link>
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-secondary"><Lightbulb className="h-7 w-7 text-secondary-foreground" /></div>
              <div><h1 className="text-3xl font-bold text-foreground">Pré-Projetos</h1><p className="text-muted-foreground">Consultas prévias e orientações técnicas</p></div>
            </div>
          </div>
        </section>
        <section className="py-12">
          <div className="container mx-auto px-4">
            {!submitted ? (
              <div className="mx-auto max-w-2xl">
                <Card>
                  <CardHeader><CardTitle className="flex items-center gap-2"><Send className="h-5 w-5 text-secondary" />Solicitar Orientação Técnica</CardTitle><CardDescription>Preencha o formulário abaixo para enviar sua dúvida. Nossa equipe entrará em contato em até 5 dias úteis.</CardDescription></CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      {submitError ? <div role="alert" className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">{submitError}</div> : null}
                      <div className="space-y-2"><Label htmlFor="nome">Nome completo</Label><div className="relative"><User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input id="nome" name="nome" value={formData.nome} onChange={handleInputChange} placeholder="Seu nome completo" className="pl-10" required /></div></div>
                      <div className="space-y-2"><Label htmlFor="email">Seu principal e-mail para contato</Label><div className="relative"><Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="seu@email.com" className="pl-10" required /></div></div>
                      <div className="space-y-3" role="group" aria-labelledby="label-formacao">
                        <p id="label-formacao" className="text-sm font-medium leading-none text-foreground">Indique a sua formação:</p>
                        <RadioGroup value={formData.formacao || undefined} onValueChange={(value) => setFormData((prev) => ({ ...prev, formacao: value, formacaoOutro: value === "outra" ? prev.formacaoOutro : "" }))} className="gap-3">
                          {FORMACOES.map((opt) => (<div key={opt.value} className="flex items-start gap-3"><RadioGroupItem value={opt.value} id={`formacao-${opt.value}`} className="mt-0.5" /><Label htmlFor={`formacao-${opt.value}`} className="cursor-pointer font-normal leading-snug">{opt.label}</Label></div>))}
                        </RadioGroup>
                        {formData.formacao === "outra" && <div className="space-y-2 pl-7 pt-1"><Label htmlFor="formacaoOutro">Especifique sua formação</Label><Input id="formacaoOutro" name="formacaoOutro" value={formData.formacaoOutro} onChange={handleInputChange} placeholder="Descreva sua formação" required /></div>}
                      </div>
                      <div className="space-y-3" role="group" aria-labelledby="label-natureza">
                        <p id="label-natureza" className="text-sm font-medium leading-none text-foreground">Qual a natureza de sua dúvida?</p>
                        <RadioGroup value={formData.naturezaDuvida || undefined} onValueChange={(value) => setFormData((prev) => ({ ...prev, naturezaDuvida: value, naturezaOutro: value === "outra" ? prev.naturezaOutro : "" }))} className="gap-3">
                          {NATUREZAS_DUVIDA.map((opt) => (<div key={opt.value} className="flex items-start gap-3"><RadioGroupItem value={opt.value} id={`natureza-${opt.value}`} className="mt-0.5" /><Label htmlFor={`natureza-${opt.value}`} className="cursor-pointer font-normal leading-snug">{opt.label}</Label></div>))}
                        </RadioGroup>
                        {formData.naturezaDuvida === "outra" && <div className="space-y-2 pl-7 pt-1"><Label htmlFor="naturezaOutro">Especifique a natureza da dúvida</Label><Input id="naturezaOutro" name="naturezaOutro" value={formData.naturezaOutro} onChange={handleInputChange} placeholder="Descreva a natureza da sua dúvida" required /></div>}
                      </div>
                      <div className="space-y-2"><Label htmlFor="descricao">Descreva brevemente sua dúvida ou indique o amparo legal que precisa compreender melhor.</Label><Textarea id="descricao" name="descricao" value={formData.descricao} onChange={handleInputChange} rows={6} required /></div>
                      <div className="rounded-lg border border-border bg-muted/50 p-4"><p className="text-sm text-muted-foreground">Ao enviar este formulário, você concorda com o tratamento dos seus dados pessoais conforme a Lei Geral de Proteção de Dados (LGPD).</p></div>
                      <div className="flex justify-end pt-2"><Button type="submit" className="bg-secondary hover:bg-secondary/90" disabled={!isFormValid || submitting}><Send className="mr-2 h-4 w-4" />{submitting ? "Enviando..." : "Enviar Solicitação"}</Button></div>
                    </form>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="mx-auto max-w-2xl">
                <Card className="border-green-200 bg-green-50/50">
                  <CardHeader className="text-center"><div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100"><CheckCircle2 className="h-8 w-8 text-green-600" /></div><CardTitle className="text-2xl text-green-800">Solicitação Enviada!</CardTitle><CardDescription className="text-green-700">Sua consulta foi recebida e será analisada pela equipe técnica.</CardDescription></CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4 rounded-lg bg-card p-6">
                      <div className="flex items-center justify-between border-b border-border pb-3"><span className="text-sm text-muted-foreground">Protocolo de Solicitação</span><span className="font-mono font-bold text-foreground">{protocoloId ? protocoloExibicao(protocoloId) : "-"}</span></div>
                      <div className="grid gap-4 sm:grid-cols-2"><div><p className="text-sm text-muted-foreground">Nome completo</p><p className="font-medium text-foreground">{formData.nome}</p></div><div><p className="text-sm text-muted-foreground">E-mail</p><p className="font-medium text-foreground">{formData.email}</p></div><div className="sm:col-span-2"><p className="text-sm text-muted-foreground">Formação</p><p className="font-medium text-foreground">{getFormacaoLabel()}</p></div><div className="sm:col-span-2"><p className="text-sm text-muted-foreground">Natureza da dúvida</p><p className="font-medium text-foreground">{getNaturezaLabel()}</p></div></div>
                      <div className="border-t border-border pt-4"><p className="mb-2 text-sm text-muted-foreground">Descrição</p><p className="rounded-lg bg-muted/50 p-3 text-sm text-foreground">{formData.descricao}</p></div>
                    </div>
                    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4"><p className="text-sm text-amber-800"><strong>Prazo de Resposta:</strong> Nossa equipe técnica entrará em contato em até 5 dias úteis através do e-mail informado. Guarde o número do protocolo para futuras consultas.</p></div>
                    <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                      <Link href={BASE}><Button variant="outline" className="w-full sm:w-auto">Voltar ao Início</Button></Link>
                      <Button onClick={() => { setSubmitted(false); setProtocoloId(null); setFormData(initialForm); setSubmitError(null) }} className="w-full bg-secondary hover:bg-secondary/90 sm:w-auto">Nova Solicitação</Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </section>
      </main>
      <ArthurSaboyaFooter />
    </div>
  )
}
