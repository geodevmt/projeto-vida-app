import Link from 'next/link'
import { ArrowLeft, Shield, Lock, Cookie, UserCheck } from 'lucide-react'

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      
      {/* Cabeçalho Simples */}
      <header className="bg-white border-b border-gray-200 py-6 px-4">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <Link href="/" className="p-2 text-gray-500 hover:text-[#009B3A] transition-colors rounded-full hover:bg-gray-100">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-2xl font-bold text-[#2C3E50] flex items-center gap-2">
            <Shield className="text-[#009B3A]" /> Política de Privacidade
          </h1>
        </div>
      </header>

      {/* Conteúdo */}
      <main className="max-w-4xl mx-auto py-12 px-4 sm:px-6">
        <div className="bg-white p-8 sm:p-12 rounded-xl shadow-sm border border-gray-200 prose prose-blue max-w-none text-gray-600">
          
          <p className="lead text-lg text-gray-800 font-medium mb-8">
            O <strong>Portal Projeto de Vida</strong> preza pela segurança e privacidade dos dados de seus alunos e professores, 
            em estrita conformidade com a <strong>Lei Geral de Proteção de Dados (Lei nº 13.709/2018 - LGPD)</strong>.
          </p>

          <section className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
              <UserCheck size={20} className="text-blue-500"/> 1. Coleta de Dados
            </h3>
            <p>
              Coletamos apenas os dados estritamente necessários para o funcionamento pedagógico da plataforma:
            </p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Nome completo e E-mail (para identificação e login).</li>
              <li>Escola vinculada (para organização das turmas).</li>
              <li>Conteúdos acadêmicos (Projetos de Vida e Currículos produzidos pelo aluno).</li>
            </ul>
          </section>

          <section className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Lock size={20} className="text-blue-500"/> 2. Finalidade e Segurança
            </h3>
            <p>
              Seus dados nunca serão vendidos ou compartilhados com terceiros para fins comerciais. Eles são utilizados exclusivamente para:
            </p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Vincular alunos aos seus respectivos professores para avaliação.</li>
              <li>Gerar histórico escolar e acompanhar o progresso do Projeto de Vida.</li>
              <li>Manter a segurança do acesso ao sistema.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Cookie size={20} className="text-blue-500"/> 3. Uso de Cookies
            </h3>
            <p>
              Utilizamos apenas <strong>cookies essenciais</strong> de sessão. Estes pequenos arquivos servem unicamente para manter você logado de forma segura enquanto navega entre as páginas. Não utilizamos cookies de rastreamento publicitário.
            </p>
          </section>

          <div className="mt-10 p-6 bg-gray-50 rounded-lg text-center">
            <p className="text-sm text-gray-500 mb-4">Dúvidas sobre seus dados?</p>
            <Link href="/" className="inline-block bg-[#2C3E50] text-white px-6 py-3 rounded-lg font-bold hover:bg-[#1f2a35] transition-colors">
              Voltar para o Login
            </Link>
          </div>

        </div>
      </main>
    </div>
  )
}