/*'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { createNotification } from '../notifications/actions'

// ==========================================
// 1. AÇÃO: ENTRAR NA TURMA (joinClassroomAction)
// ==========================================
export async function joinClassroomAction(code: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: "Usuário não autenticado." }
  if (!code || code.length < 3) return { error: "Código inválido." }

  const { data: classroom } = await supabase
    .from('classrooms')
    .select('id, school_name, teacher_id')
    .eq('code', code.toUpperCase().trim())
    .single()

  if (!classroom) {
    return { error: "Código não encontrado. Verifique com seu professor." }
  }

  const { error: updateError } = await supabase
    .from('profiles')
    .update({ 
      classroom_id: classroom.id,
      school_name: classroom.school_name 
    })
    .eq('id', user.id)

  if (updateError) return { error: "Erro ao salvar vínculo. Tente novamente." }

  revalidatePath('/student/dashboard')
  return { success: true }
}

// ==========================================
// 2. AÇÃO: BUSCAR PROJETO (getStudentProject)
// ==========================================
export async function getStudentProject() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data: project } = await supabase
    .from('student_projects')
    .select('*')
    .eq('user_id', user.id)
    .single()

  return project
}

// ==========================================
// 3. AÇÃO: SALVAR PROJETO (saveProject)
// ==========================================
export async function saveProject(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Não autorizado" }

  const projectId = formData.get('projectId') as string
  const status = formData.get('status') as string || 'draft'
  
  // Verifica status anterior para notificação inteligente
  let previousStatus = 'draft';
  if (projectId) {
      const { data: currentProj } = await supabase.from('student_projects').select('status').eq('id', projectId).single();
      if (currentProj) previousStatus = currentProj.status;
  }
  
  const dataToSave = {
    user_id: user.id,
    mini_bio: formData.get('miniBio') as string,
    dreams: formData.get('dreams') as string,
    // Novos campos
    action_plan_goal: formData.get('actionPlanGoal') as string,
    action_plan_how: formData.get('actionPlanHow') as string,
    action_plan_deadline: formData.get('actionPlanDeadline') as string,
    
    life_project_url: (formData.get('lifeProjectUrl') as string) || null,
    resume_url: (formData.get('resumeUrl') as string) || null,
    status: status,
    updated_at: new Date().toISOString()
  }

  let result;
  if (projectId) {
    result = await supabase.from('student_projects').update(dataToSave).eq('id', projectId)
  } else {
    result = await supabase.from('student_projects').insert(dataToSave)
  }

  if (result.error) {
    console.error("Erro ao salvar projeto:", result.error)
    return { error: "Erro ao salvar." }
  }

  // Lógica de Notificação para o Professor
  if (status === 'pending') {
     const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, classrooms(teacher_id)')
        .eq('id', user.id)
        .single()
     
     // @ts-ignore
     const teacherId = profile?.classrooms?.teacher_id;
     const studentName = profile?.full_name || 'Um aluno';

     if (teacherId) {
        const title = previousStatus === 'changes_requested' ? 'Correção Enviada 🔄' : 'Novo Projeto Recebido 📄';
        const msg = previousStatus === 'changes_requested' 
            ? `${studentName} enviou as correções solicitadas.`
            : `${studentName} enviou o projeto para avaliação inicial.`;

        await createNotification({
            recipientId: teacherId,
            senderId: user.id,
            type: 'submission',
            title: title,
            message: msg,
            link: '/teacher/dashboard'
        })
     }
  }

  revalidatePath('/student/dashboard')
  return { success: true }
}

// ==========================================
// 4. AÇÃO: DELETAR PROJETO (deleteMyProject)
// ==========================================
export async function deleteMyProject(projectId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Não autorizado" }

  // 1. Limpar arquivos do Storage antes de deletar
  const { data: project } = await supabase
    .from('student_projects')
    .select('life_project_url, resume_url')
    .eq('id', projectId)
    .single()

  if (project) {
      const filesToRemove = []
      // Extrai apenas o caminho relativo do bucket, removendo a URL base
      // Ex: .../project-files/user/file.pdf -> user/file.pdf
      if (project.life_project_url) {
          const parts = project.life_project_url.split('/project-files/')
          if (parts[1]) filesToRemove.push(parts[1])
      }
      if (project.resume_url) {
          const parts = project.resume_url.split('/project-files/')
          if (parts[1]) filesToRemove.push(parts[1])
      }

      if (filesToRemove.length > 0) {
          await supabase.storage.from('project-files').remove(filesToRemove)
      }
  }

  // 2. Deletar do banco
  const { error } = await supabase
    .from('student_projects')
    .delete()
    .eq('id', projectId)
    .eq('user_id', user.id)

  if (error) {
      console.error("Erro delete:", error)
      return { error: "Erro ao deletar projeto." }
  }

  revalidatePath('/student/dashboard')
  return { success: "Projeto excluído com sucesso." }
}*
'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { createNotification } from '../notifications/actions'

// --- HELPER: Extrair caminho relativo (Igual ao do professor) ---
function extractFilePath(fullUrl: string | null) {
  if (!fullUrl) return null;
  const bucketName = 'project-files';
  if (fullUrl.includes(`/${bucketName}/`)) {
      return fullUrl.split(`/${bucketName}/`)[1];
  }
  return fullUrl; 
}

// ==========================================
// 1. AÇÃO: ENTRAR NA TURMA
// ==========================================
export async function joinClassroomAction(code: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: "Usuário não autenticado." }
  if (!code || code.length < 3) return { error: "Código inválido." }

  const { data: classroom } = await supabase
    .from('classrooms')
    .select('id, school_name, teacher_id')
    .eq('code', code.toUpperCase().trim())
    .single()

  if (!classroom) {
    return { error: "Código não encontrado. Verifique com seu professor." }
  }

  const { error: updateError } = await supabase
    .from('profiles')
    .update({ 
      classroom_id: classroom.id,
      school_name: classroom.school_name 
    })
    .eq('id', user.id)

  if (updateError) return { error: "Erro ao salvar vínculo. Tente novamente." }

  revalidatePath('/student/dashboard')
  return { success: true }
}

// ==========================================
// 2. AÇÃO: BUSCAR PROJETO
// ==========================================
export async function getStudentProject() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data: project } = await supabase
    .from('student_projects')
    .select('*')
    .eq('user_id', user.id)
    .single()

  return project
}

// ==========================================
// 3. AÇÃO: SALVAR PROJETO (COM NOTIFICAÇÃO ROBUSTA)
// ==========================================
export async function saveProject(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Não autorizado" }

  const projectId = formData.get('projectId') as string
  const status = formData.get('status') as string || 'draft'
  
  // 1. Verifica status anterior para saber se é Reenvio
  let previousStatus = 'draft';
  if (projectId) {
      const { data: currentProj } = await supabase.from('student_projects').select('status').eq('id', projectId).single();
      if (currentProj) previousStatus = currentProj.status;
  }

  const dataToSave = {
    user_id: user.id,
    mini_bio: formData.get('miniBio') as string,
    dreams: formData.get('dreams') as string,
    // Novos Campos
    action_plan_goal: formData.get('actionPlanGoal') as string,
    action_plan_how: formData.get('actionPlanHow') as string,
    action_plan_deadline: formData.get('actionPlanDeadline') as string,
    
    life_project_url: (formData.get('lifeProjectUrl') as string) || null,
    resume_url: (formData.get('resumeUrl') as string) || null,
    status: status,
    updated_at: new Date().toISOString()
  }

  // 2. Salva no Banco
  let result;
  if (projectId) {
    result = await supabase.from('student_projects').update(dataToSave).eq('id', projectId)
  } else {
    result = await supabase.from('student_projects').insert(dataToSave)
  }

  if (result.error) {
    console.error("Erro BD:", result.error)
    return { error: "Erro ao salvar." }
  }

  // 3. Notificação para o Professor
  if (status === 'pending') {
     // Busca dados do aluno
     const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, classroom_id')
        .eq('id', user.id)
        .single()
     
     if (profile?.classroom_id) {
        // Busca o professor diretamente pela turma
        const { data: classroom } = await supabase
            .from('classrooms')
            .select('teacher_id')
            .eq('id', profile.classroom_id)
            .single()

        if (classroom?.teacher_id) {
            const title = previousStatus === 'changes_requested' ? 'Correção Enviada 🔄' : 'Novo Projeto Recebido 📄';
            const msg = previousStatus === 'changes_requested' 
                ? `${profile.full_name} enviou as correções solicitadas.`
                : `${profile.full_name} enviou o projeto para avaliação.`;

            await createNotification({
                recipientId: classroom.teacher_id,
                senderId: user.id,
                type: 'submission',
                title: title,
                message: msg,
                link: '/teacher/dashboard'
            })
        }
     }
  }

  revalidatePath('/student/dashboard')
  return { success: true }
}

// ==========================================
// 4. AÇÃO: DELETAR PROJETO (COM LIMPEZA)
// ==========================================
export async function deleteMyProject(projectId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Não autorizado" }

  // 1. Limpar arquivos
  const { data: project } = await supabase
    .from('student_projects')
    .select('life_project_url, resume_url')
    .eq('id', projectId)
    .single()

  if (project) {
      const filesToRemove = []
      const lifePath = extractFilePath(project.life_project_url)
      const resumePath = extractFilePath(project.resume_url)

      if (lifePath) filesToRemove.push(lifePath)
      if (resumePath) filesToRemove.push(resumePath)

      if (filesToRemove.length > 0) {
          await supabase.storage.from('project-files').remove(filesToRemove)
      }
  }

  // 2. Deletar do banco
  const { error } = await supabase
    .from('student_projects')
    .delete()
    .eq('id', projectId)
    .eq('user_id', user.id)

  if (error) return { error: "Erro ao deletar projeto." }

  revalidatePath('/student/dashboard')
  return { success: "Projeto excluído com sucesso." }
}*/

