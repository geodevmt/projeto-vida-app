'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

// --- LOGIN ---
export async function signIn(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return { error: 'Credenciais inválidas.' }
  }
  
  return { success: true }
}

// --- CADASTRO ---
/*export async function signUpStudent(formData: FormData) {
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const fullName = formData.get('fullName') as string
    const schoolName = formData.get('schoolName') as string
    const supabase = await createClient()

    if (!email || !password || !fullName || !schoolName) {
        return { error: 'Preencha todos os campos obrigatórios.' }
    }

    const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            email_confirm: true,
            data: { full_name: fullName, role: 'student', school_name: schoolName },
        },
    })

    if (error) {
        if (error.message.includes('already registered')) {
             return { error: 'Este e-mail já está em uso.' }
        }
        return { error: `Erro: ${error.message}` }
    }

    return { success: true }
}*/
// --- CADASTRO ---
export async function signUpStudent(formData: FormData) {
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const fullName = formData.get('fullName') as string
    const schoolName = formData.get('schoolName') as string
    const supabase = await createClient()

    if (!email || !password || !fullName || !schoolName) {
        return { error: 'Preencha todos os campos obrigatórios.' }
    }

    const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            // email_confirm: true, <--- ESSA LINHA FOI REMOVIDA
            data: { full_name: fullName, role: 'student', school_name: schoolName },
        },
    })

    if (error) {
        if (error.message.includes('already registered')) {
             return { error: 'Este e-mail já está em uso.' }
        }
        return { error: `Erro: ${error.message}` }
    }

    return { success: true }
}

// --- RECUPERAÇÃO DE SENHA (NOVO) ---

// 1. Enviar E-mail de Reset (Para a página "Esqueceu a senha")
export async function resetPassword(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email') as string

  // O link no email vai mandar o usuário de volta, logado, para mudar a senha
  // Ajuste a URL se quiser uma página específica, ex: /auth/change-password
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/auth/callback?next=/student/dashboard`, 
  })

  if (error) {
    console.error(error)
    return { error: "Não foi possível enviar o e-mail. Tente novamente." }
  }

  return { success: "Link de recuperação enviado! Verifique seu e-mail." }
}

// 2. Atualizar Senha (Para quando o usuário já está logado)
// Esta função resolve o erro de exportação que você estava vendo
export async function updatePassword(formData: FormData) {
  const supabase = await createClient()
  const password = formData.get('password') as string

  const { error } = await supabase.auth.updateUser({ password })

  if (error) {
    return { error: "Erro ao atualizar senha." }
  }

  revalidatePath('/')
  return { success: "Senha atualizada com sucesso!" }
}