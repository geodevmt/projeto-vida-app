'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { customAlphabet } from 'nanoid' 

// Generates a 6-character alphanumeric code (e.g., UN21W3)
const generateCode = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', 6)

// ==========================================
// 1. ACTION: CREATE CLASSROOM (createClassroom)
// ==========================================
// Note: Renamed back to createClassroom to match your import in TeacherContent.tsx
export async function createClassroom(formData: FormData) {
  const supabase = await createClient()
  const name = formData.get('name') as string // Changed from 'className' to 'name' based on your form
  const schoolName = formData.get('schoolName') as string
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/auth/login')
  }

  if (!name || name.trim().length === 0) {
      // Using 'error' param to show message
      redirect(`/teacher/dashboard?error=${encodeURIComponent('O nome da turma não pode ser vazio.')}`)
  }

  const classCode = generateCode()

  const { data: newClass, error } = await supabase
    .from('classrooms')
    .insert({
      teacher_id: user.id,
      name: name,
      school_name: schoolName, // Adding schoolName if your table supports it
      code: classCode,
    })
    .select('code')
    .single()

  if (error) {
    console.error("Error creating class:", error)
    redirect(`/teacher/dashboard?error=${encodeURIComponent('Falha ao criar turma. Erro no banco de dados.')}`)
  }

  revalidatePath('/teacher/dashboard')
  redirect(`/teacher/dashboard?message=${encodeURIComponent(`Turma '${name}' criada! Código: ${newClass.code}`)}`)
}


// ==========================================
// 2. ACTION: GET CLASSROOMS (getClassrooms)
// ==========================================
export async function getClassrooms() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return []

  const { data } = await supabase
    .from('classrooms')
    .select('*')
    .eq('teacher_id', user.id)
    .order('created_at', { ascending: false })

  return data || []
}


// ==========================================
// 3. ACTION: DELETE CLASSROOM (deleteClassroom)
// ==========================================
export async function deleteClassroom(classroomId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: "Não autorizado." }

  const { error } = await supabase
    .from('classrooms')
    .delete()
    .eq('id', classroomId)
    .eq('teacher_id', user.id) // Security check

  if (error) {
    console.error("Delete error:", error)
    return { error: "Erro ao excluir turma." }
  }

  revalidatePath('/teacher/dashboard')
  return { success: "Turma excluída com sucesso." }
}