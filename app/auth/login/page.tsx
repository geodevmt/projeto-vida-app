import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import LoginForm from '@/components/forms/LoginForm'
import { LogIn, AlertTriangle, CheckCircle } from 'lucide-react'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string; error?: string }>
}) {
  
  const params = await searchParams; // CORREÇÃO: await searchParams

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role === 'admin') redirect('/admin/dashboard')
    if (profile?.role === 'teacher') redirect('/teacher/dashboard')
    if (profile?.role === 'student') redirect('/student/dashboard')
    redirect('/')
  }

  const message = params.message ? decodeURIComponent(params.message) : null;
  const error = params.error ? decodeURIComponent(params.error) : null;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-2xl max-w-md w-full border-t-4 border-[#2C3E50]">
        
        <div className="text-center mb-8">
          <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3 text-[#2C3E50]">
            <LogIn size={24} />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Acessar Portal</h1>
        </div>

        {(error || message) && (
          <div className={`mb-4 p-3 text-sm rounded-lg border flex items-center gap-2 ${error ? 'bg-red-100 text-red-700 border-red-200' : 'bg-green-100 text-green-700 border-green-200'}`}>
            {error ? <AlertTriangle size={16} /> : <CheckCircle size={16} />} {error || message}
          </div>
        )}
        
        <LoginForm />
        
        <div className="text-center mt-6 space-y-3 border-t border-gray-100 pt-5">
          <p className="text-sm">
            <a href="/auth/update-password" className="text-blue-600 hover:underline font-medium">Esqueceu a senha? Clique para recuperar</a>
          </p>
          <p className="text-sm text-gray-600">
            É aluno novo? 
            <a href="/auth/signup" className="text-[#009B3A] hover:underline font-medium ml-1">Cadastre-se aqui</a>
          </p>
        </div>
      </div>
    </div>
  )
}