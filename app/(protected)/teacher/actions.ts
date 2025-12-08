/*'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

// ==========================================================
// 1. BUSCAR PROJETOS RECEBIDOS (Avaliações Pendentes)
// ==========================================================
export async function getSubmissions() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  // Busca projetos onde o status NÃO é rascunho
  // O filtro de "apenas meus alunos" é feito automaticamente pelo RLS do Banco
  const { data, error } = await supabase
    .from('student_projects')
    .select(`
      *,
      profiles:user_id ( full_name, school_name, classroom_id )
    `)
    .neq('status', 'draft') 
    .order('updated_at', { ascending: false })

  if (error) {
    console.error('Erro ao buscar submissões:', error)
    return []
  }

  // Filtra caso venha algum perfil nulo (segurança extra)
  const validData = data?.filter((item: any) => item.profiles) || []

  // Gera Links de Download Temporários (Signed URLs)
  const projectsWithLinks = await Promise.all(validData.map(async (project) => {
    let signedLifeUrl = null
    let signedResumeUrl = null

    if (project.life_project_url) {
        const { data } = await supabase.storage.from('assignments').createSignedUrl(project.life_project_url, 3600)
        signedLifeUrl = data?.signedUrl
    }

    if (project.resume_url) {
        const { data } = await supabase.storage.from('assignments').createSignedUrl(project.resume_url, 3600)
        signedResumeUrl = data?.signedUrl
    }
    
    return { ...project, signedLifeUrl, signedResumeUrl }
  }))

  return projectsWithLinks
}

// ==========================================================
// 2. AVALIAR PROJETO (Aprovar ou Pedir Correção)
// ==========================================================
export async function evaluateProject(projectId: string, newStatus: 'approved' | 'changes_requested', feedback?: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('student_projects')
    .update({
      status: newStatus,
      teacher_feedback: feedback || null,
      updated_at: new Date().toISOString()
    })
    .eq('id', projectId)

  if (error) return { error: "Erro ao atualizar status." }

  revalidatePath('/teacher/dashboard')
  return { success: "Avaliação registrada com sucesso." }
}

// ==========================================================
// 3. DELETAR PROJETO (Ação do Professor)
// ==========================================================
export async function deleteStudentProject(projectId: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Não autorizado" }

  const { error } = await supabase
    .from('student_projects')
    .delete()
    .eq('id', projectId)

  if (error) return { error: "Erro ao deletar projeto." }

  revalidatePath('/teacher/dashboard')
  return { success: "Projeto removido com sucesso." }
}

// ==========================================================
// 4. BUSCAR ALUNOS DA TURMA + ARQUIVOS (BLINDADO)
// ==========================================================
export async function getClassroomStudents(classroomId: string) {
  const supabase = await createClient()
  
  // A. Busca apenas os PERFIS dos alunos (Simples e Seguro)
  // Nota: Certifique-se de ter rodado o SQL que cria a coluna 'email' em profiles
  const { data: students, error: studentsError } = await supabase
    .from('profiles')
    .select('id, full_name, email')
    .eq('classroom_id', classroomId)
    .order('full_name', { ascending: true })

  if (studentsError) {
    console.error("Erro ao buscar alunos:", studentsError)
    return []
  }

  if (!students || students.length === 0) return []

  // B. Busca os PROJETOS desses alunos em uma query separada
  // (Isso evita erro de Join complexo no Supabase)
  const studentIds = students.map(s => s.id)
  
  const { data: projects, error: projectsError } = await supabase
    .from('student_projects')
    .select('user_id, life_project_url, resume_url, status')
    .in('user_id', studentIds)

  if (projectsError) {
    console.error("Erro ao buscar projetos:", projectsError)
    // Retorna a lista de alunos mesmo se falhar os projetos, para não quebrar a tela
    return students.map(s => ({ ...s, hasProject: false, lifeUrl: null, resumeUrl: null }))
  }

  // C. Cruza os dados (Aluno + Projeto) e Gera Links no servidor
  const studentsWithFiles = await Promise.all(students.map(async (student) => {
    // Encontra o projeto deste aluno na lista trazida do banco
    const project = projects?.find((p: any) => p.user_id === student.id) || null
    
    let lifeUrl = null
    let resumeUrl = null

    // Se tiver projeto, gera as URLs assinadas
    if (project) {
      if (project.life_project_url) {
        const { data } = await supabase.storage.from('assignments').createSignedUrl(project.life_project_url, 3600)
        lifeUrl = data?.signedUrl
      }
      if (project.resume_url) {
        const { data } = await supabase.storage.from('assignments').createSignedUrl(project.resume_url, 3600)
        resumeUrl = data?.signedUrl
      }
    }

    return {
      id: student.id,
      full_name: student.full_name,
      email: student.email, // Agora virá do banco (se rodou o SQL)
      hasProject: !!project, // Booleano: tem projeto ou não?
      status: project?.status || 'pending',
      lifeUrl,
      resumeUrl
    }
  }))

  return studentsWithFiles
}*

'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { createNotification } from '../notifications/actions'

// --- FUNÇÃO AUXILIAR PARA CORRIGIR O CAMINHO DO ARQUIVO ---
// O banco salva a URL completa, mas o createSignedUrl precisa apenas do caminho (path)
function extractFilePath(fullUrl: string | null) {
  if (!fullUrl) return null;
  // Se a URL contém o nome do bucket, pegamos tudo depois dele
  const parts = fullUrl.split('/project-files/');
  if (parts.length > 1) {
    return parts[1]; // Retorna "user_id/arquivo.pdf"
  }
  return fullUrl; // Retorna original se não achar o padrão (fallback)
}

// ==========================================================
// 1. BUSCAR PROJETOS RECEBIDOS (Avaliações Pendentes)
// ==========================================================
export async function getSubmissions() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('student_projects')
    .select(`
      *,
      profiles:user_id ( full_name, school_name, classroom_id, avatar_url )
    `)
    .neq('status', 'draft') 
    .order('updated_at', { ascending: false })

  if (error) {
    console.error('Erro ao buscar submissões:', error)
    return []
  }

  const validData = data?.filter((item: any) => item.profiles) || []

  // Gera Links de Download Temporários Corrigidos
  const projectsWithLinks = await Promise.all(validData.map(async (project) => {
    let signedLifeUrl = null
    let signedResumeUrl = null

    // CORREÇÃO APLICADA AQUI: Usando extractFilePath
    if (project.life_project_url) {
        const path = extractFilePath(project.life_project_url)
        if (path) {
            const { data } = await supabase.storage.from('project-files').createSignedUrl(path, 3600)
            signedLifeUrl = data?.signedUrl || null
        }
    }

    if (project.resume_url) {
        const path = extractFilePath(project.resume_url)
        if (path) {
            const { data } = await supabase.storage.from('project-files').createSignedUrl(path, 3600)
            signedResumeUrl = data?.signedUrl || null
        }
    }
    
    return { ...project, signedLifeUrl, signedResumeUrl }
  }))

  return projectsWithLinks
}

// ==========================================================
// 2. AVALIAR PROJETO (COM NOTIFICAÇÃO)
// ==========================================================
export async function evaluateProject(projectId: string, newStatus: 'approved' | 'changes_requested', feedback?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: project } = await supabase
    .from('student_projects')
    .select('user_id')
    .eq('id', projectId)
    .single()

  if (!project) return { error: "Projeto não encontrado" }

  const { error } = await supabase
    .from('student_projects')
    .update({
      status: newStatus,
      teacher_feedback: feedback || null,
      updated_at: new Date().toISOString()
    })
    .eq('id', projectId)

  if (error) return { error: "Erro ao atualizar status." }

  const title = newStatus === 'approved' ? 'Projeto Aprovado! 🎉' : 'Atenção: Correção Necessária ⚠️';
  const message = newStatus === 'approved' 
      ? 'Seu professor aprovou seu projeto de vida! Parabéns.'
      : `O professor solicitou ajustes: "${feedback?.substring(0, 50)}${feedback && feedback.length > 50 ? '...' : ''}"`;

  await createNotification({
      recipientId: project.user_id,
      senderId: user?.id,
      type: 'feedback',
      title: title,
      message: message,
      link: '/student/dashboard'
  })

  revalidatePath('/teacher/dashboard')
  return { success: "Avaliação enviada." }
}

// ==========================================================
// 3. DELETAR PROJETO (Ação do Professor)
// ==========================================================
export async function deleteStudentProject(projectId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user?.id).single()
  if (profile?.role !== 'teacher') return { error: "Sem permissão." }

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

  const { error } = await supabase
    .from('student_projects')
    .delete()
    .eq('id', projectId)

  if (error) return { error: "Erro ao deletar projeto." }

  revalidatePath('/teacher/dashboard')
  return { success: "Projeto do aluno removido." }
}

// ==========================================================
// 4. BUSCAR ALUNOS DA TURMA + ARQUIVOS
// ==========================================================
export async function getClassroomStudents(classroomId: string) {
  const supabase = await createClient()
  
  const { data: students, error: studentsError } = await supabase
    .from('profiles')
    .select('id, full_name, email')
    .eq('classroom_id', classroomId)
    .order('full_name', { ascending: true })

  if (studentsError || !students) return []

  const studentIds = students.map(s => s.id)
  
  const { data: projects, error: projectsError } = await supabase
    .from('student_projects')
    .select('user_id, life_project_url, resume_url, status, action_plan_goal')
    .in('user_id', studentIds)

  if (projectsError) return students.map(s => ({ ...s, hasProject: false }))

  const studentsWithFiles = await Promise.all(students.map(async (student) => {
    const project = projects?.find((p: any) => p.user_id === student.id) || null
    
    let lifeUrl = null
    let resumeUrl = null

    if (project) {
      // CORREÇÃO APLICADA AQUI TAMBÉM
      if (project.life_project_url) {
        const path = extractFilePath(project.life_project_url)
        if (path) {
            const { data } = await supabase.storage.from('project-files').createSignedUrl(path, 3600)
            lifeUrl = data?.signedUrl || null
        }
      }
      if (project.resume_url) {
        const path = extractFilePath(project.resume_url)
        if (path) {
            const { data } = await supabase.storage.from('project-files').createSignedUrl(path, 3600)
            resumeUrl = data?.signedUrl || null
        }
      }
    }

    return {
      id: student.id,
      full_name: student.full_name,
      email: student.email,
      hasProject: !!project,
      status: project?.status || 'pending',
      lifeUrl,
      resumeUrl,
      goal: project?.action_plan_goal
    }
  }))

  return studentsWithFiles
}* /
'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { createNotification } from '../notifications/actions'

// --- HELPER: Extrair caminho relativo do arquivo ---
// Transforma: "https://.../project-files/user/doc.pdf" em "user/doc.pdf"
function extractFilePath(fullUrl: string | null) {
  if (!fullUrl) return null;
  const bucketName = 'project-files';
  
  if (fullUrl.includes(`/${bucketName}/`)) {
      return fullUrl.split(`/${bucketName}/`)[1];
  }
  return fullUrl; // Fallback se já for relativo
}

// ==========================================================
// 1. BUSCAR PROJETOS RECEBIDOS (Avaliações Pendentes)
// ==========================================================
export async function getSubmissions() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  // Busca projetos onde status != rascunho
  const { data, error } = await supabase
    .from('student_projects')
    .select(`
      *,
      profiles:user_id ( full_name, school_name, classroom_id, avatar_url )
    `)
    .neq('status', 'draft') 
    .order('updated_at', { ascending: false })

  if (error) {
    console.error('Erro ao buscar submissões:', error)
    return []
  }

  const validData = data?.filter((item: any) => item.profiles) || []

  // Processa URLs assinadas para download
  const projectsWithLinks = await Promise.all(validData.map(async (project) => {
    let signedLifeUrl = null
    let signedResumeUrl = null

    // Correção: Extrai o caminho limpo antes de pedir a URL assinada
    if (project.life_project_url) {
        const path = extractFilePath(project.life_project_url)
        if (path) {
            const { data } = await supabase.storage.from('project-files').createSignedUrl(path, 3600)
            signedLifeUrl = data?.signedUrl || null
        }
    }

    if (project.resume_url) {
        const path = extractFilePath(project.resume_url)
        if (path) {
            const { data } = await supabase.storage.from('project-files').createSignedUrl(path, 3600)
            signedResumeUrl = data?.signedUrl || null
        }
    }
    
    return { ...project, signedLifeUrl, signedResumeUrl }
  }))

  return projectsWithLinks
}

// ==========================================================
// 2. AVALIAR PROJETO (COM NOTIFICAÇÃO)
// ==========================================================
export async function evaluateProject(projectId: string, newStatus: 'approved' | 'changes_requested', feedback?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // 1. Buscar dono do projeto (para notificar)
  const { data: project } = await supabase
    .from('student_projects')
    .select('user_id')
    .eq('id', projectId)
    .single()

  if (!project) return { error: "Projeto não encontrado" }

  // 2. Atualizar status
  const { error } = await supabase
    .from('student_projects')
    .update({
      status: newStatus,
      teacher_feedback: feedback || null,
      updated_at: new Date().toISOString()
    })
    .eq('id', projectId)

  if (error) return { error: "Erro ao atualizar status." }

  // 3. Notificar o Aluno
  const title = newStatus === 'approved' ? 'Projeto Aprovado! 🎉' : 'Atenção: Correção Necessária ⚠️';
  const message = newStatus === 'approved' 
      ? 'Seu professor aprovou seu projeto de vida! Parabéns.'
      : `O professor solicitou ajustes: "${feedback?.substring(0, 50)}${feedback && feedback.length > 50 ? '...' : ''}"`;

  await createNotification({
      recipientId: project.user_id,
      senderId: user?.id,
      type: 'feedback',
      title: title,
      message: message,
      link: '/student/dashboard'
  })

  revalidatePath('/teacher/dashboard')
  return { success: "Avaliação enviada." }
}

// ==========================================================
// 3. DELETAR PROJETO (Ação do Professor)
// ==========================================================
export async function deleteStudentProject(projectId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  // Verifica se é professor
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user?.id).single()
  if (profile?.role !== 'teacher') return { error: "Sem permissão." }

  // 1. Limpar Arquivos do Storage
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

  // 2. Deletar do Banco
  const { error } = await supabase
    .from('student_projects')
    .delete()
    .eq('id', projectId)

  if (error) return { error: "Erro ao deletar projeto." }

  revalidatePath('/teacher/dashboard')
  return { success: "Projeto do aluno removido." }
}

// ==========================================================
// 4. BUSCAR ALUNOS DA TURMA + ARQUIVOS
// ==========================================================
export async function getClassroomStudents(classroomId: string) {
  const supabase = await createClient()
  
  // A. Busca perfis
  const { data: students, error: studentsError } = await supabase
    .from('profiles')
    .select('id, full_name, email')
    .eq('classroom_id', classroomId)
    .order('full_name', { ascending: true })

  if (studentsError || !students) return []

  // B. Busca projetos
  const studentIds = students.map(s => s.id)
  const { data: projects } = await supabase
    .from('student_projects')
    .select('user_id, life_project_url, resume_url, status, action_plan_goal')
    .in('user_id', studentIds)

  // C. Cruza dados e gera links
  const studentsWithFiles = await Promise.all(students.map(async (student) => {
    const project = projects?.find((p: any) => p.user_id === student.id) || null
    
    let lifeUrl = null
    let resumeUrl = null

    if (project) {
      if (project.life_project_url) {
        const path = extractFilePath(project.life_project_url)
        if (path) {
            const { data } = await supabase.storage.from('project-files').createSignedUrl(path, 3600)
            lifeUrl = data?.signedUrl || null
        }
      }
      if (project.resume_url) {
        const path = extractFilePath(project.resume_url)
        if (path) {
            const { data } = await supabase.storage.from('project-files').createSignedUrl(path, 3600)
            resumeUrl = data?.signedUrl || null
        }
      }
    }

    return {
      id: student.id,
      full_name: student.full_name,
      email: student.email,
      hasProject: !!project,
      status: project?.status || 'pending',
      lifeUrl,
      resumeUrl,
      goal: project?.action_plan_goal
    }
  }))

  return studentsWithFiles
}* /
'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { createNotification } from '../notifications/actions'

// --- HELPER: Extrair caminho relativo do arquivo ---
function extractFilePath(fullUrl: string | null) {
  if (!fullUrl) return null;
  const bucketName = 'project-files';
  
  if (fullUrl.includes(`/${bucketName}/`)) {
      return fullUrl.split(`/${bucketName}/`)[1];
  }
  return fullUrl;
}

// ==========================================================
// 1. BUSCAR PROJETOS RECEBIDOS
// ==========================================================
export async function getSubmissions() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('student_projects')
    .select(`
      *,
      profiles:user_id ( full_name, school_name, classroom_id, avatar_url )
    `)
    .neq('status', 'draft') 
    .order('updated_at', { ascending: false })

  if (error) {
    console.error('Erro ao buscar submissões:', error)
    return []
  }

  const validData = data?.filter((item: any) => item.profiles) || []

  const projectsWithLinks = await Promise.all(validData.map(async (project) => {
    let signedLifeUrl = null
    let signedResumeUrl = null

    if (project.life_project_url) {
        const path = extractFilePath(project.life_project_url)
        if (path) {
            const { data } = await supabase.storage.from('project-files').createSignedUrl(path, 3600)
            signedLifeUrl = data?.signedUrl || null
        }
    }

    if (project.resume_url) {
        const path = extractFilePath(project.resume_url)
        if (path) {
            const { data } = await supabase.storage.from('project-files').createSignedUrl(path, 3600)
            signedResumeUrl = data?.signedUrl || null
        }
    }
    
    return { ...project, signedLifeUrl, signedResumeUrl }
  }))

  return projectsWithLinks
}

// ==========================================================
// 2. AVALIAR PROJETO (CORRIGIDO PARA TEXTO COMPLETO)
// ==========================================================
export async function evaluateProject(projectId: string, newStatus: 'approved' | 'changes_requested', feedback?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: project } = await supabase
    .from('student_projects')
    .select('user_id')
    .eq('id', projectId)
    .single()

  if (!project) return { error: "Projeto não encontrado" }

  const { error } = await supabase
    .from('student_projects')
    .update({
      status: newStatus,
      teacher_feedback: feedback || null,
      updated_at: new Date().toISOString()
    })
    .eq('id', projectId)

  if (error) return { error: "Erro ao atualizar status." }

  // --- CORREÇÃO AQUI: REMOVIDO O .substring(0, 50) ---
  const title = newStatus === 'approved' ? 'Projeto Aprovado! 🎉' : 'Atenção: Correção Necessária ⚠️';
  
  // Agora salvamos o feedback INTEIRO na notificação
  const message = newStatus === 'approved' 
      ? 'Seu professor aprovou seu projeto de vida! Parabéns.'
      : `O professor solicitou ajustes: "${feedback}"`; 

  await createNotification({
      recipientId: project.user_id,
      senderId: user?.id,
      type: 'feedback',
      title: title,
      message: message, // Vai o texto todo agora
      link: '/student/dashboard'
  })

  revalidatePath('/teacher/dashboard')
  return { success: "Avaliação enviada." }
}

// ==========================================================
// 3. DELETAR PROJETO
// ==========================================================
export async function deleteStudentProject(projectId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user?.id).single()
  if (profile?.role !== 'teacher') return { error: "Sem permissão." }

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

  const { error } = await supabase
    .from('student_projects')
    .delete()
    .eq('id', projectId)

  if (error) return { error: "Erro ao deletar projeto." }

  revalidatePath('/teacher/dashboard')
  return { success: "Projeto do aluno removido." }
}

// ==========================================================
// 4. BUSCAR ALUNOS DA TURMA
// ==========================================================
export async function getClassroomStudents(classroomId: string) {
  const supabase = await createClient()
  
  const { data: students, error: studentsError } = await supabase
    .from('profiles')
    .select('id, full_name, email')
    .eq('classroom_id', classroomId)
    .order('full_name', { ascending: true })

  if (studentsError || !students) return []

  const studentIds = students.map(s => s.id)
  
  const { data: projects, error: projectsError } = await supabase
    .from('student_projects')
    .select('user_id, life_project_url, resume_url, status, action_plan_goal')
    .in('user_id', studentIds)

  if (projectsError) return students.map(s => ({ ...s, hasProject: false }))

  const studentsWithFiles = await Promise.all(students.map(async (student) => {
    const project = projects?.find((p: any) => p.user_id === student.id) || null
    
    let lifeUrl = null
    let resumeUrl = null

    if (project) {
      if (project.life_project_url) {
        const path = extractFilePath(project.life_project_url)
        if (path) {
            const { data } = await supabase.storage.from('project-files').createSignedUrl(path, 3600)
            lifeUrl = data?.signedUrl || null
        }
      }
      if (project.resume_url) {
        const path = extractFilePath(project.resume_url)
        if (path) {
            const { data } = await supabase.storage.from('project-files').createSignedUrl(path, 3600)
            resumeUrl = data?.signedUrl || null
        }
      }
    }

    return {
      id: student.id,
      full_name: student.full_name,
      email: student.email,
      hasProject: !!project,
      status: project?.status || 'pending',
      lifeUrl,
      resumeUrl,
      goal: project?.action_plan_goal
    }
  }))

  return studentsWithFiles
}*/
'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { createNotification } from '../notifications/actions'

