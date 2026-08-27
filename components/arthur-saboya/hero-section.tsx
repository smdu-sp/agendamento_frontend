
import Image from "next/image"

export function ArthurSaboyaHeroSection() {
  return (
    <div className="w-full overflow-hidden bg-[#001a70]">
      {/* Desktop */}
      <div className="relative mx-auto hidden aspect-190/50 w-full max-w-[1900px] sm:block">
        <Image
          src="/Banner1900x500.png"
          alt="Portal de Agendamento Técnico"
          fill
          className="object-cover object-center"
          sizes="100vw"
          priority
        />
      </div>
      {/* Mobile */}
      <div className="relative mx-auto block aspect-100/50 w-full sm:hidden">
        <Image
          src="/banner1000x500.png"
          alt="Portal de Agendamento Técnico"
          fill
          className="object-cover object-center"
          sizes="100vw"
          priority
        />
      </div>
    </div>
  )
}
