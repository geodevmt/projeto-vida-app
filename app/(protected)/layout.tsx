/*import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { LogOut } from 'lucide-react'

// Função para fazer logout (Server Action)
async function signOut() {
  'use server'
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/')
}

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  // Verificação extra de segurança: Garante que tem sessão válida
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Barra Superior Compartilhada (Opcional, mas útil para Logout) * /}
      <nav className="bg-white border-b border-gray-200 px-6 py-3 flex justify-end items-center">
        <form action={signOut}>
          <button 
            type="submit"
            className="flex items-center gap-2 text-sm font-medium text-red-600 hover:text-red-800 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors"
          >
            <LogOut size={16} />
            Sair do Sistema
          </button>
        </form>
      </nav>
 
      {/* Conteúdo da Página (Dashboard do Aluno ou Professor) * /}
      {children}
    </div>
  )
}*/
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

// Este layout envolve TODAS as páginas protegidas (Student, Teacher, Admin, Profile)
export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  // 1. Verificação de Segurança (Mantemos isso!)
  // Garante que ninguém acesse /student ou /teacher sem estar logado
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/')
  }

  // 2. Renderização Limpa (Removemos a barra antiga)
  // Retornamos apenas o {children}. 
  // O visual (Barra, Menu Lateral) agora é responsabilidade do 'SocialLayout' 
  // que está sendo chamado dentro de cada page.tsx.
  return (
    <>
      {children}
    </>
  )
}