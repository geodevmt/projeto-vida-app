/*import LoginForm from '@/components/forms/LoginForm'
import { CheckCircle2 } from 'lucide-react'

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col md:flex-row bg-[#F8F9FA]">
      /*
      /*{/* Lado Esquerdo - Apresentação /}
      <div className="md:w-1/2 bg-[#2C3E50] text-white p-12 flex flex-col justify-center relative overflow-hidden">
        {/* Elemento decorativo /}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#009B3A] via-[#FEDD00] to-[#009B3A]"></div>
        /
        <div className="relative z-10 max-w-lg mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Portal <span className="text-[#FEDD00]">Projeto de Vida</span>
          </h1>
          <p className="text-lg text-gray-300 mb-8 leading-relaxed">
            Uma plataforma integrada para os alunos da Rede Estadual de Mato Grosso construírem o futuro.
          </p>

          <ul className="space-y-4">
            <li className="flex items-center gap-3">
              <CheckCircle2 className="text-[#009B3A]" />
              <span>Envie seu currículo e plano de ação</span>
            </li>
            <li className="flex items-center gap-3">
              <CheckCircle2 className="text-[#009B3A]" />
              <span>Receba feedback dos professores</span>
            </li>
            <li className="flex items-center gap-3">
              <CheckCircle2 className="text-[#009B3A]" />
              <span>Acompanhe sua aprovação em tempo real</span>
            </li>
          </ul>
        </div>
      </div>

      {/ Lado Direito - Formulário /}
      <div className="md:w-1/2 flex items-center justify-center p-6 md:p-12">
        <LoginForm />
      </div>

    </main>
  )
}
*/
/*import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { CheckCircle } from 'lucide-react'
import LoginForm from '@/components/forms/LoginForm' 

// Componente auxiliar para a lista de benefícios
function BenefitItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3 text-lg mb-3">
      <CheckCircle className="text-[#009B3A] mt-1" size={24} /> 
      <span>{children}</span>
    </li>
  )
}

// Componente principal (Corrigido para exportação padrão)
export default async function Index() {
  const supabase = await createClient()

  // 1. Verificação de autenticação e redirecionamento (Se o usuário estiver logado)
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role === 'admin') redirect('/admin/dashboard')
    if (profile?.role === 'teacher') redirect('/teacher/dashboard')
    if (profile?.role === 'student') redirect('/student/dashboard')
    
    redirect('/student/dashboard') 
  }

  return (
    <div className="flex h-screen font-sans">
      
      {/* LEFT PANEL: Marketing e Informações (Dark) */
    /*}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-[#2F3C47] text-white p-16">
        
        <div>
          <h1 className="text-5xl font-extrabold mb-4 leading-tight">
            Portal <span className="text-[#FEDD00]">Projeto de Vida</span>
          </h1>
          <p className="text-lg text-gray-300 mb-10 max-w-lg">
            Uma plataforma integrada para os alunos da Rede Estadual de Mato Grosso construírem o futuro.
          </p>

          <ul className="list-none p-0">
            <BenefitItem>Envie seu currículo e plano de ação</BenefitItem>
            <BenefitItem>Receba feedback dos professores</BenefitItem>
            <BenefitItem>Acompanhe sua aprovação em tempo real</BenefitItem>
          </ul>
        </div>

        <div className="text-gray-400 text-3xl font-bold">
          N
        </div>

      </div>

      {/* RIGHT PANEL: Formulário de Login (Light) *
      /}
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-white">
        
        <div className="w-full max-w-sm">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center lg:hidden">
            Acessar Portal
          </h2>

          <LoginForm />
          
          {/* Links de Serviço (Cadastro e Recuperação) *
          /}
          <div className="text-center mt-6 space-y-3 pt-5 border-t border-gray-100">
            <p className="text-sm">
              <a href="/auth/update-password" className="text-blue-600 hover:underline font-medium">
                Esqueceu a senha?
              </a>
            </p>
            <p className="text-sm text-gray-600">
              É aluno novo? 
              <a href="/auth/signup" className="text-[#009B3A] hover:underline font-medium ml-1">
                Cadastre-se aqui
              </a>
            </p>
          </div>
        </div>

      </div>
      
    </div>
  )
}*/
/*import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { CheckCircle } from 'lucide-react'
import LoginForm from '@/components/forms/LoginForm' 

function BenefitItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3 text-lg mb-3">
      <CheckCircle className="text-[#009B3A] mt-1" size={24} /> 
      <span>{children}</span>
    </li>
  )
}

export default async function Index() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role === 'admin') redirect('/admin/dashboard')
    if (profile?.role === 'teacher') redirect('/teacher/dashboard')
    if (profile?.role === 'student') redirect('/student/dashboard')
    
    redirect('/student/dashboard') 
  }

  return (
    <div className="flex h-screen font-sans">
      
      {/* LEFT PANEL: Marketing e Informações (Dark) /* /}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-[#2F3C47] text-white p-16">
        
        <div>
          <h1 className="text-5xl font-extrabold mb-4 leading-tight">
            Portal <span className="text-[#FEDD00]">Projeto de Vida</span>
          </h1>
          <p className="text-lg text-gray-300 mb-10 max-w-lg">
            Uma plataforma integrada para os alunos da Rede Estadual de Mato Grosso construírem o futuro.
          </p>

          <ul className="list-none p-0">
            <BenefitItem>Envie seu currículo e plano de ação</BenefitItem>
            <BenefitItem>Receba feedback dos professores</BenefitItem>
            <BenefitItem>Acompanhe sua aprovação em tempo real</BenefitItem>
          </ul>
        </div>

        <div className="text-gray-400 text-3xl font-bold">N</div>

      </div>

      {/* RIGHT PANEL: Formulário de Login (Light) /* /}
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-white">
        
        <div className="w-full max-w-sm">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center lg:hidden">
            Acessar Portal
          </h2>
          <LoginForm />
          
          <div className="text-center mt-6 space-y-3 pt-5 border-t border-gray-100">
            <p className="text-sm">
              <a href="/auth/update-password" className="text-blue-600 hover:underline font-medium">Esqueceu a senha?</a>
            </p>
            <p className="text-sm text-gray-600">
              É aluno novo? 
              <a href="/auth/signup" className="text-[#009B3A] hover:underline font-medium ml-1">Cadastre-se aqui</a>
            </p>
          </div>
        </div>

      </div>
      
    </div>
  )
}*
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { CheckCircle } from 'lucide-react'
import LoginForm from '@/components/forms/LoginForm' 
import Link from 'next/link'

function BenefitItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3 text-lg mb-3">
      <CheckCircle className="text-[#009B3A] mt-1 shrink-0" size={24} /> 
      <span>{children}</span>
    </li>
  )
}

export default async function Index() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role === 'admin') redirect('/admin/dashboard')
    if (profile?.role === 'teacher') redirect('/teacher/dashboard')
    if (profile?.role === 'student') redirect('/student/dashboard')
    
    redirect('/student/dashboard') 
  }

  return (
    <div className="flex min-h-screen font-sans bg-white">
      
      {/* LEFT PANEL: Marketing e Informações (Dark) - Escondido em mobile * /}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-[#2F3C47] text-white p-16">
        
        <div className="mt-10">
          <h1 className="text-5xl font-extrabold mb-6 leading-tight">
            Portal <span className="text-[#FEDD00]">Projeto de Vida</span>
          </h1>
          <p className="text-xl text-gray-300 mb-12 max-w-lg leading-relaxed">
            Uma plataforma integrada para os alunos da Rede Estadual de Mato Grosso construírem o futuro.
          </p>

          <ul className="list-none p-0 space-y-2">
            <BenefitItem>Envie seu currículo e plano de ação</BenefitItem>
            <BenefitItem>Receba feedback dos professores</BenefitItem>
            <BenefitItem>Acompanhe sua aprovação em tempo real</BenefitItem>
          </ul>
        </div>

        <div className="text-gray-500 text-sm font-medium">
          © {new Date().getFullYear()} Secretaria de Educação - MT
        </div>

      </div>

      {/* RIGHT PANEL: Formulário de Login (Light) * /}
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 bg-white">
        
        <div className="w-full max-w-md">
          <div className="text-center lg:text-left mb-8">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">
              Acessar Portal
            </h2>
            <p className="text-gray-500">Entre com suas credenciais para continuar.</p>
          </div>

          <LoginForm />
          
          <div className="mt-8 pt-6 border-t border-gray-100 space-y-4 text-center text-sm">
            <p>
              <Link href="/auth/update-password" className="text-blue-600 hover:underline font-medium">
                Esqueceu a senha?
              </Link>
            </p>
            <p className="text-gray-600">
              É aluno novo? 
              <Link href="/auth/signup" className="text-[#009B3A] hover:underline font-bold ml-1">
                Cadastre-se aqui
              </Link>
            </p>
            
            {/* Link de Privacidade Adicionado * /}
            <div className="pt-4 mt-4">
              <Link href="/privacy" className="text-gray-400 hover:text-gray-600 text-xs hover:underline">
                Política de Privacidade e Termos de Uso
              </Link>
            </div>
          </div>
        </div>

      </div>
      
    </div>
  )
}*/
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Users, BookOpen, Trophy, ShieldCheck, Map } from 'lucide-react'
import LoginForm from '@/components/forms/LoginForm' 
import Link from 'next/link'

