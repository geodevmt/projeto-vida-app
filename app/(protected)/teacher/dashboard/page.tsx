/*import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { getSubmissions, getClassroomStudents } from '../actions'
import { getClassrooms } from '../classes/actions'
import TeacherContent from './TeacherContent'
import AvatarUpload from '@/components/profile/AvatarUpload' // <--- NOVO COMPONENTE

export default async function TeacherDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  // 1. BUSCA O PERFIL DO PROFESSOR (Para pegar nome e foto)
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, avatar_url') // <--- CAMPO ADICIONADO
    .eq('id', user.id)
    .single()

  // 2. BUSCAS DE DADOS DO DASHBOARD (Paralelo)
  const [classrooms, submissions] = await Promise.all([
    getClassrooms(),
    getSubmissions()
  ])

  // 3. ORGANIZA ALUNOS POR TURMA
  const studentsByClass: Record<string, any[]> = {}
  await Promise.all(classrooms.map(async (cls: any) => {
    const students = await getClassroomStudents(cls.id)
    studentsByClass[cls.id] = students
  }))

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-12">
      
      {/* HEADER ATUALIZADO COM AVATAR /* /}
      <header className="bg-[#2C3E50] text-white py-8 px-6 border-b-4 border-[#009B3A]">
        <div className="max-w-6xl mx-auto flex items-center gap-6">
          
          {/* Avatar do Professor /* /}
          <div className="shrink-0">
             <AvatarUpload currentUrl={profile?.avatar_url || null} userName={profile?.full_name || 'Prof'} />
          </div>

          <div>
             <h1 className="text-3xl font-bold">Sala dos Professores</h1>
             <p className="text-blue-200 mt-1">
                Bem-vindo(a), {profile?.full_name || 'Professor'}
             </p>
          </div>
        </div>
      </header>

      {/* CONTEÚDO PRINCIPAL /* /}
      <main className="max-w-6xl mx-auto px-6 -mt-8 relative z-20">
        <TeacherContent 
          submissions={submissions} 
          classrooms={classrooms} 
          studentsByClass={studentsByClass} 
        />
      </main>
    </div>
  )
}*
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { getSubmissions, getClassroomStudents } from '../actions'
import { getClassrooms } from '../classes/actions'
import TeacherContent from './TeacherContent'
import AvatarUpload from '@/components/profile/AvatarUpload'

export default async function TeacherDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  // 1. BUSCA O PERFIL DO PROFESSOR
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, avatar_url')
    .eq('id', user.id)
    .single()

  // 2. BUSCAS DE DADOS DO DASHBOARD
  const [classrooms, submissions] = await Promise.all([
    getClassrooms(),
    getSubmissions()
  ])

  // 3. ORGANIZA ALUNOS POR TURMA
  const studentsByClass: Record<string, any[]> = {}
  await Promise.all(classrooms.map(async (cls: any) => {
    const students = await getClassroomStudents(cls.id)
    studentsByClass[cls.id] = students
  }))

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-12">
      
      {/* HEADER RESPONSIVO DO PROFESSOR * /}
      <header className="bg-[#2C3E50] text-white py-8 px-4 sm:px-6 border-b-4 border-[#009B3A]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
          
          {/* Avatar do Professor * /}
          <div className="shrink-0">
             <AvatarUpload currentUrl={profile?.avatar_url || null} userName={profile?.full_name || 'Prof'} />
          </div>

          <div>
             <h1 className="text-2xl sm:text-3xl font-bold">Sala dos Professores</h1>
             <p className="text-blue-200 mt-1 text-sm sm:text-base">
                Bem-vindo(a), {profile?.full_name || 'Professor'}
             </p>
          </div>
        </div>
      </header>

      {/* CONTEÚDO PRINCIPAL * /}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 -mt-8 relative z-20">
        <TeacherContent 
          submissions={submissions} 
          classrooms={classrooms} 
          studentsByClass={studentsByClass} 
        />
      </main>
    </div>
  )
}*/
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { getSubmissions, getClassroomStudents, getDeadline } from '../actions' // <--- Importa getDeadline
import { getClassrooms } from '../classes/actions'
import TeacherContent from './TeacherContent'
import SocialLayout from '@/components/layout/SocialLayout'

// Força atualização constante
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function TeacherDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  // 1. Busca Perfil do Professor
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, avatar_url, school_name') 
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/')

  // 2. Buscas de Dados em Paralelo (Performance)
  const [classrooms, submissions, deadline] = await Promise.all([
    getClassrooms(),
    getSubmissions(),
    getDeadline() // <--- Busca o prazo atual
  ])

  // 3. Organiza Alunos por Turma
  const studentsByClass: Record<string, any[]> = {}
  await Promise.all(classrooms.map(async (cls: any) => {
    const students = await getClassroomStudents(cls.id)
    studentsByClass[cls.id] = students
  }))

  return (
    // Passamos o deadline para o layout (que vai renderizar o Widget)
    <SocialLayout profile={profile} role="teacher" deadline={deadline}>
      
      <TeacherContent 
        submissions={submissions} 
        classrooms={classrooms} 
        studentsByClass={studentsByClass} 
      />

    </SocialLayout>
  )
}