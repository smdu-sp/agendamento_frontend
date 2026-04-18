"use client"

import { useEffect, useRef, useState } from "react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import type {
  AutorMensagemPreProjetoArthurSaboya,
  IMensagemPreProjetoArthurSaboya,
} from "@/types/solicitacao-pre-projeto-arthur-saboya"

/** Munícipe à esquerda; equipe Arthur Saboya (ponto focal) à direita; sistema ao centro. */
function alinhamento(autor: AutorMensagemPreProjetoArthurSaboya): "left" | "right" | "center" {
  if (autor === "MUNICIPE") return "left"
  if (autor === "PONTO_FOCAL") return "right"
  return "center"
}

export function PreProjetoChamadoChat({
  mensagens,
  onEnviar,
  enviando,
  placeholder = "Escreva uma mensagem…",
  titulo = "Andamentos",
  /** `painel` = ocupa altura disponível (tela cheia / coluna flex). */
  variante = "card",
}: {
  mensagens: IMensagemPreProjetoArthurSaboya[]
  onEnviar: (texto: string) => void | Promise<void>
  enviando?: boolean
  placeholder?: string
  titulo?: string
  variante?: "card" | "painel"
}) {
  const [texto, setTexto] = useState("")
  const fimRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fimRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [mensagens])

  const submit = async () => {
    const t = texto.trim()
    if (!t || enviando) return
    setTexto("")
    await onEnviar(t)
  }

  const painel = variante === "painel"

  return (
    <div
      className={cn(
        "flex flex-col border border-border bg-card",
        painel
          ? "min-h-0 flex-1 overflow-hidden rounded-xl shadow-sm"
          : "gap-3 rounded-lg shadow-none",
      )}
    >
      <div className="shrink-0 border-b border-border px-4 py-3">
        <h3 className="text-sm font-semibold text-foreground">{titulo}</h3>
        <p className="text-xs text-muted-foreground">
          Munícipe à esquerda; equipe da Sala Arthur Saboya à direita; avisos do sistema ao centro.
        </p>
      </div>
      <div
        className={cn(
          "space-y-3 overflow-y-auto px-3 py-2",
          painel ? "min-h-0 flex-1" : "max-h-[min(420px,50vh)]",
        )}
      >
        {mensagens.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">Nenhuma mensagem ainda.</p>
        ) : (
          mensagens.map((m) => {
            const pos = alinhamento(m.autor)
            const isCentro = pos === "center"
            return (
              <div
                key={m.id}
                className={
                  pos === "right"
                    ? "flex justify-end"
                    : pos === "left"
                      ? "flex justify-start"
                      : "flex justify-center"
                }
              >
                <div
                  className={
                    isCentro
                      ? "max-w-[95%] rounded-md border border-dashed border-muted-foreground/40 bg-muted/30 px-3 py-2 text-xs text-muted-foreground"
                      : m.autor === "MUNICIPE"
                        ? "max-w-[85%] rounded-2xl rounded-bl-md bg-[#E56E14] px-3 py-2 text-sm text-white shadow-sm"
                        : "max-w-[85%] rounded-2xl rounded-br-md bg-muted px-3 py-2 text-sm text-foreground shadow-sm"
                  }
                >
                  <div
                    className={
                      isCentro
                        ? "mb-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground"
                        : "mb-1 text-[10px] font-medium opacity-90"
                    }
                  >
                    {m.nomeRemetente ?? (m.autor === "MUNICIPE" ? "Munícipe" : "Equipe")}
                    {" · "}
                    {format(new Date(m.criadoEm), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                  </div>
                  <p className="whitespace-pre-wrap break-words">{m.corpo}</p>
                </div>
              </div>
            )
          })
        )}
        <div ref={fimRef} />
      </div>
      <div className="shrink-0 border-t border-border bg-muted/20 p-3">
        <Textarea
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder={placeholder}
          rows={3}
          className="mb-2 resize-none"
          disabled={enviando}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault()
              void submit()
            }
          }}
        />
        <Button
          type="button"
          className="w-full bg-[#E56E14] text-white hover:bg-[#CC5F10] sm:w-auto"
          disabled={enviando || !texto.trim()}
          onClick={() => void submit()}
        >
          <Send className="mr-2 h-4 w-4" />
          Enviar
        </Button>
      </div>
    </div>
  )
}
