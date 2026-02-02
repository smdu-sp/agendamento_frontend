import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";

export default async function RotasLivres({children}:{children: React.ReactNode}) {
  const session = await auth();
  if (session) redirect(`${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}/`);
  return <>{children}</>;
}
