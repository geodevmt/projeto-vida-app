import { Mail } from 'lucide-react'
import Link from 'next/link'

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border-t-4 border-[#009B3A]">
        
        <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6 text-[#009B3A]">
          <Mail size={40} />
        </div>
        
        <h1 className="text-2xl font-bold text-[#2C3E50] mb-2">Confirme seu E-mail</h1>
        
        <p className="text-gray-600 mb-6 leading-relaxed">
          Enviamos um link de confirmação para o seu endereço de e-mail. <br/>
          Por favor, verifique sua caixa de entrada (e o spam) para ativar sua conta.
        </p>

        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <p className="text-sm text-blue-800 font-medium">
            Após confirmar, você será redirecionado automaticamente para o painel.
          </p>
        </div>

        <Link 
          href="/" 
          className="text-gray-400 text-sm hover:text-[#2C3E50] hover:underline"
        >
          Voltar para a página inicial
        </Link>
      </div>
    </div>
  )
}