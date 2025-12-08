'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { X } from 'lucide-react'

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    // Verifica no localStorage se já houve consentimento
    const consent = localStorage.getItem('cookie_consent')
    if (!consent) {
      setShowBanner(true)
    }
  }, [])

  const acceptCookies = () => {
    localStorage.setItem('cookie_consent', 'true')
    setShowBanner(false)
  }

  if (!showBanner) return null

  return (
    <div className="fixed bottom-0 left-0 w-full bg-[#2C3E50] text-white p-4 z-50 shadow-lg border-t-4 border-[#FEDD00] animate-in slide-in-from-bottom-4 duration-500">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        <div className="text-sm md:text-base text-center md:text-left flex-1">
          <p>
            <strong>Este portal utiliza cookies</strong> para melhorar sua experiência e manter sua sessão segura. 
            Ao continuar navegando, você concorda com nossa{' '}
            <Link href="/privacy" className="text-[#FEDD00] hover:underline font-bold">
              Política de Privacidade e Termos de Uso
            </Link>.
          </p>
        </div>

        <div className="flex gap-3">
          <button 
            onClick={acceptCookies}
            className="bg-[#009B3A] hover:bg-green-700 text-white px-6 py-2 rounded-lg font-bold text-sm transition-colors whitespace-nowrap"
          >
            Aceitar e Continuar
          </button>
          <button 
            onClick={() => setShowBanner(false)} // Apenas fecha sem salvar (opcional)
            className="p-2 text-gray-400 hover:text-white"
            aria-label="Fechar"
          >
            <X size={20} />
          </button>
        </div>

      </div>
    </div>
  )
}