/** @format */

import NextAuth from "next-auth";
import authConfig from "./auth.config";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "/agendamento";

export const { auth, handlers, signIn, signOut, unstable_update } = NextAuth({
  basePath: `${basePath}/api/auth`,
  session: { strategy: "jwt" },
  trustHost: true, // usa o host da requisição no redirect (ex.: IP 10.10.5.1) em vez de AUTH_URL
  ...authConfig,
});
