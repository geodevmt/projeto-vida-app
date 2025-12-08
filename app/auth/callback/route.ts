import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
  // O link do email vem como: http://localhost:3000/auth/callback?code=xxxxxx&next=/student/dashboard
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  
  // Se tiver um parâmetro "next", usamos para redirecionar. Se não, vai para dashboard do aluno.
  const next = searchParams.get('next') ?? '/student/dashboard'

  if (code) {
    const supabase = await createClient()
    
    // Troca o código temporário do e-mail por uma sessão real (Cookies)
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // SUCESSO! Redireciona para o painel
      // O Next.js vai limpar a URL e deixar apenas /student/dashboard
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Se der erro (código inválido ou expirado), manda de volta para o login com erro
  return NextResponse.redirect(`${origin}/?error=auth_code_error`)
}