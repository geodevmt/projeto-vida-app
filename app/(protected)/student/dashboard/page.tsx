/*import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { getStudentProject } from '../actions'
import ProjectSubmissionForm from '@/components/forms/ProjectSubmissionForm'
import JoinClassForm from '@/components/forms/JoinClassForm'
import AvatarUpload from '@/components/profile/AvatarUpload' // <--- NOVO COMPONENTE

// CRÍTICO: Força a renderização dinâmica para evitar cache de dados antigos
export const dynamic = 'force-dynamic'
export const revalidate = 0

async function getStudentProfile() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Busca o perfil COMPLETO, incluindo classroom_id e a nova avatar_url
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('id, full_name, school_name, classroom_id, avatar_url') // <--- CAMPO ADICIONADO
    .eq('id', user.id)
    .single()

  if (error || !profile) {
    console.error("Erro ao buscar perfil:", error)
    redirect('/auth/login?error=Perfil não encontrado.')
  }

  return profile
}

export default async function StudentDashboard({
  searchParams,
}: {
  searchParams: Promise<{ message?: string; error?: string }>
}) {
  const params = await searchParams
  const message = params.message ? decodeURIComponent(params.message) : null
  const error = params.error ? decodeURIComponent(params.error) : null

  // 1. BUSCA DE DADOS
  const profile = await getStudentProfile()
  const project = await getStudentProject() 

  const isLinkedToClass = !!profile.classroom_id
  const firstName = profile.full_name ? profile.full_name.split(' ')[0] : 'Estudante'

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-12">
      
      {/* HEADER ATUALIZADO COM AVATAR */ /*}
      <header className="bg-[#2C3E50] text-white py-8 px-6 border-b-4 border-[#009B3A]">
        <div className="max-w-4xl mx-auto flex items-center gap-6">
            
            {/* Foto de Perfil /* /}
            <div className="shrink-0">
                <AvatarUpload currentUrl={profile.avatar_url} userName={profile.full_name} />
            </div>

            {/* Textos /* /}
            <div>
                <h1 className="text-3xl font-bold">Olá, {firstName}</h1>
                <p className="text-blue-200 mt-1">
                    {profile.school_name || 'Escola Estadual'}
                </p>
            </div>
        </div>
      </header>

      {/* MENSAGENS DE FEEDBACK /* /}
      {(error || message) && (
        <div className="max-w-4xl mx-auto px-4 mt-6">
            <div className={`p-4 rounded-lg font-medium text-center ${error ? 'bg-red-100 text-red-800 border border-red-200' : 'bg-green-100 text-green-800 border border-green-200'}`}>
                {error || message}
            </div>
        </div>
      )}

      {/* CONTEÚDO PRINCIPAL /* /}
      <main className="max-w-4xl mx-auto px-4 mt-8">
        {!isLinkedToClass ? (
          
          // ALUNO NÃO VINCULADO
          <div className="bg-white rounded-xl shadow-lg p-8 text-center border-t-4 border-[#009B3A]">
             <h2 className="text-2xl font-bold text-[#2C3E50] mb-4">Entre na sua Turma</h2>
             <p className="text-gray-500 mb-6">Digite o código de 6 letras fornecido pelo seu professor para acessar as atividades.</p>
             <JoinClassForm userId={profile.id} />
          </div>

        ) : (
          
          // ALUNO VINCULADO (MOSTRA PROJETO)
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
             <ProjectSubmissionForm 
                initialData={project} 
                userId={profile.id} 
                classroomInfo={profile.classroom_id} 
             />
          </div>
        )}
      </main>
    </div>
  )
}*/
/*import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { getStudentProject } from '../actions'
import ProjectSubmissionForm from '@/components/forms/ProjectSubmissionForm'
import JoinClassForm from '@/components/forms/JoinClassForm'
import AvatarUpload from '@/components/profile/AvatarUpload'

// CRÍTICO: Força a renderização dinâmica para evitar cache de dados antigos
export const dynamic = 'force-dynamic'
export const revalidate = 0

async function getStudentProfile() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Busca o perfil COMPLETO
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('id, full_name, school_name, classroom_id, avatar_url')
    .eq('id', user.id)
    .single()

  if (error || !profile) {
    console.error("Erro ao buscar perfil:", error)
    redirect('/auth/login?error=Perfil não encontrado.')
  }

  return profile
}

export default async function StudentDashboard({
  searchParams,
}: {
  searchParams: Promise<{ message?: string; error?: string }>
}) {
  const params = await searchParams
  const message = params.message ? decodeURIComponent(params.message) : null
  const error = params.error ? decodeURIComponent(params.error) : null

  // 1. BUSCA DE DADOS
  const profile = await getStudentProfile()
  const project = await getStudentProject() 

  const isLinkedToClass = !!profile.classroom_id
  const firstName = profile.full_name ? profile.full_name.split(' ')[0] : 'Estudante'

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-12">
      
      {/* HEADER RESPONSIVO * /}
      <header className="bg-[#2C3E50] text-white py-8 px-4 sm:px-6 border-b-4 border-[#009B3A]">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
            
            {/* Foto de Perfil * /}
            <div className="shrink-0">
                <AvatarUpload currentUrl={profile.avatar_url} userName={profile.full_name} />
            </div>

            {/* Textos * /}
            <div className="flex-1">
                <h1 className="text-2xl sm:text-3xl font-bold">Olá, {firstName}</h1>
                <p className="text-blue-200 mt-1 text-sm sm:text-base">
                    {profile.school_name || 'Escola Estadual'}
                </p>
                
                {/* Badge Mobile indicando status * /}
                <div className="mt-2 md:hidden">
                   {isLinkedToClass ? 
                     <span className="inline-block bg-green-600 text-xs px-2 py-1 rounded font-bold">Vinculado</span> : 
                     <span className="inline-block bg-yellow-600 text-xs px-2 py-1 rounded text-black font-bold">Sem Turma</span>
                   }
                </div>
            </div>
        </div>
      </header>

      {/* MENSAGENS DE FEEDBACK * /}
      {(error || message) && (
        <div className="max-w-4xl mx-auto px-4 mt-6">
            <div className={`p-4 rounded-lg font-medium text-center ${error ? 'bg-red-100 text-red-800 border border-red-200' : 'bg-green-100 text-green-800 border border-green-200'}`}>
                {error || message}
            </div>
        </div>
      )}

      {/* CONTEÚDO PRINCIPAL * /}
      <main className="max-w-4xl mx-auto px-4 mt-8">
        {!isLinkedToClass ? (
          
          // ALUNO NÃO VINCULADO
          <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 text-center border-t-4 border-[#009B3A]">
             <h2 className="text-2xl font-bold text-[#2C3E50] mb-4">Entre na sua Turma</h2>
             <p className="text-gray-500 mb-6">Digite o código de 6 letras fornecido pelo seu professor para acessar as atividades.</p>
             <JoinClassForm userId={profile.id} />
          </div>

        ) : (
          
          // ALUNO VINCULADO (MOSTRA PROJETO)
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
             <ProjectSubmissionForm 
                initialData={project} 
                userId={profile.id} 
                classroomInfo={profile.classroom_id} 
             />
          </div>
        )}
      </main>
    </div>
  )
} *
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { getStudentProject } from '../actions'
import ProjectSubmissionForm from '@/components/forms/ProjectSubmissionForm'
import JoinClassForm from '@/components/forms/JoinClassForm'
import SocialLayout from '@/components/layout/SocialLayout' // <--- IMPORTAR NOVO LAYOUT
import { PenTool, Image as ImageIcon } from 'lucide-react'

// Renderização dinâmica
export const dynamic = 'force-dynamic'
export const revalidate = 0

async function getStudentProfile() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, full_name, school_name, classroom_id, avatar_url')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/auth/login')
  return profile
}

export default async function StudentDashboard({
  searchParams,
}: {
  searchParams: Promise<{ message?: string; error?: string }>
}) {
  const params = await searchParams
  const message = params.message ? decodeURIComponent(params.message) : null
  const error = params.error ? decodeURIComponent(params.error) : null

  const profile = await getStudentProfile()
  const project = await getStudentProject() 
  const isLinkedToClass = !!profile.classroom_id

  return (
    <SocialLayout profile={profile} role="student">
      
      {/* 1. MENSAGENS DE ERRO/SUCESSO (Estilo Notificação) * /}
      {(error || message) && (
        <div className={`p-4 rounded-xl shadow-sm border ${error ? 'bg-red-50 border-red-200 text-red-700' : 'bg-green-50 border-green-200 text-green-700'}`}>
            {error || message}
        </div>
      )}

      {/* 2. ÁREA DE "CRIAR POST" (Se não estiver vinculado) * /}
      {!isLinkedToClass && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
           <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-gray-200 shrink-0 overflow-hidden">
                 {profile.avatar_url ? <img src={profile.avatar_url} className="w-full h-full object-cover"/> : null}
              </div>
              <div className="flex-1">
                 <h2 className="text-xl font-bold text-gray-800 mb-2">Bem-vindo à sua rede de aprendizado!</h2>
                 <p className="text-gray-500 mb-6">Para começar a postar seus projetos, você precisa se conectar à sua turma.</p>
                 <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <h3 className="font-bold text-blue-900 mb-2">Digite o código da turma:</h3>
                    <JoinClassForm userId={profile.id} />
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* 3. FEED DE PROJETO (Se estiver vinculado) * /}
      {isLinkedToClass && (
        <>
          {/* Card estilo "No que você está pensando?" (Header do Form) * /}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4 flex items-center gap-4">
             <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden shrink-0">
                {profile.avatar_url ? <img src={profile.avatar_url} className="w-full h-full object-cover"/> : null}
             </div>
             <div className="flex-1 bg-gray-100 hover:bg-gray-200 transition-colors rounded-full px-4 py-2.5 text-gray-500 text-sm cursor-pointer border border-transparent hover:border-gray-300">
                Atualize seu Projeto de Vida...
             </div>
             <div className="text-gray-400 hover:text-[#009B3A] cursor-pointer"><ImageIcon size={24} /></div>
          </div>

          {/* O Formulário Principal (Agora parece um Post grande) * /}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
             <div className="p-4 border-b border-gray-100 flex items-center gap-2">
                <PenTool size={18} className="text-[#009B3A]"/>
                <span className="font-bold text-gray-700 text-sm">Edição do Projeto</span>
             </div>
             
             {/* O conteúdo do form original * /}
             <div className="p-2">
                <ProjectSubmissionForm 
                    initialData={project} 
                    userId={profile.id} 
                    classroomInfo={profile.classroom_id} 
                />
             </div>
          </div>
        </>
      )}

    </SocialLayout>
  )
}*/
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { getStudentProjects } from '../actions' // Busca projetos (plural)
import { getDeadline } from '../../teacher/actions' // <--- Importa busca de prazo
import ProjectSubmissionForm from '@/components/forms/ProjectSubmissionForm'
import JoinClassForm from '@/components/forms/JoinClassForm'
import SocialLayout from '@/components/layout/SocialLayout'
import ProjectHistory from '@/components/student/ProjectHistory'
import { PenTool, PlusCircle } from 'lucide-react'

