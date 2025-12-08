'use client'

import { useState } from 'react'
import { resetPassword } from '../actions' // Agora importamos resetPassword, não updatePassword
import { Mail, ArrowLeft, CheckCircle, Loader2, KeyRound } from 'lucide-react'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null)

  const handleSubmit = async (formData: FormData) => {
    setLoading(true)
    setMessage(null)
    
    const res = await resetPassword(formData)
    
    if (res?.error) {
      setMessage({ text: res.error, type: 'error' })
    } else if (res?.success) {
      setMessage({ text: res.success, type: 'success' })
    }
    
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#F0F2F5] flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border border-gray-100">
        
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <KeyRound size={32} />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Recuperar Senha</h1>
          <p className="text-sm text-gray-500 mt-2">
            Digite seu e-mail cadastrado e enviaremos um link para você redefinir sua senha.
          </p>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-lg text-sm flex items-center gap-3 ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
            <CheckCircle size={18} />
            {message.text}
          </div>
        )}

        <form action={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
              <input
                name="email"
                type="email"
                required
                placeholder="seu@email.com"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#2C3E50] hover:bg-[#1a252f] text-white font-bold py-3 rounded-lg shadow-md transition-colors active:scale-95 disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Enviar Link de Recuperação'}
          </button>
        </form>

        <div className="text-center mt-8">
          <Link href="/" className="text-gray-500 hover:text-gray-800 text-sm font-medium flex items-center justify-center gap-2 transition-colors">
            <ArrowLeft size={16} /> Voltar para o Login
          </Link>
        </div>

      </div>
    </div>
  )
}