'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { createNotification } from '../notifications/actions'

// --- HELPER: Extrair caminho relativo do arquivo ---
// Transforma: "https://.../project-files/user/doc.pdf" em "user/doc.pdf"
function extractFilePath(fullUrl: string | null) {
  if (!fullUrl) return null;
  const bucketName = 'project-files';
  
  // Se a URL contém o bucket, pega o que vem depois
  if (fullUrl.includes(`/${bucketName}/`)) {
      return fullUrl.split(`/${bucketName}/`)[1];
  }
  return fullUrl; // Retorna como está se já for o caminho relativo
}

// ==========================================
// 1. AÇÃO: ENTRAR NA TURMA
// ==========================================
export async function joinClassroomAction(code: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: "Usuário não autenticado." }
  if (!code || code.length < 3) return { error: "Código inválido." }

  const { data: classroom } = await supabase
    .from('classrooms')
    .select('id, school_name, teacher_id')
    .eq('code', code.toUpperCase().trim())
    .single()

  if (!classroom) {
    return { error: "Código não encontrado. Verifique com seu professor." }
  }

  const { error: updateError } = await supabase
    .from('profiles')
    .update({ 
      classroom_id: classroom.id,
      school_name: classroom.school_name 
    })
    .eq('id', user.id)

  if (updateError) return { error: "Erro ao salvar vínculo. Tente novamente." }

  revalidatePath('/student/dashboard')
  return { success: true }
}

