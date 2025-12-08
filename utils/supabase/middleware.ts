/*import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // IMPORTANTE: Isso atualiza o cookie se necessário
  await supabase.auth.getUser()

  return response
}*/
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  // 1. Cria uma resposta inicial que permite modificar cookies
  let supabaseResponse = NextResponse.next({
    request,
  })

  // 2. Cria o cliente Supabase para o Middleware
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // 3. Verifica o usuário atual
  // IMPORTANTE: getUser é mais seguro que getSession para middleware
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // 4. LÓGICA DE PROTEÇÃO DE ROTAS
  // Se o usuário NÃO está logado...
  if (!user) {
    // ... E a rota NÃO é a página inicial (Login)
    if (request.nextUrl.pathname !== '/' && 
        // ... E a rota NÃO começa com /auth (funcionalidades de senha/login)
        !request.nextUrl.pathname.startsWith('/auth') &&
        // ... E a rota NÃO começa com /privacy (Página pública de LGPD) <--- LIBERAÇÃO AQUI
        !request.nextUrl.pathname.startsWith('/privacy')
       ) {
      
      // ENTÃO: Redireciona para o Login
      const url = request.nextUrl.clone()
      url.pathname = '/'
      return NextResponse.redirect(url)
    }
  }

  // 5. Retorna a resposta com os cookies atualizados
  return supabaseResponse
}