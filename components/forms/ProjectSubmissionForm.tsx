/*'use client'

import { useState, useTransition } from 'react'
import { useFormStatus } from 'react-dom'
import { saveProject, deleteMyProject } from '@/app/(protected)/student/actions'
import { createClient } from '@/utils/supabase/client'
// CORREÇÃO: Adicionados BookOpen e Clock aos imports
import { 
    Upload, FileText, CheckCircle, AlertTriangle, Lock, XCircle, 
    Trash2, GraduationCap, Save, Send, BookOpen, Clock 
} from 'lucide-react'

// Define os tipos de dados do projeto
interface ProjectData {
    id?: string;
    mini_bio: string;
    dreams: string;
    life_project_url?: string;
    resume_url?: string;
    status: string;
}

// ==========================================
// 1. COMPONENTE AUXILIAR: BOTÃO DE AÇÃO
// ==========================================
function ActionButton({ label, actionName, icon: Icon, className }: { label: string; actionName: string; icon: React.ElementType; className: string }) {
  const { pending } = useFormStatus()
  
  return (
    <button 
      type="submit"
      name="action"
      value={actionName}
      disabled={pending}
      className={`py-3 px-6 rounded-lg font-bold transition-all flex items-center justify-center gap-2 ${className}`}
    >
      {pending ? <span className="animate-pulse">Processando...</span> : <><Icon size={20} /> {label}</>}
    </button>
  )
}

// ==========================================
// 2. COMPONENTE PRINCIPAL: FORMULÁRIO
// ==========================================
export default function ProjectSubmissionForm({ 
    initialData, 
    userId, 
    classroomInfo 
}: { 
    initialData: ProjectData | null; 
    userId: string; 
    classroomInfo: any; 
}) {
    const supabase = createClient();
    const [project, setProject] = useState<ProjectData>(initialData || {
        mini_bio: '',
        dreams: '',
        status: 'draft',
    } as ProjectData);
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | null, message: string | null }>({ type: null, message: null });
    const [isSaving, startTransition] = useTransition();

    const isSubmitted = project.status !== 'draft' && project.status !== 'changes_requested';

    // Função de upload para um único arquivo
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'lifeProjectUrl' | 'resumeUrl') => {
        const file = e.target.files?.[0];
        if (!file) return;

        setFeedback({ type: 'success', message: `Enviando arquivo ${file.name}...` });
        
        const fileExt = file.name.split('.').pop();
        const filePath = `${userId}/${field}-${Math.random()}.${fileExt}`;
        
        // 1. Envia para o Supabase Storage
        const { error: uploadError } = await supabase.storage
            .from('project-files') // Certifique-se que este bucket existe no Supabase
            .upload(filePath, file);

        if (uploadError) {
            setFeedback({ type: 'error', message: `Erro no upload: ${uploadError.message}` });
            return;
        }

        // 2. Obtém a URL pública
        const { data: { publicUrl } } = supabase.storage
            .from('project-files')
            .getPublicUrl(filePath);

        // 3. Atualiza o estado local
        setProject(prev => ({ ...prev, [field]: publicUrl }));
        setFeedback({ type: 'success', message: `${field === 'resumeUrl' ? 'Currículo' : 'Plano'} carregado com sucesso! Salve o projeto.` });
    };

    // Função de Ação do Formulário
    const handleSubmit = (formData: FormData) => {
        setFeedback({ type: null, message: null });
        startTransition(async () => {
            
            const actionType = formData.get('action') as 'draft' | 'pending';
            formData.append('status', actionType);
            
            const result = await saveProject(formData); 

            if (result.error) {
                setFeedback({ type: 'error', message: result.error });
            } else {
                setFeedback({ type: 'success', message: actionType === 'pending' ? 'Projeto enviado para avaliação!' : 'Rascunho salvo com sucesso.' });
                // Atualiza o status localmente para refletir a mudança na UI
                setProject(prev => ({ ...prev, status: actionType }));
            }
        });
    };
    
    // Função para deletar o projeto
    const handleDelete = async () => {
        if (!project.id || !confirm("Tem certeza que deseja DELETAR TODO o seu projeto? Esta ação é irreversível.")) return;
        
        startTransition(async () => {
             const result = await deleteMyProject(project.id!);
             if (result.success) {
                setProject({ mini_bio: '', dreams: '', status: 'draft' } as ProjectData);
                setFeedback({ type: 'success', message: "Projeto excluído e resetado!" });
             } else {
                setFeedback({ type: 'error', message: result.error });
             }
        });
    }

    return (
        <form action={handleSubmit} className="space-y-8 bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            
            <input type="hidden" name="projectId" value={project.id || ''} />
            <input type="hidden" name="userId" value={userId} />

            {/* Feedback Global * /}
            {feedback.message && (
                <div className={`p-4 rounded-lg font-medium ${feedback.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                    {feedback.message}
                </div>
            )}

            {/* Status Atual * /}
            <div className="flex items-center justify-between p-4 bg-gray-50 border rounded-lg">
                <p className="font-semibold text-gray-700 flex items-center gap-2">
                    <GraduationCap size={20} /> Status Atual:
                </p>
                <StatusBadge status={project.status} />
            </div>

            {/* 1. SEÇÃO DE TEXTO * /}
            <div className="space-y-6">
                <label className="text-xl font-bold text-gray-800 border-b pb-2 block">1. Detalhes Pessoais</label>
                
                <div>
                    <label htmlFor="miniBio" className="block text-sm font-medium text-gray-700 mb-1">Mini Biografia</label>
                    <textarea
                        id="miniBio"
                        name="miniBio"
                        rows={4}
                        value={project.mini_bio}
                        onChange={(e) => setProject(p => ({ ...p, mini_bio: e.target.value }))}
                        placeholder="Descreva quem você é..."
                        required
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500"
                    />
                </div>

                <div>
                    <label htmlFor="dreams" className="block text-sm font-medium text-gray-700 mb-1">Metas e Sonhos</label>
                    <textarea
                        id="dreams"
                        name="dreams"
                        rows={4}
                        value={project.dreams}
                        onChange={(e) => setProject(p => ({ ...p, dreams: e.target.value }))}
                        placeholder="Quais são seus objetivos?"
                        required
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500"
                    />
                </div>
            </div>

            {/* 2. SEÇÃO DE UPLOAD * /}
            <div className="space-y-6">
                <label className="text-xl font-bold text-gray-800 border-b pb-2 block">2. Anexos</label>

                <div className="p-4 border rounded-lg">
                    <label className="block font-medium text-gray-700 mb-2">Plano de Ação (.pdf, .docx)</label>
                    <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => handleFileUpload(e, 'lifeProjectUrl')}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    {project.life_project_url && (
                        <p className="mt-2 text-sm text-green-600 flex items-center gap-1">
                            <FileText size={16} /> Arquivo carregado
                        </p>
                    )}
                </div>

                <div className="p-4 border rounded-lg">
                    <label className="block font-medium text-gray-700 mb-2">Currículo (.pdf, .docx)</label>
                    <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => handleFileUpload(e, 'resumeUrl')}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    {project.resume_url && (
                        <p className="mt-2 text-sm text-green-600 flex items-center gap-1">
                            <FileText size={16} /> Arquivo carregado
                        </p>
                    )}
                </div>
            </div>

            {/* 3. AÇÕES * /}
            <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                {project.id && (
                    <button 
                        type="button" 
                        onClick={handleDelete}
                        className="text-red-600 hover:text-red-800 text-sm flex items-center gap-1"
                        disabled={isSaving}
                    >
                        <Trash2 size={16} /> Excluir
                    </button>
                )}
                
                <div className="flex gap-4 ml-auto">
                    <ActionButton
                        label="Salvar Rascunho"
                        actionName="draft"
                        icon={Save}
                        className="bg-gray-200 text-gray-700 hover:bg-gray-300"
                    />
                    <ActionButton
                        label={isSubmitted ? "Re-enviar" : "Enviar para Avaliação"}
                        actionName="pending"
                        icon={Send}
                        className="bg-[#009B3A] text-white hover:bg-green-700"
                    />
                </div>
            </div>
        </form>
    );
}

// Componente StatusBadge corrigido (agora tem acesso aos ícones importados)
function StatusBadge({ status }: { status: string }) {
    const statusMap: { [key: string]: { text: string; color: string; icon: React.ReactNode } } = {
        draft: { text: 'Rascunho', color: 'bg-gray-100 text-gray-600', icon: <BookOpen size={14} /> },
        pending: { text: 'Pendente', color: 'bg-yellow-100 text-yellow-800', icon: <Clock size={14} /> },
        changes_requested: { text: 'Correção', color: 'bg-red-100 text-red-800', icon: <XCircle size={14} /> },
        approved: { text: 'Aprovado', color: 'bg-green-100 text-green-800', icon: <CheckCircle size={14} /> },
    };

    const item = statusMap[status] || statusMap.draft;

    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${item.color}`}>
            {item.icon} {item.text}
        </span>
    );
} *

    'use client'

import { useState, useTransition } from 'react'
import { useFormStatus } from 'react-dom'
import { saveProject, deleteMyProject } from '@/app/(protected)/student/actions'
import { createClient } from '@/utils/supabase/client'
import { 
    Upload, FileText, CheckCircle, AlertTriangle, Lock, XCircle, 
    Trash2, GraduationCap, Save, Send, BookOpen, Clock, Target, Calendar, List
} from 'lucide-react'

// Define os tipos de dados do projeto (ATUALIZADO)
interface ProjectData {
    id?: string;
    mini_bio: string;
    dreams: string;
    // Novos campos
    action_plan_goal: string;
    action_plan_how: string;
    action_plan_deadline: string;
    
    life_project_url?: string;
    resume_url?: string;
    status: string;
}

function ActionButton({ label, actionName, icon: Icon, className }: { label: string; actionName: string; icon: React.ElementType; className: string }) {
  const { pending } = useFormStatus()
  
  return (
    <button 
      type="submit"
      name="action"
      value={actionName}
      disabled={pending}
      className={`py-3 px-6 rounded-lg font-bold transition-all flex items-center justify-center gap-2 ${className}`}
    >
      {pending ? <span className="animate-pulse">Processando...</span> : <><Icon size={20} /> {label}</>}
    </button>
  )
}

export default function ProjectSubmissionForm({ 
    initialData, 
    userId, 
    classroomInfo 
}: { 
    initialData: ProjectData | null; 
    userId: string; 
    classroomInfo: any; 
}) {
    const supabase = createClient();
    const [project, setProject] = useState<ProjectData>(initialData || {
        mini_bio: '',
        dreams: '',
        action_plan_goal: '',
        action_plan_how: '',
        action_plan_deadline: '',
        status: 'draft',
    } as ProjectData);
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | null, message: string | null }>({ type: null, message: null });
    const [isSaving, startTransition] = useTransition();

    const isSubmitted = project.status !== 'draft' && project.status !== 'changes_requested';

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'lifeProjectUrl' | 'resumeUrl') => {
        const file = e.target.files?.[0];
        if (!file) return;

        setFeedback({ type: 'success', message: `Enviando arquivo ${file.name}...` });
        
        const fileExt = file.name.split('.').pop();
        const filePath = `${userId}/${field}-${Math.random()}.${fileExt}`;
        
        // CORREÇÃO: Nome do bucket atualizado para 'project-files'
        const { error: uploadError } = await supabase.storage
            .from('project-files') 
            .upload(filePath, file);

        if (uploadError) {
            setFeedback({ type: 'error', message: `Erro no upload: ${uploadError.message}` });
            return;
        }

        const { data: { publicUrl } } = supabase.storage
            .from('project-files')
            .getPublicUrl(filePath);

        setProject(prev => ({ ...prev, [field]: publicUrl }));
        setFeedback({ type: 'success', message: `Arquivo carregado com sucesso!` });
    };

    const handleSubmit = (formData: FormData) => {
        setFeedback({ type: null, message: null });
        startTransition(async () => {
            const actionType = formData.get('action') as 'draft' | 'pending';
            formData.append('status', actionType);
            
            const result = await saveProject(formData); 

            if (result.error) {
                setFeedback({ type: 'error', message: result.error });
            } else {
                setFeedback({ type: 'success', message: actionType === 'pending' ? 'Projeto enviado para avaliação!' : 'Rascunho salvo com sucesso.' });
                setProject(prev => ({ ...prev, status: actionType }));
            }
        });
    };
    
    const handleDelete = async () => {
        if (!project.id || !confirm("Tem certeza que deseja DELETAR TODO o seu projeto e começar do zero?")) return;
        
        startTransition(async () => {
             const result = await deleteMyProject(project.id!);
             if (result.success) {
                // RESET TOTAL DO ESTADO LOCAL PARA LIMPAR A TELA IMEDIATAMENTE
                setProject({ 
                    mini_bio: '', 
                    dreams: '', 
                    action_plan_goal: '', 
                    action_plan_how: '', 
                    action_plan_deadline: '', 
                    status: 'draft',
                    life_project_url: undefined,
                    resume_url: undefined
                } as ProjectData);
                
                setFeedback({ type: 'success', message: "Projeto excluído! Você pode começar um novo." });
             } else {
                setFeedback({ type: 'error', message: result.error });
             }
        });
    }

    return (
        <form action={handleSubmit} className="space-y-8 bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <input type="hidden" name="projectId" value={project.id || ''} />
            <input type="hidden" name="userId" value={userId} />

            {/* Feedback Global * /}
            {feedback.message && (
                <div className={`p-4 rounded-lg font-medium ${feedback.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                    {feedback.message}
                </div>
            )}

            {/* Status Atual * /}
            <div className="flex items-center justify-between p-4 bg-gray-50 border rounded-lg">
                <p className="font-semibold text-gray-700 flex items-center gap-2">
                    <GraduationCap size={20} /> Status Atual:
                </p>
                <StatusBadge status={project.status} />
            </div>

            {/* 1. SEÇÃO DE TEXTO * /}
            <div className="space-y-6">
                <label className="text-xl font-bold text-gray-800 border-b pb-2 block">1. Detalhes Pessoais</label>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mini Biografia</label>
                    <textarea
                        name="miniBio"
                        rows={3}
                        value={project.mini_bio}
                        onChange={(e) => setProject(p => ({ ...p, mini_bio: e.target.value }))}
                        placeholder="Quem é você em poucas palavras?"
                        required
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Metas e Sonhos</label>
                    <textarea
                        name="dreams"
                        rows={3}
                        value={project.dreams}
                        onChange={(e) => setProject(p => ({ ...p, dreams: e.target.value }))}
                        placeholder="Seus maiores objetivos de vida..."
                        required
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500"
                    />
                </div>
            </div>

            {/* 2. SEÇÃO PLANO DE AÇÃO (NOVO) * /}
            <div className="space-y-6 bg-blue-50/50 p-6 rounded-xl border border-blue-100">
                <label className="text-xl font-bold text-blue-900 border-b border-blue-200 pb-2 block flex items-center gap-2">
                    <Target className="text-blue-600"/> 2. Plano de Ação
                </label>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Minha Meta Principal</label>
                    <input
                        name="actionPlanGoal"
                        type="text"
                        value={project.action_plan_goal || ''}
                        onChange={(e) => setProject(p => ({ ...p, action_plan_goal: e.target.value }))}
                        placeholder="Ex: Passar no vestibular de Medicina"
                        required
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Como vou fazer? (Estratégia)</label>
                    <textarea
                        name="actionPlanHow"
                        rows={3}
                        value={project.action_plan_how || ''}
                        onChange={(e) => setProject(p => ({ ...p, action_plan_how: e.target.value }))}
                        placeholder="Ex: Estudar 4h por dia, fazer simulados..."
                        required
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Prazo para alcançar</label>
                    <input
                        name="actionPlanDeadline"
                        type="text"
                        value={project.action_plan_deadline || ''}
                        onChange={(e) => setProject(p => ({ ...p, action_plan_deadline: e.target.value }))}
                        placeholder="Ex: Dezembro de 2025"
                        required
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500"
                    />
                </div>
            </div>

            {/* 3. SEÇÃO DE UPLOAD (ATUALIZADA) * /}
            <div className="space-y-6">
                <label className="text-xl font-bold text-gray-800 border-b pb-2 block">3. Anexos</label>

                <div className="p-4 border rounded-lg bg-gray-50">
                    <label className="block font-medium text-gray-700 mb-2">Projeto de Vida (PDF Completo)</label>
                    <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => handleFileUpload(e, 'lifeProjectUrl')}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    {project.life_project_url && (
                        <p className="mt-2 text-sm text-green-600 flex items-center gap-1 font-bold">
                            <CheckCircle size={16} /> Arquivo anexado com sucesso.
                        </p>
                    )}
                </div>

                <div className="p-4 border rounded-lg bg-gray-50">
                    <label className="block font-medium text-gray-700 mb-2">Currículo Profissional</label>
                    <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => handleFileUpload(e, 'resumeUrl')}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    {project.resume_url && (
                        <p className="mt-2 text-sm text-green-600 flex items-center gap-1 font-bold">
                            <CheckCircle size={16} /> Arquivo anexado com sucesso.
                        </p>
                    )}
                </div>
            </div>

            {/* 4. AÇÕES * /}
            <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                {project.id && (
                    <button 
                        type="button" 
                        onClick={handleDelete}
                        className="text-red-600 hover:text-red-800 text-sm flex items-center gap-1"
                        disabled={isSaving}
                    >
                        <Trash2 size={16} /> Excluir
                    </button>
                )}
                
                <div className="flex gap-4 ml-auto">
                    <ActionButton
                        label="Salvar Rascunho"
                        actionName="draft"
                        icon={Save}
                        className="bg-gray-200 text-gray-700 hover:bg-gray-300"
                    />
                    <ActionButton
                        label={isSubmitted ? "Re-enviar" : "Enviar para Avaliação"}
                        actionName="pending"
                        icon={Send}
                        className="bg-[#009B3A] text-white hover:bg-green-700"
                    />
                </div>
            </div>
        </form>
    );
}

function StatusBadge({ status }: { status: string }) {
    const statusMap: { [key: string]: { text: string; color: string; icon: React.ReactNode } } = {
        draft: { text: 'Rascunho', color: 'bg-gray-100 text-gray-600', icon: <BookOpen size={14} /> },
        pending: { text: 'Pendente', color: 'bg-yellow-100 text-yellow-800', icon: <Clock size={14} /> },
        changes_requested: { text: 'Correção', color: 'bg-red-100 text-red-800', icon: <XCircle size={14} /> },
        approved: { text: 'Aprovado', color: 'bg-green-100 text-green-800', icon: <CheckCircle size={14} /> },
    };
    const item = statusMap[status] || statusMap.draft;
    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${item.color}`}>
            {item.icon} {item.text}
        </span>
    );
}*/
'use client'

