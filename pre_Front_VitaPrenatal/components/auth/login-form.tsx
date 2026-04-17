"use client"

import Link from "next/link"
import { FormEvent, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AuthFormShell } from "@/components/auth/auth-form-shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/lib/auth-context"

export function LoginForm() {
  const router = useRouter()
  const { login, loading, errorMessage, clearError, isAuthenticated } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  useEffect(() => {
    clearError()
  }, [clearError])

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/")
    }
  }, [isAuthenticated, router])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    clearError()

    try {
      await login(email, password)
    } catch {
      // The form shows the mapped errorMessage from auth context.
    }
  }

  return (
    <AuthFormShell
      title="Acceso clinico"
      subtitle="Inicie sesion para continuar con el monitoreo prenatal de pacientes."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="login-email" className="text-sm font-medium text-[#6f6180]">
            Correo electronico
          </label>
          <Input
            id="login-email"
            type="email"
            placeholder="correo@vitaprenatal.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            autoComplete="email"
            className="h-11 rounded-xl border-[#e6d8ef] bg-white text-[#4b3b5c] placeholder:text-[#aa9db7] focus-visible:border-[#cdb4db] focus-visible:ring-[#cdb4db]/40"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="login-password" className="text-sm font-medium text-[#6f6180]">
            Contrasena
          </label>
          <Input
            id="login-password"
            type="password"
            placeholder="********"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            autoComplete="current-password"
            className="h-11 rounded-xl border-[#e6d8ef] bg-white text-[#4b3b5c] placeholder:text-[#aa9db7] focus-visible:border-[#cdb4db] focus-visible:ring-[#cdb4db]/40"
          />
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="h-11 w-full rounded-xl bg-[#cdb4db] text-sm font-semibold text-[#4a3a5a] shadow-[0_10px_24px_-16px_rgba(68,50,85,0.7)] hover:bg-[#bda0cf]"
        >
          {loading ? "Iniciando sesion..." : "Iniciar sesion"}
        </Button>

        {errorMessage && (
          <p className="rounded-xl border border-[#ffc8dd] bg-[#fff4f8] px-3 py-2 text-sm text-[#9b3f63]">
            {errorMessage}
          </p>
        )}
      </form>

      <p className="mt-5 text-center text-sm text-[#7c6f89]">
        No tienes cuenta?{" "}
        <Link href="/register" className="font-semibold text-[#7e66a3] hover:text-[#6f5792]">
          Registrate
        </Link>
      </p>
    </AuthFormShell>
  )
}
