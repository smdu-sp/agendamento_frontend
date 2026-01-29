/** @format */

"use client";

import { Button } from "@/components/ui/button";
import { DialogClose } from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import * as usuario from "@/services/usuarios";
import * as coordenadoria from "@/services/coordenadorias";
import { IPermissao, IUsuario, INovoUsuario } from "@/types/usuario";
import { ICoordenadoria } from "@/types/coordenadoria";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { useTransition, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const formSchemaUsuario = z.object({
  nome: z.string(),
  login: z.string(),
  email: z.string().email(),
  permissao: z.enum([
    "DEV",
    "TEC",
    "ADM",
    "USR",
    "PONTO_FOCAL",
    "COORDENADOR",
    "PORTARIA",
  ]),
  coordenadoriaId: z.string().optional(),
});

const formSchema = z.object({
  login: z.string(),
});

interface FormUsuarioProps {
  isUpdating: boolean;
  user?: Partial<IUsuario>;
  onClose?: () => void;
}

export default function FormUsuario({
  isUpdating,
  user,
  onClose,
}: FormUsuarioProps) {
  const [isPending, startTransition] = useTransition();
  const [isSearching, setIsSearching] = useState(false);
  const [coordenadorias, setCoordenadorias] = useState<ICoordenadoria[]>([]);
  const formUsuario = useForm<z.infer<typeof formSchemaUsuario>>({
    resolver: zodResolver(formSchemaUsuario),
    defaultValues: {
      email: user?.email || "",
      login: user?.login || "",
      nome: user?.nome || "",
      permissao:
        (user?.permissao as unknown as
          | "DEV"
          | "TEC"
          | "ADM"
          | "USR"
          | "PONTO_FOCAL"
          | "COORDENADOR"
          | "PORTARIA") ?? "USR",
      coordenadoriaId: user?.coordenadoriaId || "",
    },
  });

  const { data: session } = useSession();
  const permissaoAtual = (session?.usuario?.permissao ?? "") as string;
  const somentePermissoesCoord =
    permissaoAtual === "PONTO_FOCAL" || permissaoAtual === "COORDENADOR";

  useEffect(() => {
    async function carregarCoordenadorias() {
      if (session?.access_token) {
        const resp = await coordenadoria.listaCompleta(session.access_token);
        if (resp.ok && resp.data) {
          setCoordenadorias(resp.data as ICoordenadoria[]);
        }
      }
    }
    carregarCoordenadorias();
  }, [session]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      login: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const token = session?.access_token;

    if (!token) {
      toast.error("Não autorizado", {
        description: "Sessão inválida. Faça login novamente.",
      });
      return;
    }

    if (!values.login || values.login.trim() === "") {
      toast.error("Login inválido", { description: "Digite um login válido" });
      return;
    }

    setIsSearching(true);
    try {
      const { login } = values;
      const resp = await usuario.buscarNovo(login.trim(), token);

      if (!resp.ok || resp.error) {
        // Se for erro 401, a sessão expirou
        if (resp.status === 401) {
          toast.error("Sessão expirada", {
            description: "Por favor, faça login novamente",
          });
        } else {
          toast.error("Erro ao buscar usuário", {
            description: resp.error || "Não foi possível encontrar o usuário",
          });
        }
        return;
      }

      if (
        resp.data &&
        "login" in resp.data &&
        "nome" in resp.data &&
        "email" in resp.data
      ) {
        const usuarioEncontrado = resp.data as INovoUsuario;
        toast.success("Usuário encontrado", {
          description: usuarioEncontrado.nome,
        });
        formUsuario.setValue("nome", usuarioEncontrado.nome);
        formUsuario.setValue("email", usuarioEncontrado.email);
        formUsuario.setValue("login", usuarioEncontrado.login);
        form.reset();
      } else {
        toast.error("Dados inválidos", {
          description: "A resposta não contém os dados esperados",
        });
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Erro desconhecido";
      toast.error("Erro ao buscar usuário", { description: errorMessage });
    } finally {
      setIsSearching(false);
    }
  }

  async function onSubmitUser(values: z.infer<typeof formSchemaUsuario>) {
    startTransition(async () => {
      if (isUpdating && user?.id) {
        const resp = await usuario.atualizar(user?.id, {
          permissao: values.permissao as unknown as IPermissao,
          coordenadoriaId: values.coordenadoriaId || undefined,
        });

        if (resp.error) {
          toast.error("Algo deu errado", { description: resp.error });
        }

        if (resp.ok) {
          toast.success("Usuário atualizado", {
            description: "Os dados do usuário foram salvos com sucesso.",
          });
          onClose?.();
        }
      } else {
        const { email, login, nome, permissao, coordenadoriaId } = values;
        const resp = await usuario.criar({
          email,
          login,
          nome,
          permissao: permissao as unknown as IPermissao,
          coordenadoriaId: coordenadoriaId || undefined,
        });
        if (resp.error) {
          toast.error("Algo deu errado", { description: resp.error });
        }
        if (resp.ok) {
          toast.success("Usuário criado", {
            description: "O usuário foi cadastrado com sucesso.",
          });
          onClose?.();
        }
      }
    });
  }

  return (
    <>
      {!isUpdating && (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className=" flex items-end gap-2 w-full mb-5"
          >
            <FormField
              control={form.control}
              name="login"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Login de rede</FormLabel>
                  <FormControl>
                    <Input placeholder="Login do usuário" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              disabled={isSearching || !form.formState.isValid}
              type="submit"
            >
              {isSearching ? (
                <>
                  Buscar <Loader2 className="animate-spin" />
                </>
              ) : (
                <>
                  Buscar <ArrowRight />
                </>
              )}
            </Button>
          </form>
        </Form>
      )}

      <Form {...formUsuario}>
        <form
          onSubmit={formUsuario.handleSubmit(onSubmitUser)}
          className="space-y-4"
        >
          <FormField
            control={formUsuario.control}
            name="login"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Login de rede</FormLabel>
                <FormControl>
                  <Input disabled placeholder="Login do usuário" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={formUsuario.control}
            name="nome"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome</FormLabel>
                <FormControl>
                  <Input disabled placeholder="Nome do usuário" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={formUsuario.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>E-mail</FormLabel>
                <FormControl>
                  <Input
                    disabled
                    type="email"
                    placeholder="E-mail do usuário"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={formUsuario.control}
            name="permissao"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Permissão</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={"Defina a permissão"} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {!somentePermissoesCoord && (
                      <>
                        <SelectItem value="DEV">Desenvolvedor</SelectItem>
                        <SelectItem value="ADM">Administrador</SelectItem>
                        <SelectItem value="COORDENADOR">Coordenador</SelectItem>
                        <SelectItem value="PORTARIA">Portaria</SelectItem>
                      </>
                    )}
                    <SelectItem value="USR">Usuário</SelectItem>
                    <SelectItem value="PONTO_FOCAL">Ponto Focal</SelectItem>
                    <SelectItem value="TEC">Técnico</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          {(formUsuario.watch("permissao") === "PONTO_FOCAL" ||
            formUsuario.watch("permissao") === "TEC" ||
            formUsuario.watch("permissao") === "COORDENADOR") && (
            <FormField
              control={formUsuario.control}
              name="coordenadoriaId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Coordenadoria</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={"Selecione a coordenadoria"}
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {coordenadorias.map((coord) => (
                        <SelectItem key={coord.id} value={coord.id}>
                          {coord.sigla} {coord.nome && `- ${coord.nome}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          <div className="flex gap-2 items-center justify-end">
            <DialogClose asChild>
              <Button variant={"outline"}>Voltar</Button>
            </DialogClose>
            <Button disabled={isPending} type="submit">
              {isUpdating ? (
                <>
                  Atualizar {isPending && <Loader2 className="animate-spin" />}
                </>
              ) : (
                <>
                  Adicionar {isPending && <Loader2 className="animate-spin" />}
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
}
