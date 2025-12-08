'use client'

import { useState } from 'react'
import { signIn } from '@/app/auth/actions'
import { Mail, Lock, Loader2, AlertCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function LoginForm() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async (formData: FormData) => {
    setLoading(true)
    setError(null)
    
    // Server action
    const result = await signIn(formData)

    if (result?.error) {
      setError(result.error)
      setLoading(false)
    } else {
      // Login com sucesso, refresh para atualizar sessão e middleware redirecionar
      router.refresh()
      // Opcional: forçar navegação, mas o router.refresh() costuma ser suficiente com middleware
      // router.push('/student/dashboard') 
    }
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-3 bg-red-50 text-red-600 text-sm rounded border border-red-100 flex items-center gap-2">
            <AlertCircle size={16}/> {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
        <div className="relative">
          <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
          <input
            name="email"
            type="email"
            required
            placeholder="seu@email.com"
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
        <div className="relative">
          <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
          <input
            name="password"
            type="password"
            required
            placeholder="********"
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
      </div>
      
      <button 
        type="submit" 
        disabled={loading}
        className="w-full bg-[#009B3A] hover:bg-green-700 text-white font-bold py-3 rounded-lg shadow transition-colors active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70"
      >
        {loading ? <><Loader2 className="animate-spin" size={20} /> Entrando...</> : 'Entrar no Portal'}
      </button>
    </form>
  )
}