"use client"

import Link from "next/link"
import { FormEvent, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AuthFormShell } from "@/components/auth/auth-form-shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/lib/auth-context"

export function RegisterForm() {
  const router = useRouter()
  const { register, loading, errorMessage, clearError, isAuthenticated } = useAuth()
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
      await register(email, password)
    } catch {
      // The form shows the mapped errorMessage from auth context.
    }
  }

  return (
    <AuthFormShell
      title="Crear cuenta clinica"
      subtitle="Registre su cuenta para comenzar a gestionar pacientes de forma segura."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="register-email" className="text-sm font-medium text-[#6f6180]">
            Correo electronico
          </label>
          <Input
            id="register-email"
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
          <label htmlFor="register-password" className="text-sm font-medium text-[#6f6180]">
            Contrasena
          </label>
          <Input
            id="register-password"
            type="password"
            placeholder="********"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            autoComplete="new-password"
            className="h-11 rounded-xl border-[#e6d8ef] bg-white text-[#4b3b5c] placeholder:text-[#aa9db7] focus-visible:border-[#cdb4db] focus-visible:ring-[#cdb4db]/40"
          />
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="h-11 w-full rounded-xl bg-[#cdb4db] text-sm font-semibold text-[#4a3a5a] shadow-[0_10px_24px_-16px_rgba(68,50,85,0.7)] hover:bg-[#bda0cf]"
        >
          {loading ? "Creando cuenta..." : "Crear cuenta"}
        </Button>

        {errorMessage && (
          <p className="rounded-xl border border-[#ffc8dd] bg-[#fff4f8] px-3 py-2 text-sm text-[#9b3f63]">
            {errorMessage}
          </p>
        )}
      </form>

      <p className="mt-5 text-center text-sm text-[#7c6f89]">
        Ya tienes cuenta?{" "}
        <Link href="/login" className="font-semibold text-[#7e66a3] hover:text-[#6f5792]">
          Inicia sesion
        </Link>
      </p>
    </AuthFormShell>
  )
}
