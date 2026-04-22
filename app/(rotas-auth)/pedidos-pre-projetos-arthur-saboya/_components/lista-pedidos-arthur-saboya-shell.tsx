/** @format */

"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { ModeToggle } from "@/components/toggle-theme";
import ListaPedidosPreProjetos from "./lista-pedidos-pre-projetos";

const LISTA_PATH = "/pedidos-pre-projetos-arthur-saboya";

export function ListaPedidosArthurSaboyaShell() {
  return (
    <div className="-mx-4 flex min-h-[calc(100dvh-4.5rem)] flex-col bg-[#F6F8FB] text-[#0F172A] antialiased [-webkit-font-smoothing:antialiased]">
      <header className="sticky top-0 z-20 border-b border-[#E5EAF2] bg-[rgba(255,255,255,0.85)] backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-[1400px] items-center justify-between gap-3 px-4 py-3.5 sm:px-7">
          <nav
            className="flex min-w-0 flex-1 flex-wrap items-center gap-2 text-[13px] text-[#64748B]"
            aria-label="Localização no sistema"
          >
            <Link href={LISTA_PATH} className="font-medium hover:text-[#0A328D]">
              Sala Arthur Saboya
            </Link>
            <ChevronRight className="h-3.5 w-3.5 shrink-0 text-[#94A3B8]" aria-hidden />
            <span className="font-semibold text-[#0F172A]">Pedidos de pré-projetos</span>
          </nav>
          <div className="shrink-0">
            <ModeToggle />
          </div>
        </div>
      </header>

      <div className="mx-auto flex min-h-0 w-full max-w-[1400px] flex-1 flex-col px-4 pb-8 pt-5 sm:px-7 sm:pb-10">
        <div className="mb-5">
          <h1 className="text-[22px] font-bold tracking-tight text-[#0F172A]">Pedidos de pré-projetos</h1>
        </div>

        <ListaPedidosPreProjetos />
      </div>
    </div>
  );
}
