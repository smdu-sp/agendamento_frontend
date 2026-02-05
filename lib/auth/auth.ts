/** @format */

import NextAuth from "next-auth";
import authConfig from "./auth.config";

export const { auth, handlers, signIn, signOut, unstable_update } = NextAuth({
  session: { strategy: "jwt" },
  trustHost: true, // usa o host da requisição no redirect (ex.: IP 10.10.5.1) em vez de AUTH_URL
  basePath: "/agendamento/api/auth",
  ...authConfig,
});
