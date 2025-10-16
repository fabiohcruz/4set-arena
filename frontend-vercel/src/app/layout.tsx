import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/context/AuthContext'
import { CourtsProvider } from '@/context/CourtsContext'
import { ClientsProvider } from '@/context/ClientsContext'
import { MenuProvider } from '@/context/MenuContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '4Set Sports - Sistema Esportivo',
  description: 'Sistema completo para gestão esportiva',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <AuthProvider>
          <MenuProvider>
            <CourtsProvider>
              <ClientsProvider>
                {children}
              </ClientsProvider>
            </CourtsProvider>
          </MenuProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
