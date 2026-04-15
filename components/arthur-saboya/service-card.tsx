import { LucideIcon } from "lucide-react"
import Link from "next/link"
import { openSans } from "@/lib/fonts"

interface ServiceCardProps {
  title: string
  description: string
  icon: LucideIcon
  href: string
  features: string[]
  variant?: "orange" | "teal"
}

const variantStyles = {
  orange: {
    iconBg: "#E56E14",
    dot: "bg-[#0F3D8F]",
  },
  teal: {
    iconBg: "#E56E14",
    dot: "bg-[#0F3D8F]",
  },
}

export function ArthurSaboyaServiceCard({
  title,
  description,
  icon: Icon,
  href,
  features,
  variant = "orange",
}: ServiceCardProps) {
  const styles = variantStyles[variant]

  return (
    <Link href={href} className="group block w-full md:w-[496px]">
      <div
        className="box-border h-[277px] w-full rounded-2xl border border-[rgba(0,91,144,0.2)] bg-white p-8 shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] transition-all duration-200 md:w-[496px]"
      >
        <div className="flex items-start gap-6">
          <div
            className="flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-2xl"
            style={{ backgroundColor: styles.iconBg }}
          >
            <Icon className="h-8 w-8 text-white" />
          </div>

          <div className="min-w-0 flex-1">
            <h3
              className={`${openSans.className} mb-2 text-[24px]/[1.2] font-bold text-[#0E171E]`}
            >
              {title}
            </h3>
            <p
              className={`${openSans.className} mb-5 text-[16px]/[1.35] text-[#4C575F]`}
            >
              {description}
            </p>

            <ul className="flex flex-col items-start gap-2 bg-white p-0 md:h-[104px] md:w-[293px]">
              {features.map((feature, index) => (
                <li
                  key={index}
                  className={`${openSans.className} flex items-start gap-3 text-[14px] leading-[1.35] text-[#4C575F]`}
                >
                  <div className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${styles.dot}`} />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </Link>
  )
}
