import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { AppShellProvider } from '@/components/providers/app-shell-provider'
import './globals.css'

const inter = Inter({ 
  subsets: ["latin"],
  variable: '--font-inter'
});

export const metadata: Metadata = {
  title: 'VitaPrenatal - Sistema de prediccion temprana de riesgo de preeclampsia',
  description: 'Sistema de prediccion temprana de riesgo de preeclampsia basado en Machine Learning para apoyo clinico en salud materna',
}

export const viewport: Viewport = {
  themeColor: '#d8b4d8',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className={`${inter.variable} font-sans antialiased`}>
        <AppShellProvider>{children}</AppShellProvider>
        <Analytics />
      </body>
    </html>
  )
}
