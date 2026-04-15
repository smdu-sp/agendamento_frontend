"use client"

import { Building2, Menu, X } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { MunicipeNavAuth } from "@/components/arthur-saboya/municipe-nav-auth"
import { Button } from "@/components/ui/button"

/** Entrada pública principal (rotas na raiz da app; basePath do Next é aplicado automaticamente). */
const PUBLIC_HOME = "/portal"

export function ArthurSaboyaHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-backdrop-filter:bg-card/80">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href={PUBLIC_HOME} className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <Building2 className="h-6 w-6 text-primary-foreground" />
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-foreground">Prefeitura Municipal</p>
            <p className="text-xs text-muted-foreground">Portal de Agendamentos</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <Link href={PUBLIC_HOME} className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">Início</Link>
          <Link href="/processos" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">Processos em Trâmite</Link>
          <Link href="/pre-projetos" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">Pré-Projetos</Link>
          <Link href="/consulta" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">Consultar Agendamento</Link>
          <Link href="/perguntas-frequentes" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">Perguntas e respostas</Link>
          <MunicipeNavAuth />
        </nav>

        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {isMenuOpen && (
        <div className="border-t border-border bg-card md:hidden">
          <nav className="container mx-auto flex flex-col gap-2 p-4">
            <Link href={PUBLIC_HOME} className="rounded-lg px-4 py-2 text-sm font-medium text-foreground hover:bg-muted" onClick={() => setIsMenuOpen(false)}>Início</Link>
            <Link href="/processos" className="rounded-lg px-4 py-2 text-sm font-medium text-foreground hover:bg-muted" onClick={() => setIsMenuOpen(false)}>Processos em Trâmite</Link>
            <Link href="/pre-projetos" className="rounded-lg px-4 py-2 text-sm font-medium text-foreground hover:bg-muted" onClick={() => setIsMenuOpen(false)}>Pré-Projetos</Link>
            <Link href="/consulta" className="rounded-lg px-4 py-2 text-sm font-medium text-foreground hover:bg-muted" onClick={() => setIsMenuOpen(false)}>Consultar Agendamento</Link>
            <Link href="/perguntas-frequentes" className="rounded-lg px-4 py-2 text-sm font-medium text-foreground hover:bg-muted" onClick={() => setIsMenuOpen(false)}>Perguntas e respostas</Link>
            <div className="rounded-lg px-4 py-2" onClick={() => setIsMenuOpen(false)}>
              <MunicipeNavAuth />
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
