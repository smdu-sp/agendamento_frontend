import bannerImg from "@/public/banner.png"
import Image from "next/image"

export function ArthurSaboyaHeroSection() {
  return (
    <div className="w-full overflow-hidden bg-[#001a70]">
      <div className="relative mx-auto aspect-[190/50] w-full max-w-[1900px]">
        <Image
          src={bannerImg}
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
