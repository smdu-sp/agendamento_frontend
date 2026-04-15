import bannerImg from "@/public/banner.png"
import Image from "next/image"

export function ArthurSaboyaHeroSection() {
  return (
    <div className="w-full overflow-x-auto">
      <div className="mx-auto h-[500px] w-[1900px] min-w-[1900px]">
        <Image
          src={bannerImg}
          alt="Portal de Agendamento Técnico"
          width={1900}
          height={500}
          className="h-[500px] w-[1900px] object-cover object-center"
          priority
        />
      </div>
    </div>
  )
}