import { useState, useTransition, useEffect } from 'react'
import { useFormStatus } from 'react-dom'
import { saveProject, deleteMyProject } from '@/app/(protected)/student/actions'
import { createClient } from '@/utils/supabase/client'
import { 
    FileText, CheckCircle, AlertTriangle, 
    Trash2, GraduationCap, Save, Send, BookOpen, Clock, Target, Loader2, XCircle
} from 'lucide-react'

// Tipagem correta dos dados
interface ProjectData {
    id?: string;
    mini_bio: string;
    dreams: string;
    action_plan_goal: string;
    action_plan_how: string;
    action_plan_deadline: string;
    life_project_url?: string;
    resume_url?: string;
    status: string;
}

function ActionButton({ label, actionName, icon: Icon, className }: { label: string; actionName: string; icon: React.ElementType; className: string }) {
  const { pending } = useFormStatus()
  // Se for o botão de rascunho, não valida. Se for enviar, o form valida.
  return (
    <button 
      type="submit"
      name="action"
      value={actionName}
      disabled={pending}
      className={`py-3 px-6 rounded-lg font-bold transition-all flex items-center justify-center gap-2 ${className} disabled:opacity-50`}
    >
      {pending ? <span className="flex items-center gap-2"><Loader2 className="animate-spin" size={20}/> Processando...</span> : <><Icon size={20} /> {label}</>}
    </button>
  )
}

