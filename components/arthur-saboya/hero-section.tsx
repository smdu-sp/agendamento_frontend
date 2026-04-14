import { Calendar, Clock, FileCheck } from "lucide-react"

export function ArthurSaboyaHeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNiIgc3Ryb2tlPSJyZ2JhKDAsIDAsIDAsIDAuMDMpIiBzdHJva2Utd2lkdGg9IjIiLz48L2c+PC9zdmc+')] opacity-50" />
      <div className="container relative mx-auto px-4 py-16 md:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
            <Calendar className="h-4 w-4" />
            Sistema de Agendamentos Online
          </div>
          <h1 className="mb-6 text-balance text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl">
            Portal de Agendamentos Técnicos
          </h1>
          <p className="mb-10 text-pretty text-lg text-muted-foreground md:text-xl">
            Agende seu atendimento técnico de forma rápida e prática. Escolha o tipo de serviço que melhor atende às suas necessidades.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2"><Clock className="h-5 w-5 text-primary" /><span>Atendimento Ágil</span></div>
            <div className="flex items-center gap-2"><FileCheck className="h-5 w-5 text-secondary" /><span>100% Digital</span></div>
            <div className="flex items-center gap-2"><Calendar className="h-5 w-5 text-primary" /><span>Confirmação Imediata</span></div>
          </div>
        </div>
      </div>
    </section>
  )
}
