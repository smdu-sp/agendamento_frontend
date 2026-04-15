import { Building2, Mail, MapPin, Phone } from "lucide-react"
import Link from "next/link"
import { MunicipeNavAuth } from "@/components/arthur-saboya/municipe-nav-auth"

const PUBLIC_HOME = "/portal"

export function ArthurSaboyaFooter() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <Building2 className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Prefeitura Municipal</p>
                <p className="text-xs text-muted-foreground">Portal de Agendamentos</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">Sistema de agendamentos técnicos para atendimento ao cidadão.</p>
          </div>
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Links Rápidos</h3>
            <nav className="flex flex-col gap-2">
              <Link href={PUBLIC_HOME} className="text-sm text-muted-foreground hover:text-foreground transition-colors">Início</Link>
              <Link href="/processos" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Processos em Trâmite</Link>
              <Link href="/pre-projetos" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pré-Projetos</Link>
              <Link href="/consulta" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Consultar Agendamento</Link>
              <Link href="/perguntas-frequentes" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Perguntas e respostas</Link>
              <MunicipeNavAuth variant="footer" />
            </nav>
          </div>
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Contato</h3>
            <div className="flex flex-col gap-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-2"><Phone className="h-4 w-4" /><span>(00) 0000-0000</span></div>
              <div className="flex items-center gap-2"><Mail className="h-4 w-4" /><span>atendimento@prefeitura.gov.br</span></div>
              <div className="flex items-start gap-2"><MapPin className="mt-0.5 h-4 w-4" /><span>Praça Central, 100 - Centro<br />CEP: 00000-000</span></div>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Horário de Atendimento</h3>
            <div className="space-y-1 text-sm text-muted-foreground">
              <p>Segunda a Sexta</p><p className="font-medium text-foreground">08:00 às 17:00</p>
              <p className="mt-3">Sábados, Domingos e Feriados</p><p className="font-medium text-foreground">Fechado</p>
            </div>
          </div>
        </div>
        <div className="mt-12 border-t border-border pt-8">
          <p className="text-center text-sm text-muted-foreground">© {new Date().getFullYear()} Prefeitura Municipal. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
