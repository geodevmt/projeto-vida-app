/*import { type NextRequest } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

export async function middleware(request: NextRequest) {
  // 1. Atualiza a sessão (renova cookies se necessário)
  const response = await updateSession(request)
  
  // O middleware do Supabase em 'updateSession' já garantiu a gestão do cookie.
  // Agora, verificamos se o usuário está tentando acessar áreas restritas.
  // Nota: Verificações de PERMISSÃO (Role) mais pesadas faremos dentro da página/layout
  // para não deixar o site lento, mas a verificação de LOGIN (Sessão) fazemos aqui.

  // Se quiser proteger rotas específicas no middleware, você pode checar user aqui:
  /*
  const supabase = createClient(...) // precisaria importar createClient do middleware
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user && request.nextUrl.pathname.startsWith('/student')) {
      return NextResponse.redirect(new URL('/login', request.url))
  }
  * /

  return response
}

export const config = {
  // Matcher: Onde o middleware deve rodar?
  // Excluímos arquivos estáticos (_next/static, imagens, favicon, etc) para performance.
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}*/

import { type NextRequest } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware' // Agora a importação funcionará

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Aplica o middleware em todas as rotas, EXCETO:
     * - _next/static (arquivos estáticos de build)
     * - _next/image (otimização de imagens)
     * - favicon.ico (ícone do navegador)
     * - imagens (svg, png, jpg, etc)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}