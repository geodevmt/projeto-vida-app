'use client'

import { useState } from 'react'
import { joinClassroomAction } from '@/app/(protected)/student/actions' // Importe CORRETO
import { ArrowRight, Loader2, AlertCircle, CheckCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function JoinClassForm({ userId }: { userId: string }) {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const handleJoin = async () => {
    if (code.length < 3) return
    
    setLoading(true)
    setError(null)

    try {
      // Chama a server action
      const result = await joinClassroomAction(code)

      if (result?.error) {
        setError(result.error)
        setLoading(false)
      } else {
        // SUCESSO!
        setSuccess(true)
        // Força um refresh da página para o dashboard identificar que agora tem turma
        router.refresh() 
        // Em casos teimosos, um reload completo ajuda:
        setTimeout(() => window.location.reload(), 500)
      }
    } catch (e) {
      setError("Erro de conexão. Tente novamente.")
      setLoading(false)
    }
  }

  return (
    <div className="max-w-sm mx-auto">
      <div className="flex gap-2 relative">
        <input 
          value={code}
          onChange={(e) => {
            setCode(e.target.value)
            setError(null)
          }}
          disabled={loading || success}
          placeholder="Digite o Código (Ex: X7Y2Z)"
          className="flex-1 border-2 border-gray-200 rounded-lg px-4 py-3 text-center text-lg font-mono uppercase tracking-widest focus:border-[#009B3A] outline-none transition-colors disabled:bg-gray-100 disabled:text-gray-400"
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleJoin()
          }}
        />
        <button 
          onClick={handleJoin}
          disabled={loading || success || code.length < 3}
          className={`px-6 rounded-lg font-bold transition-all flex items-center justify-center min-w-[60px]
            ${success 
              ? 'bg-green-500 text-white cursor-default' 
              : 'bg-[#009B3A] hover:bg-green-700 text-white disabled:opacity-50'
            }
          `}
        >
          {loading ? (
            <Loader2 className="animate-spin" size={20} />
          ) : success ? (
            <CheckCircle size={20} className="animate-in zoom-in" />
          ) : (
            <ArrowRight size={20} />
          )}
        </button>
      </div>
      
      {/* Exibição de Erro */}
      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-lg flex items-center gap-2 text-red-600 text-sm font-medium animate-in slide-in-from-top-1">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {/* Exibição de Sucesso */}
      {success && (
        <div className="mt-4 text-center text-green-600 text-sm font-medium animate-pulse">
          Turma encontrada! Entrando...
        </div>
      )}
    </div>
  )
}