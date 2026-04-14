import { ArrowRight, LucideIcon } from "lucide-react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface ServiceCardProps {
  title: string
  description: string
  icon: LucideIcon
  href: string
  features: string[]
  variant?: "primary" | "secondary"
}

export function ArthurSaboyaServiceCard({ title, description, icon: Icon, href, features, variant = "primary" }: ServiceCardProps) {
  const isPrimary = variant === "primary"
  return (
    <Link href={href} className="group block">
      <Card className={`h-full transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${isPrimary ? "border-primary/20 hover:border-primary/40" : "border-secondary/20 hover:border-secondary/40"}`}>
        <CardHeader className="pb-4">
          <div className={`mb-4 flex h-14 w-14 items-center justify-center rounded-xl ${isPrimary ? "bg-primary" : "bg-secondary"}`}>
            <Icon className="h-7 w-7 text-primary-foreground" />
          </div>
          <CardTitle className="flex items-center gap-2 text-xl text-foreground">
            {title}
            <ArrowRight className="h-5 w-5 -translate-x-2 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
          </CardTitle>
          <CardDescription className="text-base">{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {features.map((feature, index) => (
              <li key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className={`h-1.5 w-1.5 rounded-full ${isPrimary ? "bg-primary" : "bg-secondary"}`} />
                {feature}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </Link>
  )
}
