import pmspLogo from "@/public/Logo_pmsp_h.png"
import { MapPin, Phone } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { openSans } from "@/lib/fonts"

const PUBLIC_HOME = "/portal"

export function ArthurSaboyaFooter() {
  return (
    <footer className="bg-[#FFFFFF] text-[#4C575F]">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Logo + descrição */}
          <div className="space-y-4">
            <Image
              src={pmspLogo.src}
              alt="Prefeitura de São Paulo"
              width={pmspLogo.width}
              height={pmspLogo.height}
              className="h-11 w-auto object-contain"
            />
            <p className="text-sm text-[#4C575F]">
              Sistema de agendamentos técnicos para atendimento ao cidadão.
            </p>
          </div>

          {/* Links rápidos */}
          <div className="space-y-4">
            <h3 className={`${openSans.className} text-[16px] font-semibold text-[#0E171E]`}>Links Rápidos</h3>
            <nav className="flex flex-col gap-2">
              <Link href={PUBLIC_HOME} className="text-sm text-[#4C575F] transition-colors hover:text-[#0E171E]">
                Início
              </Link>
              <Link href="/processos" className="text-sm text-[#4C575F] transition-colors hover:text-[#0E171E]">
                Processos em Trâmite
              </Link>
              <Link href="/pre-projetos" className="text-sm text-[#4C575F] transition-colors hover:text-[#0E171E]">
                Pré-Projetos
              </Link>
              <Link href="/consulta" className="text-sm text-[#4C575F] transition-colors hover:text-[#0E171E]">
                Consultar Agendamento
              </Link>
            </nav>
          </div>

          {/* Contato */}
          <div className="space-y-4">
            <h3 className={`${openSans.className} text-[16px] font-semibold text-[#0E171E]`}>Contato</h3>
            <div className="flex flex-col gap-3 text-sm text-[#4C575F]">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0" />
                <span>(11) 5466-1950</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0" />
                <span>(11) 5466-1930</span>
              </div>              
              <div className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                <span>
                  R. São Bento, 405 - Centro
                  <br />
                  CEP: 01011-100
                </span>
              </div>
            </div>
          </div>

          {/* Horário */}
          <div className="space-y-4">
            <h3 className={`${openSans.className} text-[16px] font-semibold text-[#0E171E]`}>Horário de Atendimento</h3>
            <div className="space-y-1 text-sm text-[#4C575F]">
              <p>Segunda e Sexta-feira</p>
              <p className="font-medium text-[#0E171E]">09h00 às 17h00</p>
              <p className="mt-3">Sábados, Domingos e Feriados</p>
              <p className="font-medium text-[#0E171E]">Fechado</p>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-[#CBDAE2] pt-8">
          <p className="text-center text-sm text-[#4C575F]">
            © {new Date().getFullYear()} Prefeitura de São Paulo. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}
