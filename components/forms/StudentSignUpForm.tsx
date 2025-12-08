'use client'

import { useState } from 'react'
import { signUpStudent } from '@/app/auth/actions'
import { User, Mail, Lock, School, Loader2, AlertTriangle } from 'lucide-react'
import { useRouter } from 'next/navigation' // Importação correta para Client Components

function SubmitButton({ loading }: { loading: boolean }) {
  return (
    <button 
      type="submit" 
      disabled={loading}
      className="w-full bg-[#009B3A] hover:bg-green-700 text-white font-bold py-3 rounded-lg shadow transition-colors active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70"
    >
      {loading ? <><Loader2 className="animate-spin" size={20} /> Processando...</> : 'Criar Conta de Aluno'}
    </button>
  )
}

export default function StudentSignUpForm() {
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleSubmit = async (formData: FormData) => {
        setLoading(true)
        setError(null)
        
        try {
            const result = await signUpStudent(formData)
            
            if (result?.error) {
                setError(result.error)
                setLoading(false)
            } else if (result?.success) {
                // Sucesso! Redireciona via Client Side
                router.push('/auth/login?message=Cadastro realizado! Verifique seu e-mail para confirmar a conta.')
            }
        } catch (e) {
            setError("Erro inesperado ao tentar cadastrar.")
            setLoading(false)
        }
    }

    return (
        <form action={handleSubmit} className="space-y-4">
            {error && (
                <div className="p-3 bg-red-100 text-red-700 text-sm rounded border border-red-200 flex items-center gap-2">
                    <AlertTriangle size={16} /> {error}
                </div>
            )}
            
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
                <div className="relative">
                    <User className="absolute left-3 top-3 text-gray-400" size={18} />
                    <input name="fullName" type="text" required placeholder="Seu nome completo" className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009B3A] outline-none" />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Escola</label>
                <div className="relative">
                    <School className="absolute left-3 top-3 text-gray-400" size={18} />
                    <input name="schoolName" type="text" required placeholder="Ex: Escola Estadual XXX" className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009B3A] outline-none" />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
                <div className="relative">
                    <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
                    <input name="email" type="email" required placeholder="seu@email.com" className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009B3A] outline-none" />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
                <div className="relative">
                    <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
                    <input name="password" type="password" required minLength={6} placeholder="Mínimo 6 caracteres" className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009B3A] outline-none" />
                </div>
            </div>
            
            <SubmitButton loading={loading} />
        </form>
    )
}