export default function ProjectSubmissionForm({ 
    initialData, 
    userId, 
    classroomInfo 
}: { 
    initialData: ProjectData | null; 
    userId: string; 
    classroomInfo: any; 
}) {
    const supabase = createClient();
    
    // Inicializa o estado com os dados do banco ou vazio
    const [project, setProject] = useState<ProjectData>(initialData || {
        mini_bio: '',
        dreams: '',
        action_plan_goal: '',
        action_plan_how: '',
        action_plan_deadline: '',
        status: 'draft',
        life_project_url: '',
        resume_url: ''
    } as ProjectData);
    
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | null, message: string | null }>({ type: null, message: null });
    const [uploading, setUploading] = useState<'life' | 'resume' | null>(null);
    const [isSaving, startTransition] = useTransition();

    // Atualiza estado se initialData mudar (ex: após salvar)
    useEffect(() => {
        if(initialData) {
            setProject(prev => ({...prev, ...initialData}));
        }
    }, [initialData]);

    const isSubmitted = project.status !== 'draft' && project.status !== 'changes_requested';

    // Aceitar PDF, Word (.doc e .docx)
    const acceptedFileTypes = ".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document";

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'life_project_url' | 'resume_url') => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(field === 'life_project_url' ? 'life' : 'resume');
        setFeedback({ type: null, message: null });
        
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${userId}/${field}-${Date.now()}.${fileExt}`;
            
            // 1. Upload
            const { error: uploadError } = await supabase.storage
                .from('project-files') 
                .upload(fileName, file, { upsert: true });

            if (uploadError) throw uploadError;

            // 2. URL Pública
            const { data: { publicUrl } } = supabase.storage
                .from('project-files')
                .getPublicUrl(fileName);

            // 3. Atualiza Estado (Isso reflete nos inputs hidden)
            setProject(prev => ({ ...prev, [field]: publicUrl }));
            setFeedback({ type: 'success', message: `${field === 'resume_url' ? 'Currículo' : 'Projeto'} anexado! Clique em Salvar.` });

        } catch (error: any) {
            console.error("Erro Upload:", error);
            setFeedback({ type: 'error', message: `Erro no upload: ${error.message}` });
        } finally {
            setUploading(null);
        }
    };

    const handleSubmit = (formData: FormData) => {
        const actionType = formData.get('action') as 'draft' | 'pending';
        
        // VALIDAÇÃO: Só exige arquivo se for ENVIAR (pending)
        if (actionType === 'pending') {
            if (!project.life_project_url && !project.resume_url) {
                setFeedback({ type: 'error', message: "Para enviar, anexe pelo menos o Projeto de Vida ou o Currículo." });
                return; // Para aqui se não tiver arquivo
            }
        }

        setFeedback({ type: null, message: null });
        
        startTransition(async () => {
            // Força o envio do status correto
            formData.set('status', actionType);
            
            // As URLs vão automaticamente pelos inputs hidden abaixo
            const result = await saveProject(formData); 

            if (result.error) {
                setFeedback({ type: 'error', message: result.error });
            } else {
                setFeedback({ type: 'success', message: actionType === 'pending' ? 'Projeto enviado para avaliação!' : 'Rascunho salvo com sucesso.' });
                // Atualiza status localmente
                setProject(prev => ({ ...prev, status: actionType }));
            }
        });
    };
    
    /*const handleDelete = async () => {
        if (!project.id || !confirm("Tem certeza que deseja DELETAR TODO o seu projeto?")) return;
        startTransition(async () => {
             const result = await deleteMyProject(project.id!);
             if (result.success) {
                setProject({ 
                    mini_bio: '', dreams: '', action_plan_goal: '', action_plan_how: '', action_plan_deadline: '', status: 'draft',
                    life_project_url: '', resume_url: ''
                } as ProjectData);
                setFeedback({ type: 'success', message: "Projeto excluído e resetado!" });
             } else {
                setFeedback({ type: 'error', message: result.error });
             }
        });
    }*/
   const handleDelete = async () => {
        if (!project.id || !confirm("Tem certeza que deseja DELETAR TODO o seu projeto?")) return;
        startTransition(async () => {
             const result = await deleteMyProject(project.id!);
             if (result.success) {
                setProject({ 
                    mini_bio: '', dreams: '', action_plan_goal: '', action_plan_how: '', action_plan_deadline: '', status: 'draft',
                    life_project_url: '', resume_url: ''
                } as ProjectData);
                setFeedback({ type: 'success', message: "Projeto excluído e resetado!" });
             } else {
                // CORREÇÃO APLICADA AQUI:
                setFeedback({ type: 'error', message: result.error || null });
             }
        });
    }

    return (
        <form action={handleSubmit} className="space-y-8 bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            
            <input type="hidden" name="projectId" value={project.id || ''} />
            <input type="hidden" name="userId" value={userId} />
            
            {/* === CRÍTICO: INPUTS OCULTOS COM NOMES EXATOS QUE A SERVER ACTION ESPERA === */}
            <input type="hidden" name="lifeProjectUrl" value={project.life_project_url || ''} />
            <input type="hidden" name="resumeUrl" value={project.resume_url || ''} />

            {/* Feedback Global */}
            {feedback.message && (
                <div className={`p-4 rounded-lg font-medium flex items-center gap-2 ${feedback.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                    {feedback.type === 'error' ? <AlertTriangle size={18}/> : <CheckCircle size={18}/>}
                    {feedback.message}
                </div>
            )}

            {/* Status Atual */}
            <div className="flex items-center justify-between p-4 bg-gray-50 border rounded-lg">
                <p className="font-semibold text-gray-700 flex items-center gap-2">
                    <GraduationCap size={20} /> Status Atual:
                </p>
                <StatusBadge status={project.status} />
            </div>

            {/* 1. SEÇÃO DE TEXTO */}
            <div className="space-y-6">
                <label className="text-xl font-bold text-gray-800 border-b pb-2 block">1. Detalhes Pessoais</label>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mini Biografia</label>
                    <textarea
                        name="miniBio"
                        rows={3}
                        value={project.mini_bio || ''}
                        onChange={(e) => setProject(p => ({ ...p, mini_bio: e.target.value }))}
                        placeholder="Quem é você em poucas palavras?"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Metas e Sonhos</label>
                    <textarea
                        name="dreams"
                        rows={3}
                        value={project.dreams || ''}
                        onChange={(e) => setProject(p => ({ ...p, dreams: e.target.value }))}
                        placeholder="Seus maiores objetivos de vida..."
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500"
                    />
                </div>
            </div>

            {/* 2. SEÇÃO PLANO DE AÇÃO */}
            <div className="space-y-6 bg-blue-50/50 p-6 rounded-xl border border-blue-100">
                <label className="text-xl font-bold text-blue-900 border-b border-blue-200 pb-2 block flex items-center gap-2">
                    <Target className="text-blue-600"/> 2. Plano de Ação
                </label>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Minha Meta Principal</label>
                    <input
                        name="actionPlanGoal"
                        type="text"
                        value={project.action_plan_goal || ''}
                        onChange={(e) => setProject(p => ({ ...p, action_plan_goal: e.target.value }))}
                        placeholder="Ex: Passar no vestibular..."
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Como vou fazer? (Estratégia)</label>
                    <textarea
                        name="actionPlanHow"
                        rows={3}
                        value={project.action_plan_how || ''}
                        onChange={(e) => setProject(p => ({ ...p, action_plan_how: e.target.value }))}
                        placeholder="Ex: Estudar 4h por dia..."
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Prazo</label>
                    <input
                        name="actionPlanDeadline"
                        type="text"
                        value={project.action_plan_deadline || ''}
                        onChange={(e) => setProject(p => ({ ...p, action_plan_deadline: e.target.value }))}
                        placeholder="Ex: Dezembro de 2025"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500"
                    />
                </div>
            </div>

            {/* 3. SEÇÃO DE UPLOAD */}
            <div className="space-y-6">
                <label className="text-xl font-bold text-gray-800 border-b pb-2 block">3. Anexos</label>

                {/* Upload Projeto */}
                <div className={`p-4 border rounded-lg transition-colors ${project.life_project_url ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                    <label className="block font-medium text-gray-700 mb-2">Projeto de Vida (.pdf, .doc, .docx)</label>
                    
                    <div className="flex items-center gap-4">
                        <input
                            type="file"
                            accept={acceptedFileTypes}
                            onChange={(e) => handleFileUpload(e, 'life_project_url')} // Nome da chave do estado
                            disabled={!!uploading}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                        {uploading === 'life' && <Loader2 className="animate-spin text-blue-600" size={20} />}
                    </div>

                    {project.life_project_url && (
                        <div className="mt-3 text-sm text-green-700 font-bold flex items-center gap-2">
                            <CheckCircle size={16} /> 
                            Arquivo anexado. 
                            <a href={project.life_project_url} target="_blank" rel="noopener noreferrer" className="underline hover:text-green-900">Visualizar</a>
                        </div>
                    )}
                </div>

                {/* Upload Currículo */}
                <div className={`p-4 border rounded-lg transition-colors ${project.resume_url ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                    <label className="block font-medium text-gray-700 mb-2">Currículo (.pdf, .doc, .docx)</label>
                    
                    <div className="flex items-center gap-4">
                        <input
                            type="file"
                            accept={acceptedFileTypes}
                            onChange={(e) => handleFileUpload(e, 'resume_url')} // Nome da chave do estado
                            disabled={!!uploading}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                        {uploading === 'resume' && <Loader2 className="animate-spin text-blue-600" size={20} />}
                    </div>

                    {project.resume_url && (
                        <div className="mt-3 text-sm text-green-700 font-bold flex items-center gap-2">
                            <CheckCircle size={16} /> 
                            Arquivo anexado. 
                            <a href={project.resume_url} target="_blank" rel="noopener noreferrer" className="underline hover:text-green-900">Visualizar</a>
                        </div>
                    )}
                </div>
            </div>

            {/* 4. AÇÕES */}
            <div className="flex flex-col sm:flex-row justify-between items-center pt-6 border-t border-gray-100 gap-4">
                {project.id && (
                    <button 
                        type="button" 
                        onClick={handleDelete}
                        className="text-red-600 hover:text-red-800 text-sm flex items-center gap-1 px-4 py-2 hover:bg-red-50 rounded-lg transition-colors"
                        disabled={isSaving}
                    >
                        <Trash2 size={16} /> Excluir Projeto
                    </button>
                )}
                
                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                    <ActionButton
                        label="Salvar Rascunho"
                        actionName="draft"
                        icon={Save}
                        className="bg-gray-100 text-gray-700 hover:bg-gray-200 w-full sm:w-auto"
                    />
                    <ActionButton
                        label={isSubmitted ? "Re-enviar" : "Enviar para Avaliação"}
                        actionName="pending"
                        icon={Send}
                        className="bg-[#009B3A] text-white hover:bg-green-700 w-full sm:w-auto"
                    />
                </div>
            </div>
        </form>
    );
}

function StatusBadge({ status }: { status: string }) {
    const statusMap: { [key: string]: { text: string; color: string; icon: React.ReactNode } } = {
        draft: { text: 'Rascunho', color: 'bg-gray-100 text-gray-600', icon: <BookOpen size={14} /> },
        pending: { text: 'Pendente', color: 'bg-yellow-100 text-yellow-800', icon: <Clock size={14} /> },
        changes_requested: { text: 'Correção', color: 'bg-red-100 text-red-800', icon: <XCircle size={14} /> },
        approved: { text: 'Aprovado', color: 'bg-green-100 text-green-800', icon: <CheckCircle size={14} /> },
    };
    const item = statusMap[status] || statusMap.draft;
    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${item.color}`}>
            {item.icon} {item.text}
        </span>
    );
}