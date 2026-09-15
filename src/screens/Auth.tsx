import { useState } from "react"
import type { FormEvent } from "react"
import { SystemPanel } from "@/components/system/SystemPanel"
import { trpc } from "@/lib/trpc"

export function AuthScreen() {
  const [mode, setMode] = useState<"login" | "register">("login")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")

  const utils = trpc.useUtils()
  const onSuccess = () => utils.auth.me.invalidate()
  const login = trpc.auth.login.useMutation({ onSuccess })
  const register = trpc.auth.register.useMutation({ onSuccess })

  const pending = login.isPending || register.isPending
  const errorMessage = login.error?.message ?? register.error?.message

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (mode === "login") login.mutate({ username, password })
    else register.mutate({ username, password })
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-void px-6">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <p className="font-display text-2xl font-bold tracking-[0.3em] text-ink-primary">AWAKEN</p>
          <p className="mt-1 font-mono text-[11px] tracking-[0.4em] text-system uppercase">Real Life RPG</p>
        </div>

        <SystemPanel accent="system" label="Acesso ao Sistema" className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="username" className="mb-1.5 block font-display text-[11px] font-semibold tracking-[0.2em] text-ink-tertiary uppercase">
                Usuário
              </label>
              <input
                id="username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                autoComplete="username"
                className="w-full border border-surface-border-strong bg-surface-2 px-3.5 py-2.5 text-sm text-ink-primary outline-none focus:border-system"
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="mb-1.5 block font-display text-[11px] font-semibold tracking-[0.2em] text-ink-tertiary uppercase">
                Senha
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                minLength={6}
                className="w-full border border-surface-border-strong bg-surface-2 px-3.5 py-2.5 text-sm text-ink-primary outline-none focus:border-system"
                required
              />
            </div>

            {errorMessage ? <p className="text-xs text-danger">{errorMessage}</p> : null}

            <button
              type="submit"
              disabled={pending}
              className="w-full border border-system bg-system/10 py-3 font-display text-sm font-semibold tracking-[0.2em] text-system uppercase transition-colors hover:bg-system/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {pending ? "Processando..." : mode === "login" ? "Entrar" : "Criar Conta"}
            </button>
          </form>

          <button
            type="button"
            onClick={() => setMode(mode === "login" ? "register" : "login")}
            className="mt-4 w-full text-center text-xs text-ink-tertiary underline-offset-4 hover:text-ink-secondary hover:underline"
          >
            {mode === "login" ? "Ainda não tem conta? Criar uma agora." : "Já tem uma conta? Entrar."}
          </button>
        </SystemPanel>
      </div>
    </div>
  )
}
