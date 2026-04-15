import { FileText, Lightbulb, Search } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import iconDocumentos from "@/public/icons/Group 8657.png"
import iconDespertador from "@/public/icons/despertador.png"
import iconFaq from "@/public/icons/FAQ.png"
import iconCancelamento from "@/public/icons/cancelamento.png"
import { ArthurSaboyaFooter } from "@/components/arthur-saboya/footer"
import { ArthurSaboyaHeader } from "@/components/arthur-saboya/header"
import { ArthurSaboyaHeroSection } from "@/components/arthur-saboya/hero-section"
import { ArthurSaboyaServiceCard } from "@/components/arthur-saboya/service-card"

const infoCards = [
  {
    iconSrc: iconDocumentos,
    title: "Documentos Necessários",
    description:
      "Tenha em mãos o número do processo (se houver), documento de identidade e documentos relacionados ao seu atendimento.",
    iconBg: "#5CC9BD",
  },
  {
    iconSrc: iconDespertador,
    title: "Chegar com Antecedência",
    description:
      "Recomendamos chegar com pelo menos 15 minutos de antecedência para garantir o atendimento no horário agendado.",
    iconBg: "#5CC9BD",
  },
  {
    iconSrc: iconFaq,
    title: "Perguntas Frequentes",
    description: "Aqui você encontra resposta para as dúvidas mais comuns.",
    iconBg: "#5CC9BD",
  },
  {
    iconSrc: iconCancelamento,
    title: "Cancelamento",
    description:
      "Caso precise cancelar, faça-o com pelo menos 24 horas de antecedência para liberar a vaga para outros cidadãos.",
    iconBg: "#5CC9BD",
  },
]

export default function PortalHomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <ArthurSaboyaHeader />

      <main className="flex-1">
        <ArthurSaboyaHeroSection />

        {/* ── Escolha o Tipo de Agendamento ── */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="mb-12 text-center">
              <h2 className="mb-2 text-3xl font-bold text-gray-800 md:text-4xl">
                Escolha o Tipo de Agendamento
              </h2>
              <p className="text-gray-500">Selecione entre as opções abaixo:</p>
            </div>
            <div className="mx-auto grid max-w-[1024px] gap-8 md:grid-cols-2">
              <ArthurSaboyaServiceCard
                title="Processos em Trâmite"
                description="Para processos que já possuem número de protocolo e estão em análise na Prefeitura."
                icon={FileText}
                href="/processos"
                variant="orange"
                features={[
                  "Processos já protocolados",
                  "Acompanhamento de análise",
                  "Esclarecimento de pendências",
                  "Entrega de documentação complementar",
                ]}
              />
              <ArthurSaboyaServiceCard
                title="Pré-Projetos"
                description="Para consultas prévias antes da formalização do processo na Prefeitura."
                icon={Lightbulb}
                href="/pre-projetos"
                variant="teal"
                features={[
                  "Orientação de viabilidade",
                  "Orientações técnicas iniciais",
                  "Análise prévia de documentação",
                  "Esclarecimento de dúvidas",
                ]}
              />
            </div>
          </div>
        </section>

        {/* ── Consultar Agendamento ── */}
        <section style={{ backgroundColor: "#D1EBE8" }} className="py-16">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-2xl rounded-xl bg-white p-8 shadow-md text-center">
              <div
                className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full"
                style={{ backgroundColor: "#D1EBE8" }}
              >
                <Search className="h-6 w-6" style={{ color: "#5CC9BD" }} />
              </div>
              <h2
                className="mb-2 text-[24px] font-extrabold text-[#0E171E]"
                style={{ fontFamily: '"Open Sans", sans-serif' }}
              >
                Consultar Agendamento
              </h2>
              <p
                className="mb-6 text-[16px] font-normal text-[#4C575F]"
                style={{ fontFamily: '"Open Sans", sans-serif' }}
              >
                Já possui um agendamento? Consulte o status ou faça alterações.
              </p>
              <Link
                href="/consulta"
                className="inline-flex h-10 w-[249px] items-center justify-center gap-2 rounded-[10px] bg-[#F5F9FB] px-4 text-[14px] font-normal text-[#0E171E] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] transition-colors hover:bg-[#EAF4F7]"
                style={{ fontFamily: '"Open Sans", sans-serif' }}
              >
                <Search className="h-4 w-4" />
                Consultar Meu Agendamento
              </Link>
            </div>
          </div>
        </section>

        {/* ── Informações Importantes ── */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold text-gray-800">Informações Importantes</h2>
            </div>
            <div className="mx-auto grid max-w-[1444px] gap-6 sm:grid-cols-2 xl:grid-cols-4">
              {infoCards.map((card) => (
                <div
                  key={card.title}
                  className="box-border min-h-[176px] w-full max-w-[343px] rounded-2xl border border-[#CBDAE2] bg-white px-5 pt-5 pb-2 shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]"
                >
                  <div className="mb-3 flex items-start gap-3">
                    <div
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg"
                      style={{ backgroundColor: card.iconBg }}
                    >
                      <Image
                        src={card.iconSrc}
                        alt={card.title}
                        width={20}
                        height={20}
                        className="h-5 w-5 object-contain"
                      />
                    </div>
                    <h3
                      className="text-[18px] font-extrabold leading-tight text-[#0E171E]"
                      style={{ fontFamily: '"Open Sans", sans-serif' }}
                    >
                      {card.title}
                    </h3>
                  </div>
                  <p
                    className="text-[14px] font-normal leading-5 text-[#4C575F]"
                    style={{ fontFamily: '"Open Sans", sans-serif' }}
                  >
                    {card.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <ArthurSaboyaFooter />
    </div>
  )
}
