import './globals.css' // O arquivo globals.css deve estar na pasta app/
import { Inter } from 'next/font/google'
import CookieConsent from '@/components/ui/CookieConsent'
import Footer from '@/components/ui/Footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Portal Projeto de Vida',
  description: 'Plataforma educacional do Mato Grosso',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.className} flex flex-col min-h-screen bg-gray-50`}>
        
        {/* Conteúdo Principal (Cresce para ocupar espaço) */}
        <div className="flex-1 flex flex-col">
          {children}
        </div>

        {/* Rodapé Fixo no final */}
        <Footer />
        
        {/* Componentes Flutuantes */}
        <CookieConsent />
        
      </body>
    </html>
  )
}
