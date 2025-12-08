'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

// Função interna para criar notificação (usada por outras actions)
export async function createNotification({ recipientId, senderId, title, message, link, type }: any) {
  const supabase = await createClient()
  
  // Insere a notificação no banco
  const { error } = await supabase.from('notifications').insert({
    recipient_id: recipientId,
    sender_id: senderId,
    title,
    message,
    link,
    type
  })

  if (error) {
    console.error("Erro ao criar notificação:", error)
  }
}

// Buscar notificações do usuário logado
export async function getNotifications() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return []

  const { data } = await supabase
    .from('notifications')
    .select('*')
    .eq('recipient_id', user.id)
    .order('created_at', { ascending: false })
    .limit(20) // Limita às últimas 20 para não pesar

  return data || []
}

// Marcar uma notificação específica como lida
export async function markAsRead(notificationId: string) {
  const supabase = await createClient()
  await supabase.from('notifications').update({ read: true }).eq('id', notificationId)
  revalidatePath('/', 'layout') // Atualiza o layout global (onde está o sininho)
}

// Marcar todas as notificações como lidas
export async function markAllAsRead() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase.from('notifications').update({ read: true }).eq('recipient_id', user.id)
  revalidatePath('/', 'layout')
}