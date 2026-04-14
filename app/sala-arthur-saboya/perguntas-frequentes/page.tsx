import type { ReactNode } from "react"
import Link from "next/link"
import { ArrowLeft, HelpCircle } from "lucide-react"
import { ArthurSaboyaFooter } from "@/components/arthur-saboya/footer"
import { ArthurSaboyaHeader } from "@/components/arthur-saboya/header"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

const BASE = "/processos"
const SMUL_AGENDAMENTO_URL = "https://smulagendamento.prefeitura.sp.gov.br/PaginasPublicas/frmPaginaInicial.aspx"
const FAZENDA_IPTU_URL = "https://prefeitura.sp.gov.br/web/fazenda/servicos/iptu/"
const SIMPROC_URL = "https://simprocservicos.prefeitura.sp.gov.br/Forms/consultarProcessos.aspx"
function Answer({ children }: { children: ReactNode }) { return <div className="space-y-3 leading-relaxed text-muted-foreground">{children}</div> }
function P({ children }: { children: ReactNode }) { return <p>{children}</p> }

export default function PerguntasFrequentesPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <ArthurSaboyaHeader />
      <main className="flex-1">
        <section className="border-b border-border bg-gradient-to-br from-primary/5 via-background to-primary/10 py-12">
          <div className="container mx-auto px-4">
            <Link href={BASE} className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"><ArrowLeft className="h-4 w-4" />Voltar ao Início</Link>
            <div className="flex items-center gap-4"><div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary"><HelpCircle className="h-7 w-7 text-primary-foreground" /></div><div><h1 className="text-3xl font-bold text-foreground">Perguntas e respostas</h1><p className="text-muted-foreground">Dúvidas frequentes sobre a SMUL, processos e serviços relacionados</p></div></div>
          </div>
        </section>
        <section className="py-12">
          <div className="container mx-auto max-w-3xl px-4">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="q1"><AccordionTrigger className="text-left text-base font-medium text-foreground hover:no-underline">1. A SMUL aprova quais tipos de projeto?</AccordionTrigger><AccordionContent><Answer><P>A Secretaria Municipal de Urbanismo e Licenciamento analisa projetos de HIS/HMP, residenciais verticais e horizontais, usos não residenciais e industriais, além de regularização e segurança da edificação.</P></Answer></AccordionContent></AccordionItem>
              <AccordionItem value="q2"><AccordionTrigger className="text-left text-base font-medium text-foreground hover:no-underline">2. Como acompanho onde está meu processo?</AccordionTrigger><AccordionContent><Answer><P>Com o número do processo em mãos, consulte o <a href={SIMPROC_URL} target="_blank" rel="noopener noreferrer" className="font-medium text-primary underline underline-offset-2 hover:no-underline">SIMPROC</a> para verificar a tramitação.</P></Answer></AccordionContent></AccordionItem>
              <AccordionItem value="q3"><AccordionTrigger className="text-left text-base font-medium text-foreground hover:no-underline">3. Posso tirar dúvidas técnicas com a Prefeitura?</AccordionTrigger><AccordionContent><Answer><P>Sim. O atendimento técnico ocorre na Sala Arthur Saboya e no Núcleo de Atendimento, conforme a competência do assunto e mediante agendamento.</P></Answer></AccordionContent></AccordionItem>
              <AccordionItem value="q4"><AccordionTrigger className="text-left text-base font-medium text-foreground hover:no-underline">4. IPTU com metragem incorreta: o que fazer?</AccordionTrigger><AccordionContent><Answer><P>Assuntos de IPTU são da Secretaria Municipal da Fazenda. Acesse <a href={FAZENDA_IPTU_URL} target="_blank" rel="noopener noreferrer" className="font-medium text-primary underline underline-offset-2 hover:no-underline">o serviço de IPTU</a>.</P></Answer></AccordionContent></AccordionItem>
              <AccordionItem value="q5"><AccordionTrigger className="text-left text-base font-medium text-foreground hover:no-underline">5. Como solicitar atendimento para dúvidas técnicas?</AccordionTrigger><AccordionContent><Answer><P>Faça o agendamento digital no endereço: <a href={SMUL_AGENDAMENTO_URL} target="_blank" rel="noopener noreferrer" className="break-all font-medium text-primary underline underline-offset-2 hover:no-underline">{SMUL_AGENDAMENTO_URL}</a>.</P></Answer></AccordionContent></AccordionItem>
            </Accordion>
          </div>
        </section>
      </main>
      <ArthurSaboyaFooter />
    </div>
  )
}