// --- HELPER ---
function extractFilePath(fullUrl: string | null) {
  if (!fullUrl) return null;
  const bucketName = 'project-files';
  if (fullUrl.includes(`/${bucketName}/`)) {
      return fullUrl.split(`/${bucketName}/`)[1];
  }
  return fullUrl;
}

// ==========================================================
// 1. BUSCAR PROJETOS RECEBIDOS (Avaliações Pendentes)
// ==========================================================
export async function getSubmissions() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('student_projects')
    .select(`*, profiles:user_id ( full_name, school_name, classroom_id, avatar_url )`)
    .neq('status', 'draft') 
    .order('updated_at', { ascending: false })

  if (error) return []

  const validData = data?.filter((item: any) => item.profiles) || []

  const projectsWithLinks = await Promise.all(validData.map(async (project) => {
    let signedLifeUrl = null
    let signedResumeUrl = null

    if (project.life_project_url) {
        const path = extractFilePath(project.life_project_url)
        if (path) {
            const { data } = await supabase.storage.from('project-files').createSignedUrl(path, 3600)
            signedLifeUrl = data?.signedUrl || null
        }
    }

    if (project.resume_url) {
        const path = extractFilePath(project.resume_url)
        if (path) {
            const { data } = await supabase.storage.from('project-files').createSignedUrl(path, 3600)
            signedResumeUrl = data?.signedUrl || null
        }
    }
    return { ...project, signedLifeUrl, signedResumeUrl }
  }))

  return projectsWithLinks
}

