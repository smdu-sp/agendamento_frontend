import { FileText, Lightbulb, Search, HelpCircle } from "lucide-react"
import Link from "next/link"
import { ArthurSaboyaFooter } from "@/components/arthur-saboya/footer"
import { ArthurSaboyaHeader } from "@/components/arthur-saboya/header"
import { ArthurSaboyaHeroSection } from "@/components/arthur-saboya/hero-section"
import { ArthurSaboyaServiceCard } from "@/components/arthur-saboya/service-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function ArthurSaboyaHomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <ArthurSaboyaHeader />
      <main className="flex-1">
        <ArthurSaboyaHeroSection />
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">Escolha o Tipo de Agendamento</h2>
              <p className="mx-auto max-w-2xl text-muted-foreground">Selecione a opção que corresponde ao seu tipo de solicitação para dar início ao agendamento.</p>
            </div>
            <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-2">
              <ArthurSaboyaServiceCard
                title="Processos em Trâmite"
                description="Para processos que já possuem número de protocolo e estão em análise na Prefeitura."
                icon={FileText}
                href="/processos"
                variant="primary"
                features={["Processos já protocolados", "Acompanhamento de análise", "Esclarecimento de pendências", "Entrega de documentação complementar"]}
              />
              <ArthurSaboyaServiceCard
                title="Pré-Projetos"
                description="Para consultas prévias antes da formalização do processo na Prefeitura."
                icon={Lightbulb}
                href="/pre-projetos"
                variant="secondary"
                features={["Consulta de viabilidade", "Orientações técnicas iniciais", "Análise prévia de documentação", "Esclarecimento de dúvidas"]}
              />
            </div>
          </div>
        </section>
        <section className="border-y border-border bg-muted/30 py-16">
          <div className="container mx-auto px-4">
            <Card className="mx-auto max-w-2xl">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Search className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-2xl">Consultar Agendamento</CardTitle>
                <CardDescription className="text-base">Já possui um agendamento? Consulte o status ou faça alterações.</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                <Link href="/consulta">
                  <Button variant="outline" size="lg" className="gap-2">
                    <Search className="h-4 w-4" />
                    Consultar Meu Agendamento
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </section>
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-3xl font-bold text-foreground">Informações Importantes</h2>
            </div>
            <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
              <Card><CardHeader><CardTitle className="flex items-center gap-2 text-lg"><HelpCircle className="h-5 w-5 text-primary" />Documentos Necessários</CardTitle></CardHeader><CardContent className="text-sm text-muted-foreground"><p>Tenha em mãos o número do processo (se houver), documento de identidade e documentos relacionados ao seu atendimento.</p></CardContent></Card>
              <Card><CardHeader><CardTitle className="flex items-center gap-2 text-lg"><HelpCircle className="h-5 w-5 text-secondary" />Chegue com Antecedência</CardTitle></CardHeader><CardContent className="text-sm text-muted-foreground"><p>Recomendamos chegar com pelo menos 15 minutos de antecedência para garantir o atendimento no horário agendado.</p></CardContent></Card>
              <Card><CardHeader><CardTitle className="flex items-center gap-2 text-lg"><HelpCircle className="h-5 w-5 text-primary" />Cancelamento</CardTitle></CardHeader><CardContent className="text-sm text-muted-foreground"><p>Caso precise cancelar, faça-o com pelo menos 24 horas de antecedência para liberar a vaga para outros cidadãos.</p></CardContent></Card>
            </div>
          </div>
        </section>
      </main>
      <ArthurSaboyaFooter />
    </div>
  )
}
