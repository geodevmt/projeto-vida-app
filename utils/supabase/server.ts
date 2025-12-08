import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Agora a função é ASYNC
export async function createClient() {
  const cookieStore = await cookies() // Adicionado o await aqui

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // O método setAll pode ser chamado de um Server Component.
            // Ignoramos erros aqui.
          }
        },
      },
    }
  )
}