// ==========================================================
// 2. AVALIAR PROJETO
// ==========================================================
export async function evaluateProject(projectId: string, newStatus: 'approved' | 'changes_requested' | 'rejected', feedback?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: project } = await supabase.from('student_projects').select('user_id').eq('id', projectId).single()
  if (!project) return { error: "Projeto não encontrado" }

  const { error } = await supabase
    .from('student_projects')
    .update({
      status: newStatus,
      teacher_feedback: feedback || null,
      updated_at: new Date().toISOString()
    })
    .eq('id', projectId)

  if (error) return { error: "Erro ao atualizar status." }

  // Notificação
  let title = '';
  let message = '';

  if (newStatus === 'approved') {
      title = 'Projeto Aprovado! 🎉';
      message = 'Seu professor aprovou seu projeto de vida! Parabéns.';
  } else if (newStatus === 'changes_requested') {
      title = 'Atenção: Correção Necessária ⚠️';
      message = `O professor solicitou ajustes: "${feedback}"`;
  } else if (newStatus === 'rejected') {
      title = 'Projeto Reprovado ❌';
      message = `Seu projeto não foi aceito. Motivo: "${feedback}".`;
  }

  await createNotification({
      recipientId: project.user_id,
      senderId: user?.id,
      type: 'feedback',
      title: title,
      message: message,
      link: '/student/dashboard'
  })

  // ATUALIZA A TELA DO PROFESSOR (Feed e Lista de Turmas)
  revalidatePath('/teacher/dashboard')
  return { success: "Avaliação enviada." }
}

