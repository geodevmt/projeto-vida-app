/*import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { generateInvite } from './actions' // Importa a ação de gerar convite
import InviteActions from './InviteActions' // Importa o componente de botões (Resetar/Deletar)
import { Mail, Plus, CheckCircle, Clock } from 'lucide-react'

export default async function AdminDashboard() {
  const supabase = await createClient()
  
  // 1. Verifica se o usuário está logado
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  // 2. Verifica se a role é 'admin'
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    // Se não for admin, redireciona para um painel menos privilegiado
    redirect('/student/dashboard')
  }

  // 3. Busca os convites gerados para popular a tabela
  const { data: invites } = await supabase
    .from('invites')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-12">
      <header className="bg-[#2C3E50] text-white py-10 px-6 border-b-4 border-[#FEDD00]">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold">Painel do Administrador</h1>
          <p className="text-yellow-400 mt-2">Gerencie os acessos dos professores.</p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 -mt-8 space-y-8">
        
        {/* BLOCO 1: GERAR NOVO CONVITE * /}
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-[#009B3A]">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Plus className="text-[#009B3A]" /> Novo Professor
          </h2>
          
          <form action={generateInvite} className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 w-full">
              <label className="block text-sm font-bold text-gray-700 mb-1">E-mail do Professor</label>
              <input 
                name="email" 
                type="email" 
                required 
                placeholder="professor@escola.com" 
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009B3A] outline-none" 
              />
            </div>
            <button 
              type="submit" 
              className="bg-[#2C3E50] hover:bg-blue-900 text-white font-bold py-3 px-6 rounded-lg shadow transition-colors flex items-center gap-2"
            >
              <Mail size={18} /> Enviar Convite
            </button>
          </form>
        </div>

        {/* BLOCO 2: LISTA DE CONVITES * /}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-800">Histórico de Convites</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold">
                <tr>
                  <th className="px-6 py-4">E-mail</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Enviado em</th>
                  <th className="px-6 py-4 text-right">Link de Acesso</th>
                  <th className="px-6 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {!invites || invites.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-400 italic">
                      Nenhum convite gerado ainda.
                    </td>
                  </tr>
                ) : (
                  invites.map((invite) => (
                    <tr key={invite.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-700">
                        {invite.email}
                      </td>
                      <td className="px-6 py-4">
                        {invite.used ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200">
                            <CheckCircle size={12} /> Cadastrado
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700 border border-yellow-200">
                            <Clock size={12} /> Pendente
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(invite.created_at).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {!invite.used ? (
                          <div className="flex flex-col items-end gap-1">
                            <code className="text-[10px] bg-gray-100 p-1 rounded text-gray-500 select-all">
                              {process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/invite/{invite.token}
                            </code>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">Acesso liberado</span>
                        )}
                      </td>
                      
                      {/* COLUNA DE AÇÕES * /}
                      <td className="px-6 py-4 text-right">
                         {!invite.used && (
                           <InviteActions inviteId={invite.id} email={invite.email} />
                         )}
                      </td>

                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </div>
  )
} */
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import SocialLayout from '@/components/layout/SocialLayout'
import AdminInvitesContent from './AdminInvitesContent'
import { getInvites } from './actions'

// Force dynamic rendering to ensure fresh data
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function AdminDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/')

  // Verify Admin Role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name, avatar_url') // Select necessary fields for SocialLayout
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    redirect('/')
  }

  // Fetch invites
  const invites = await getInvites()

  return (
    <SocialLayout profile={profile} role="admin">
      <AdminInvitesContent invites={invites} />
    </SocialLayout>
  )
}