/// ... imports

// ==========================================
// 2. AÇÃO: BUSCAR TODOS OS PROJETOS (Atualizado)
// ==========================================
export async function getStudentProjects() { // Renomeei para Plural
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return []

  // Retira o .single() e adiciona order
  const { data: projects } = await supabase
    .from('student_projects')
    .select('*')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })

  return projects || []
}

// ... (Mantenha as outras funções saveProject, deleteMyProject, etc)

// ==========================================
// 3. AÇÃO: SALVAR PROJETO
// ==========================================
export async function saveProject(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Não autorizado" }

  const projectId = formData.get('projectId') as string
  // Força 'draft' se vier vazio
  const status = formData.get('status') as string || 'draft'
  
  const dataToSave = {
    user_id: user.id,
    mini_bio: formData.get('miniBio') as string,
    dreams: formData.get('dreams') as string,
    
    // Novos Campos
    action_plan_goal: formData.get('actionPlanGoal') as string,
    action_plan_how: formData.get('actionPlanHow') as string,
    action_plan_deadline: formData.get('actionPlanDeadline') as string,
    
    // === URLs dos arquivos (Lê dos inputs ocultos) ===
    life_project_url: (formData.get('lifeProjectUrl') as string) || null,
    resume_url: (formData.get('resumeUrl') as string) || null,
    
    status: status,
    updated_at: new Date().toISOString()
  }

  // Debug (Remover em produção)
  console.log("Salvando projeto:", status, dataToSave.life_project_url ? "Com arquivo" : "Sem arquivo");

  let result;
  if (projectId) {
    result = await supabase.from('student_projects').update(dataToSave).eq('id', projectId)
  } else {
    result = await supabase.from('student_projects').insert(dataToSave)
  }

  if (result.error) {
    console.error("Erro ao salvar projeto:", result.error)
    return { error: "Erro ao salvar." }
  }

  // Notificação para Professor
  if (status === 'pending') {
     const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, classroom_id')
        .eq('id', user.id)
        .single()
     
     if (profile?.classroom_id) {
        const { data: classroom } = await supabase
            .from('classrooms')
            .select('teacher_id')
            .eq('id', profile.classroom_id)
            .single()

        if (classroom?.teacher_id) {
            await createNotification({
                recipientId: classroom.teacher_id,
                senderId: user.id,
                type: 'submission',
                title: 'Novo Projeto Recebido 📄',
                message: `${profile.full_name} enviou o projeto para avaliação.`,
                link: '/teacher/dashboard'
            })
        }
     }
  }

  revalidatePath('/student/dashboard')
  return { success: "Projeto salvo com sucesso!" }
}

// ==========================================
// 4. AÇÃO: DELETAR PROJETO (COM LIMPEZA)
// ==========================================
export async function deleteMyProject(projectId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Não autorizado" }

  // 1. Limpar arquivos do Storage
  const { data: project } = await supabase
    .from('student_projects')
    .select('life_project_url, resume_url')
    .eq('id', projectId)
    .single()

  if (project) {
      const filesToRemove = []
      // Usa o helper para garantir que temos apenas o caminho relativo
      const lifePath = extractFilePath(project.life_project_url)
      const resumePath = extractFilePath(project.resume_url)

      if (lifePath) filesToRemove.push(lifePath)
      if (resumePath) filesToRemove.push(resumePath)

      if (filesToRemove.length > 0) {
          await supabase.storage.from('project-files').remove(filesToRemove)
      }
  }

  // 2. Deletar do banco de dados
  const { error } = await supabase
    .from('student_projects')
    .delete()
    .eq('id', projectId)
    .eq('user_id', user.id)

  if (error) return { error: "Erro ao deletar projeto." }

  revalidatePath('/student/dashboard')
  return { success: "Projeto excluído com sucesso." }
}