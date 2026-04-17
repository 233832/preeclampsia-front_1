"use client"

import type { ReactNode } from "react"
import Image from "next/image"

interface AuthFormShellProps {
  title: string
  subtitle: string
  children: ReactNode
}

export function AuthFormShell({ title, subtitle, children }: AuthFormShellProps) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[linear-gradient(155deg,#ffc8dd_0%,#e9d6f2_45%,#cdb4db_100%)] px-4 py-10">
      <div className="pointer-events-none absolute left-[-140px] top-[-120px] h-72 w-72 rounded-full bg-[#bde0fe]/80 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-140px] right-[-100px] h-80 w-80 rounded-full bg-[#ffc8dd]/70 blur-3xl" />

      <section className="relative w-full max-w-[390px] rounded-2xl border border-[#ecdff5] bg-white/95 p-8 shadow-[0_14px_40px_-20px_rgba(74,54,90,0.35)] backdrop-blur-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <Image
            src="/Gemini_Generated_Image_.png"
            alt="Logo VitaPrenatal"
            width={104}
            height={104}
            priority
            className="mb-5 h-[104px] w-[104px] rounded-2xl object-cover shadow-[0_10px_24px_-16px_rgba(71,52,92,0.55)]"
          />
          <h1 className="text-2xl font-semibold tracking-tight text-[#4f3f60]">{title}</h1>
          <p className="mt-2 text-sm leading-relaxed text-[#7c6f89]">{subtitle}</p>
        </div>

        {children}
      </section>
    </div>
  )
}
