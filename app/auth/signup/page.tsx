import { User, Mail, Lock, ArrowLeft } from 'lucide-react'
import { signUpStudent } from '../actions' // Importa a nova ação de cadastro
import StudentSignUpForm from '@/components/forms/StudentSignUpForm'

// Página Simples para Cadastro Inicial do Aluno
export default function StudentSignupPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-2xl max-w-md w-full border-t-4 border-[#009B3A]">
        
        <div className="text-center mb-8">
          <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3 text-[#009B3A]">
            <User size={24} />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Cadastro de Novo Aluno</h1>
          <p className="text-sm text-gray-500 mt-1">
            Preencha seus dados para criar sua conta.
          </p>
        </div>

        {/* Componente de formulário de cadastro (que vamos criar a seguir) */}
        <StudentSignUpForm />
        
        <p className="text-center text-sm mt-6">
          <a href="/auth/login" className="text-blue-600 hover:underline flex items-center justify-center gap-1">
            <ArrowLeft size={14} /> Voltar para o Login
          </a>
        </p>
      </div>
    </div>
  )
}