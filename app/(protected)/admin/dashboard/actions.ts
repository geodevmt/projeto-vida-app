'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

// ==========================================
// 1. BUSCAR CONVITES
// ==========================================
export async function getInvites() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return []

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') return []

  const { data } = await supabase
    .from('invites')
    .select('*')
    .order('created_at', { ascending: false })

  return data || []
}

// ==========================================
// 2. GERAR CONVITE
// ==========================================
export async function generateInvite(email: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return { error: "Não autorizado" }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') return { error: "Acesso negado." }

  const token = crypto.randomUUID()
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7)

  const { error } = await supabase
    .from('invites')
    .insert({
      email,
      token,
      expires_at: expiresAt.toISOString(),
      used: false
    })

  if (error) {
    console.error("Erro ao gerar convite:", error)
    if (error.code === '23505') { 
        return { error: "Este e-mail já possui um convite pendente." }
    }
    return { error: "Erro ao criar convite." }
  }

  revalidatePath('/admin/dashboard')
  
  // Return the full invite URL for convenience
  const inviteUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/invite/${token}`
  return { success: `Convite gerado!`, url: inviteUrl }
}

// ==========================================
// 3. DELETAR CONVITE
// ==========================================
export async function deleteInvite(inviteId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return { error: "Não autorizado" }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') return { error: "Acesso negado." }
  
  const { error } = await supabase
    .from('invites')
    .delete()
    .eq('id', inviteId)

  if (error) return { error: "Erro ao deletar." }
  
  revalidatePath('/admin/dashboard')
  return { success: "Convite removido." }
}

// ==========================================
// 4. RESETAR CONVITE
// ==========================================
export async function resetInvite(inviteId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user?.id).single()
  if (profile?.role !== 'admin') return { error: "Negado" }

  const newToken = crypto.randomUUID()
  const newExpiry = new Date()
  newExpiry.setDate(newExpiry.getDate() + 7)

  const { error } = await supabase
    .from('invites')
    .update({
      token: newToken,
      expires_at: newExpiry.toISOString(),
      used: false,
      created_at: new Date().toISOString()
    })
    .eq('id', inviteId)

  if (error) return { error: "Erro ao renovar." }

  revalidatePath('/admin/dashboard')
  
  const inviteUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/invite/${newToken}`
  return { success: "Convite renovado!", url: inviteUrl }
}

/*portal-vida-mt\app\(protected)

portal-vida-mt\app\(protected)\admin

portal-vida-mt\app\(protected)\admin\dashboard

portal-vida-mt\app\(protected)\admin\dashboard\actions.ts

portal-vida-mt\app\(protected)\admin\dashboard\InviteActions.tsx

portal-vida-mt\app\(protected)\admin\dashboard\InviteGenerator.tsx

portal-vida-mt\app\(protected)\admin\dashboard\page.tsx

portal-vida-mt\app\(protected)\notifications

portal-vida-mt\app\(protected)\notifications\actions.ts

portal-vida-mt\app\(protected)\profile

portal-vida-mt\app\(protected)\student

portal-vida-mt\app\(protected)\student\dashboard

portal-vida-mt\app\(protected)\student\dashboard\page.tsx

portal-vida-mt\app\(protected)\student\actions.ts

portal-vida-mt\app\(protected)\teacher

portal-vida-mt\app\(protected)\teacher\classes

portal-vida-mt\app\(protected)\teacher\classes\actions.ts

portal-vida-mt\app\(protected)\teacher\dashboard

portal-vida-mt\app\(protected)\teacher\dashboard\page.tsx

portal-vida-mt\app\(protected)\teacher\dashboard\TeacherActionButtons.tsx

portal-vida-mt\app\(protected)\teacher\dashboard\TeacherContent.tsx

portal-vida-mt\app\(protected)\teacher\actions.ts

portal-vida-mt\app\(protected)\layout.tsx*/