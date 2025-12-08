'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateProfileAvatar(formData: FormData) {
  const supabase = await createClient()
  
  // 1. Verificar Autenticação
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Não autorizado." }

  const file = formData.get('avatar') as File
  
  if (!file) return { error: "Nenhum arquivo enviado." }
  
  // Validação simples de tamanho (ex: máx 2MB)
  if (file.size > 2 * 1024 * 1024) {
      return { error: "A imagem deve ter no máximo 2MB." }
  }

  // 2. Preparar Upload
  const fileExt = file.name.split('.').pop()
  // Usamos timestamp para evitar cache do navegador ao trocar a foto
  const fileName = `${user.id}/avatar-${Date.now()}.${fileExt}`

  // 3. Upload para o Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(fileName, file, { upsert: true })

  if (uploadError) {
    console.error("Erro upload:", uploadError)
    return { error: "Falha ao enviar imagem." }
  }

  // 4. Obter URL Pública
  const { data: { publicUrl } } = supabase.storage
    .from('avatars')
    .getPublicUrl(fileName)

  // 5. Atualizar perfil do usuário no Banco
  const { error: dbError } = await supabase
    .from('profiles')
    .update({ avatar_url: publicUrl })
    .eq('id', user.id)

  if (dbError) {
    return { error: "Erro ao salvar URL no perfil." }
  }

  // 6. Atualizar caches
  revalidatePath('/student/dashboard')
  revalidatePath('/teacher/dashboard')
  
  return { success: true, publicUrl }
}