export default async function Index() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Redirecionamento se já estiver logado
  if (user) {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role === 'teacher') redirect('/teacher/dashboard')
    redirect('/student/dashboard') 
  }

  return (
    <div className="min-h-screen bg-[#F0F2F5] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      
      <div className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        
        {/* LADO ESQUERDO: Apresentação Institucional */}
        <div className="text-center lg:text-left space-y-8 animate-in slide-in-from-left-4 duration-700">
          <div>
            {/* LOGO / NOME DO PORTAL */}
            <h1 className="text-4xl md:text-6xl font-black text-[#2C3E50] tracking-tight mb-4">
              Portal <span className="text-[#009B3A]">Projeto de Vida</span>
            </h1>
            
            {/* SLOGAN INSPIRACIONAL */}
            <h2 className="text-2xl md:text-3xl font-medium text-gray-700 leading-tight">
              Planeje, construa e conquiste <br/>
              <span className="font-bold text-[#009B3A]">o seu futuro</span>.
            </h2>
          </div>

          <p className="text-lg text-gray-600 max-w-lg mx-auto lg:mx-0 leading-relaxed">
            Uma plataforma integrada para conectar você aos seus professores, organizar suas metas e documentar sua jornada escolar rumo ao sucesso profissional e pessoal.
          </p>

          {/* Cards de Pilares */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
            <FeatureCard icon={Users} title="Conexão" desc="Interação Professor-Aluno" />
            <FeatureCard icon={Map} title="Jornada" desc="Planejamento de Carreira" />
            <FeatureCard icon={Trophy} title="Conquistas" desc="Registro de Atividades" />
          </div>
        </div>

        {/* LADO DIREITO: Card de Login */}
        <div className="w-full max-w-md mx-auto lg:mx-0 animate-in slide-in-from-right-4 duration-700">
          <div className="bg-white py-8 px-6 shadow-xl rounded-2xl border border-gray-100 relative overflow-hidden">
            
            {/* Detalhe decorativo no topo (Cores do MT) */}
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#009B3A] via-[#FEDD00] to-[#2C3E50]"></div>

            <div className="mb-6 text-center">
              <h3 className="text-xl font-bold text-gray-800">Área do Usuário</h3>
              <p className="text-sm text-gray-500">Acesse para continuar sua jornada</p>
            </div>

            <LoginForm />

            <div className="mt-8 pt-6 border-t border-gray-100 space-y-4 text-center">
              <p className="text-sm">
                <Link href="/auth/update-password" className="text-blue-600 hover:text-blue-800 font-medium transition-colors">
                  Esqueceu a senha?
                </Link>
              </p>
              
              <div className="flex items-center justify-center gap-2">
                <div className="h-px bg-gray-200 flex-1"></div>
                <span className="text-xs text-gray-400 font-medium uppercase">Primeiro Acesso?</span>
                <div className="h-px bg-gray-200 flex-1"></div>
              </div>

              <Link 
                href="/auth/signup" 
                className="block w-full bg-[#2C3E50] hover:bg-[#1a252f] text-white font-bold py-3 rounded-lg transition-colors shadow-md active:scale-95"
              >
                Cadastrar-se Agora
              </Link>
            </div>
          </div>

          <div className="mt-6 text-center">
             <Link href="/privacy" className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 hover:underline">
               <ShieldCheck size={12} /> Política de Privacidade e Dados
             </Link>
          </div>
        </div>

      </div>
    </div>
  )
}

// Componente visual pequeno para features
function FeatureCard({ icon: Icon, title, desc }: any) {
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center text-center hover:-translate-y-1 transition-transform group">
      <div className="p-2 bg-gray-50 text-[#009B3A] rounded-full mb-2 group-hover:bg-[#009B3A] group-hover:text-white transition-colors">
        <Icon size={20} />
      </div>
      <h4 className="font-bold text-gray-800 text-sm">{title}</h4>
      <p className="text-xs text-gray-500">{desc}</p>
    </div>
  )
}