// Força atualização constante
export const dynamic = 'force-dynamic'
export const revalidate = 0

async function getStudentProfile() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, full_name, school_name, classroom_id, avatar_url')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/auth/login')
  return profile
}

export default async function StudentDashboard({
  searchParams,
}: {
  searchParams: Promise<{ message?: string; error?: string }>
}) {
  const params = await searchParams
  const message = params.message ? decodeURIComponent(params.message) : null
  const error = params.error ? decodeURIComponent(params.error) : null

  // 1. Buscas Paralelas (Perfil + Prazo)
  const profile = await getStudentProfile()
  const deadline = await getDeadline() // <--- Busca o prazo

  // 2. Busca Projetos
  const allProjects = await getStudentProjects() 

  // 3. Separação: Ativo vs Histórico
  // Ativo = Rascunho ou Correção Solicitada
  const activeProject = allProjects.find((p: any) => p.status === 'draft' || p.status === 'changes_requested') || null
  
  // Histórico = Enviado, Aprovado ou Reprovado
  const historyProjects = allProjects.filter((p: any) => 
    p.status === 'pending' || p.status === 'approved' || p.status === 'rejected'
  )

  const isLinkedToClass = !!profile.classroom_id

  return (
    // Passamos o deadline para o layout
    <SocialLayout profile={profile} role="student" deadline={deadline}>
      
      {/* MENSAGENS DE ERRO/SUCESSO */}
      {(error || message) && (
        <div className={`p-4 rounded-xl shadow-sm border ${error ? 'bg-red-50 border-red-200 text-red-700' : 'bg-green-50 border-green-200 text-green-700'}`}>
            {error || message}
        </div>
      )}

      {/* TELA DE BOAS-VINDAS (SEM TURMA) */}
      {!isLinkedToClass && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
           <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-gray-200 shrink-0 overflow-hidden">
                 {profile.avatar_url ? <img src={profile.avatar_url} className="w-full h-full object-cover" alt="avatar"/> : null}
              </div>
              <div className="flex-1">
                 <h2 className="text-xl font-bold text-gray-800 mb-2">Bem-vindo à sua jornada!</h2>
                 <p className="text-gray-500 mb-6">Para começar, conecte-se à sua turma.</p>
                 <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <JoinClassForm userId={profile.id} />
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* FEED DE PROJETOS (COM TURMA) */}
      {isLinkedToClass && (
        <>
          {/* Cabeçalho do Feed */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4 flex items-center gap-4">
             <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden shrink-0">
                {profile.avatar_url ? <img src={profile.avatar_url} className="w-full h-full object-cover" alt="avatar"/> : null}
             </div>
             <div className="flex-1 bg-gray-100 rounded-full px-4 py-2.5 text-gray-500 text-sm border border-transparent">
                {activeProject 
                    ? "Você tem um projeto em andamento..." 
                    : "Comece um novo projeto de vida agora!"
                }
             </div>
          </div>

          {/* Área de Edição (Formulário) */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
             <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                <div className="flex items-center gap-2">
                    {activeProject ? <PenTool size={18} className="text-orange-500"/> : <PlusCircle size={18} className="text-[#009B3A]"/>}
                    <span className="font-bold text-gray-700 text-sm">
                        {activeProject ? 'Editando Projeto Atual' : 'Novo Projeto'}
                    </span>
                </div>
                {activeProject && activeProject.status === 'changes_requested' && (
                    <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded font-bold">Correção Solicitada</span>
                )}
             </div>
             
             <div className="p-2">
                <ProjectSubmissionForm 
                    initialData={activeProject} // Se null, formulário vem limpo
                    userId={profile.id} 
                    classroomInfo={profile.classroom_id} 
                />
             </div>
          </div>

          {/* Lista de Envios Anteriores */}
          {historyProjects.length > 0 && (
             <ProjectHistory projects={historyProjects} />
          )}
        </>
      )}

    </SocialLayout>
  )
}