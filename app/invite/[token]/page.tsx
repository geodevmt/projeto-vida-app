import { createClient } from '@/utils/supabase/server'
import { AlertTriangle, User } from 'lucide-react'
import RegisterForm from './RegisterForm' 

// Usa Promise para lidar com o params de versões recentes do Next.js
export default async function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const supabase = await createClient()

  const { token } = await params

  // 1. Validar Token no Banco
  const { data: invite } = await supabase
    .from('invites')
    .select('*')
    .eq('token', token)
    .single()

  // Se não achar ou já usado ou expirado
  if (!invite || invite.used || new Date(invite.expires_at) < new Date()) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow text-center max-w-md">
          <AlertTriangle className="mx-auto text-red-500 mb-4" size={48} />
          <h1 className="text-xl font-bold text-gray-800">Convite Inválido</h1>
          <p className="text-gray-500 mt-2">Este link não existe, já foi usado ou expirou.</p>
          <a href="/" className="mt-6 inline-block bg-blue-600 text-white px-6 py-2 rounded">Voltar ao Início</a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border-t-4 border-[#009B3A]">
        
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4 text-[#009B3A]">
            <User size={32} />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Bem-vindo, Professor!</h1>
          <p className="text-gray-500 text-sm mt-1">
            Complete seu cadastro para acessar o portal.
          </p>
        </div>

        <RegisterForm invite={invite} />

      </div>
    </div>
  )
}