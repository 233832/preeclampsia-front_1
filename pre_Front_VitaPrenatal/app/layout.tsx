import type { Metadata, Viewport } from 'next'
import { Inter, Source_Sans_3 } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { PatientProvider } from '@/lib/patient-context'
import './globals.css'

const inter = Inter({ 
  subsets: ["latin"],
  variable: '--font-inter'
});

const sourceSans = Source_Sans_3({ 
  subsets: ["latin"],
  variable: '--font-source-sans'
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
      <body className={`${inter.variable} ${sourceSans.variable} font-sans antialiased`}>
        <PatientProvider>
          {children}
        </PatientProvider>
        <Analytics />
      </body>
    </html>
  )
}