// ==========================================================
// 3. DELETAR PROJETO
// ==========================================================
export async function deleteStudentProject(projectId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user?.id).single()
  if (profile?.role !== 'teacher') return { error: "Sem permissão." }

  const { data: project } = await supabase.from('student_projects').select('life_project_url, resume_url').eq('id', projectId).single()

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

  const { error } = await supabase.from('student_projects').delete().eq('id', projectId)
  if (error) return { error: "Erro ao deletar." }

  revalidatePath('/teacher/dashboard')
  return { success: "Projeto removido." }
}

// ==========================================================
// 4. BUSCAR ALUNOS DA TURMA (CORRIGIDO PARA STATUS ATUALIZADO)
// ==========================================================
export async function getClassroomStudents(classroomId: string) {
  const supabase = await createClient()
  
  const { data: students, error: studentsError } = await supabase
    .from('profiles')
    .select('id, full_name, email')
    .eq('classroom_id', classroomId)
    .order('full_name', { ascending: true })

  if (studentsError || !students) return []

  const studentIds = students.map(s => s.id)
  
  // CORREÇÃO: Adicionado order('updated_at') para garantir que pegamos o status mais recente
  const { data: projects } = await supabase
    .from('student_projects')
    .select('user_id, life_project_url, resume_url, status, action_plan_goal')
    .in('user_id', studentIds)
    .order('updated_at', { ascending: false }) // <--- IMPORTANTE

  const studentsWithFiles = await Promise.all(students.map(async (student) => {
    // Como ordenamos por updated_at desc, o find vai pegar o mais recente
    const project = projects?.find((p: any) => p.user_id === student.id) || null
    
    let lifeUrl = null
    let resumeUrl = null

    if (project) {
      if (project.life_project_url) {
        const path = extractFilePath(project.life_project_url)
        if (path) {
            const { data } = await supabase.storage.from('project-files').createSignedUrl(path, 3600)
            lifeUrl = data?.signedUrl || null
        }
      }
      if (project.resume_url) {
        const path = extractFilePath(project.resume_url)
        if (path) {
            const { data } = await supabase.storage.from('project-files').createSignedUrl(path, 3600)
            resumeUrl = data?.signedUrl || null
        }
      }
    }

    return {
      id: student.id,
      full_name: student.full_name,
      email: student.email,
      hasProject: !!project,
      status: project?.status || 'pending', // Status do DB
      lifeUrl,
      resumeUrl,
      goal: project?.action_plan_goal
    }
  }))

  return studentsWithFiles
}

// ==========================================================
// 5. GESTÃO DE PRAZOS
// ==========================================================
export async function saveDeadline(startDate: string, endDate: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "Não autorizado" }

    const { data: existing } = await supabase.from('school_deadlines').select('id').eq('teacher_id', user.id).single()

    if (existing) {
        await supabase.from('school_deadlines').update({ start_date: startDate, end_date: endDate }).eq('id', existing.id)
    } else {
        await supabase.from('school_deadlines').insert({ teacher_id: user.id, start_date: startDate, end_date: endDate })
    }

    revalidatePath('/teacher/dashboard')
    revalidatePath('/student/dashboard')
    return { success: "Prazo atualizado!" }
}

export async function getDeadline() {
    const supabase = await createClient()
    const { data } = await supabase.from('school_deadlines').select('*').order('created_at', { ascending: false }).limit(1).single()
    return data || null
}