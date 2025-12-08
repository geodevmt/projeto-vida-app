'use client'

import { useState } from 'react'
import { registerTeacher } from './actions'
import { Lock, User, Mail, ArrowRight, Loader2 } from 'lucide-react'

export default function RegisterForm({ invite }: { invite: any }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (formData: FormData) => {
    setLoading(true)
    setError(null)
    
    let result: { error?: string } = {}

    try {
      result = await registerTeacher(formData)

      if (result?.error) {
        setError(result.error)
        setLoading(false) 
      }

    } catch (e) {
      console.error("ERRO SILENCIOSO CAPTURADO:", e)
      setError("Erro de rede ou falha inesperada na submissão.")
      setLoading(false)
    }

    if (!result.error) {
      setLoading(false) // Parar o spinner se não houve redirect (porém o redirect deve funcionar)
    }
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <input type="hidden" name="token" value={invite.token} />
      <input type="hidden" name="email" value={invite.email} />

      <div>
        <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1">E-mail Vinculado</label>
        <div className="relative">
          <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
          <input 
            type="email" 
            disabled 
            value={invite.email}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed" 
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1">Nome Completo</label>
        <div className="relative">
          <User className="absolute left-3 top-3 text-gray-400" size={18} />
          <input 
            name="fullName" 
            type="text" 
            required 
            placeholder="Ex: João da Silva"
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#009B3A] outline-none" 
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1">Defina sua Senha</label>
        <div className="relative">
          <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
          <input 
            name="password" 
            type="password" 
            required 
            minLength={6} 
            placeholder="Mínimo 6 caracteres"
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#009B3A] outline-none" 
          />
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 text-red-600 text-sm rounded border border-red-100">
          {error}
        </div>
      )}

      <button 
        type="submit" 
        disabled={loading}
        className="w-full bg-[#009B3A] hover:bg-green-700 text-white font-bold py-4 rounded-lg shadow-lg transition-transform active:scale-95 mt-2 flex items-center justify-center gap-2"
      >
        {loading ? <Loader2 className="animate-spin" /> : <>Finalizar Cadastro <ArrowRight size={18}/></>}
      </button>
    </form>
  )
}