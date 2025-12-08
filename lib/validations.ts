import { z } from 'zod'

// =========================================
// 1. SCHEMAS DE AUTENTICAÇÃO
// =========================================

export const loginSchema = z.object({
  email: z.string().email({ message: "Email inválido" }),
  password: z.string().min(6, { message: "A senha deve ter no mínimo 6 caracteres" }),
})

export const studentSignUpSchema = z.object({
  fullName: z.string().min(3, { message: "Nome completo é obrigatório" }),
  email: z.string().email({ message: "Email inválido" }),
  password: z.string().min(6, { message: "A senha deve ter no mínimo 6 caracteres" }),
  schoolName: z.string().min(3, { message: "Digite o nome completo da sua escola" }), 
})

// =========================================
// 2. SCHEMA DO PROJETO DE VIDA (DASHBOARD)
// =========================================

export const projectSchema = z.object({
  birthDate: z.string().refine((val) => !isNaN(Date.parse(val)), { 
    message: "Data de nascimento inválida" 
  }),

  // Alterado: Mínimo 1 (obrigatório), Máximo 2500
  miniBio: z.string()
    .min(1, { message: "O campo Sobre Mim é obrigatório." })
    .max(2500, { message: "O texto não pode ultrapassar 2500 caracteres." }),

  dreams: z.string()
    .min(1, { message: "O campo Sonhos é obrigatório." })
    .max(2500, { message: "O texto não pode ultrapassar 2500 caracteres." }),

  skills: z.string()
    .min(1, { message: "O campo Habilidades é obrigatório." })
    .max(2500, { message: "O texto não pode ultrapassar 2500 caracteres." }),

  actionPlan: z.string()
    .min(1, { message: "O Plano de Ação é obrigatório." })
    .max(2500, { message: "O texto não pode ultrapassar 2500 caracteres." }),

  lifeProjectUrl: z.string().min(1, { 
    message: "Você precisa fazer o upload do arquivo do Projeto de Vida." 
  }),

  resumeUrl: z.string().min(1, { 
    message: "Você precisa fazer o upload do seu Currículo." 
  }),
})

// ... (mantenha os outros schemas)

export const teacherSignUpSchema = z.object({
  fullName: z.string().min(3, { message: "Nome completo obrigatório." }),
  password: z.string().min(6, { message: "Senha mínima de 6 caracteres." }),
  token: z.string().uuid(), // O token vem oculto no form
})

export type LoginSchema = z.infer<typeof loginSchema>
export type StudentSignUpSchema = z.infer<typeof studentSignUpSchema>
export type ProjectSchema = z.infer<typeof projectSchema>