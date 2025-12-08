/*'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function registerTeacher(formData: FormData) {
  const supabase = await createClient()

  const token = formData.get('token') as string
  const email = formData.get('email') as string
  const fullName = formData.get('fullName') as string
  const password = formData.get('password') as string

  if (!password || password.length < 6) {
    return { error: "A senha deve ter no mínimo 6 caracteres." }
  }

  try {
    // 1. Cria o usuário e dispara o Gatilho (que agora está corrigido)
    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        email_confirm: true,
        data: {
          full_name: fullName,
          role: 'teacher',
          school_name: 'Escola não definida' 
        }
      }
    })

    if (authError) {
      console.error("ERRO [AUTH/SIGNUP]:", authError)
      return { error: `Erro ao criar usuário: ${authError.message}` }
    }
    
    // 2. Marcar o convite como USADO
    await supabase
      .from('invites')
      .update({ used: true })
      .eq('token', token)
      // O erro é apenas logado (não bloqueia o redirect)

  } catch (err) {
    console.error("ERRO CRÍTICO CAPTURADO NO SERVIDOR:", err)
    return { error: "Ocorreu um erro técnico na comunicação com o banco." }
  }

  // 3. Redirecionamento (Garantido)
  redirect('/auth/login?message=Cadastro realizado! Faça login com sua nova senha.')
}*/
'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function registerTeacher(formData: FormData) {
  const supabase = await createClient()

  const token = formData.get('token') as string
  const email = formData.get('email') as string
  const fullName = formData.get('fullName') as string
  const password = formData.get('password') as string

  if (!password || password.length < 6) {
    return { error: "A senha deve ter no mínimo 6 caracteres." }
  }

  try {
    // 1. Cria o usuário
    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // A linha "email_confirm: true" foi removida aqui para corrigir o erro de Build
        data: {
          full_name: fullName,
          role: 'teacher',
          school_name: 'Escola não definida' 
        }
      }
    })

    if (authError) {
      console.error("ERRO [AUTH/SIGNUP]:", authError)
      return { error: `Erro ao criar usuário: ${authError.message}` }
    }
    
    // 2. Marcar o convite como USADO
    await supabase
      .from('invites')
      .update({ used: true })
      .eq('token', token)

  } catch (err) {
    console.error("ERRO CRÍTICO CAPTURADO NO SERVIDOR:", err)
    return { error: "Ocorreu um erro técnico na comunicação com o banco." }
  }

  // 3. Redirecionamento
  redirect('/auth/login?message=Cadastro realizado! Faça login com sua nova senha.')
}