/*'use client'

import { useState } from 'react'
import { FileText, User, Users, Trash2, ChevronDown, ChevronUp, Plus, AlertTriangle } from 'lucide-react'
import { createClassroom, deleteClassroom } from '../classes/actions'
import { deleteStudentProject } from '../actions'
import TeacherActionButtons from './TeacherActionButtons'
import { useRouter } from 'next/navigation'

export default function TeacherContent({ submissions, classrooms, studentsByClass }: any) {
  const [activeTab, setActiveTab] = useState<'submissions' | 'classes'>('submissions')
  const [expandedClass, setExpandedClass] = useState<string | null>(null)
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  // Deletar Projeto
  const handleDeleteProject = async (id: string) => {
    if (!confirm("ATENÇÃO: Isso apagará permanentemente o projeto e os arquivos deste aluno. Continuar?")) return
    setLoading(true)
    const res = await deleteStudentProject(id)
    if (res?.error) alert(res.error)
    else router.refresh()
    setLoading(false)
  }

  // Deletar Turma
  const handleDeleteClass = async (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation()
    if (!confirm(`Deseja excluir a turma "${name}"?`)) return
    
    setLoading(true)
    const res = await deleteClassroom(id)
    if (res?.error) alert(res.error)
    else {
      alert(res.success)
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <div>
      {loading && (
        <div className="fixed inset-0 bg-white/50 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-white p-4 rounded-lg shadow-lg flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="font-bold text-gray-700">Processando...</span>
          </div>
        </div>
      )}

      {/* ABAS /* /}
      <div className="flex gap-4 mb-8 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('submissions')}
          className={`pb-4 px-4 font-bold flex items-center gap-2 transition-colors ${
            activeTab === 'submissions' ? 'text-[#009B3A] border-b-4 border-[#009B3A]' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <FileText size={20} /> Avaliações ({submissions.length})
        </button>
        <button
          onClick={() => setActiveTab('classes')}
          className={`pb-4 px-4 font-bold flex items-center gap-2 transition-colors ${
            activeTab === 'classes' ? 'text-[#009B3A] border-b-4 border-[#009B3A]' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <Users size={20} /> Minhas Turmas ({classrooms.length})
        </button>
      </div>

      {/* ABA 1: PROJETOS RECEBIDOS /* /}
      {activeTab === 'submissions' && (
        <div className="grid grid-cols-1 gap-6">
          {submissions.length === 0 && (
             <div className="text-center py-12 bg-white rounded-xl shadow border border-gray-100"><p className="text-gray-400">Nenhum projeto pendente.</p></div>
          )}
          {submissions.map((sub: any) => (
            <div key={sub.id} className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden flex flex-col md:flex-row relative group">
              <button onClick={() => handleDeleteProject(sub.id)} className="absolute top-4 right-4 p-2 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-full transition-all z-10" title="Excluir Projeto">
                <Trash2 size={20} />
              </button>
              <div className={`w-full md:w-2 bg-gray-200 ${sub.status === 'submitted' ? 'bg-blue-500' : ''} ${sub.status === 'approved' ? 'bg-green-500' : ''} ${sub.status === 'changes_requested' ? 'bg-yellow-500' : ''}`}></div>
              <div className="p-6 flex-1">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500"><User size={20} /></div>
                  <div>
                    <h3 className="font-bold text-lg text-[#2C3E50]">{sub.profiles?.full_name}</h3>
                    <p className="text-sm text-gray-500">{sub.profiles?.school_name}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 my-4 bg-gray-50 p-4 rounded-lg">
                    <div><span className="font-bold block text-gray-800">Bio:</span> {sub.mini_bio}</div>
                    <div><span className="font-bold block text-gray-800">Sonhos:</span> {sub.dreams}</div>
                </div>
                <div className="flex gap-4 mb-4">
                  {sub.signedLifeUrl && <a href={sub.signedLifeUrl} target="_blank" className="text-[#009B3A] text-sm underline font-bold flex items-center gap-1"><FileText size={16}/> Projeto de Vida</a>}
                  {sub.signedResumeUrl && <a href={sub.signedResumeUrl} target="_blank" className="text-[#009B3A] text-sm underline font-bold flex items-center gap-1"><FileText size={16}/> Currículo</a>}
                </div>
                <div className="pt-4 border-t border-gray-100">
                  <TeacherActionButtons projectId={sub.id} currentStatus={sub.status} currentFeedback={sub.teacher_feedback} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ABA 2: TURMAS (Com lista atualizada) /* /}
      {activeTab === 'classes' && (
        <div className="space-y-8">
          
          {/* Formulário Criar /* /}
          <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
            <h3 className="font-bold text-blue-900 mb-4 flex items-center gap-2"><Plus size={20}/> Criar Nova Turma</h3>
            <form action={createClassroom} className="flex flex-col md:flex-row gap-4">
              <input name="name" placeholder="Nome (Ex: 3º Ano A)" required className="flex-1 p-3 rounded-lg border border-blue-200" />
              <input name="schoolName" placeholder="Escola" required className="flex-1 p-3 rounded-lg border border-blue-200" />
              <button type="submit" className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700">Criar</button>
            </form>
          </div>

          <div className="space-y-4">
            {classrooms.map((cls: any) => {
              const students = studentsByClass[cls.id] || []
              const isExpanded = expandedClass === cls.id
              
              return (
                <div key={cls.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                  <div 
                    onClick={() => setExpandedClass(isExpanded ? null : cls.id)} 
                    className="w-full flex items-center justify-between p-6 bg-white hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <div><h4 className="font-bold text-lg text-[#2C3E50]">{cls.name}</h4><p className="text-sm text-gray-500">{cls.school_name} • {students.length} alunos</p></div>
                    <div className="flex items-center gap-6">
                      <div className="hidden md:block text-right mr-4"><span className="text-xs text-gray-400 uppercase font-bold">Código</span><p className="text-xl font-mono font-bold text-blue-600 tracking-wider">{cls.code}</p></div>
                      <button onClick={(e) => handleDeleteClass(e, cls.id, cls.name)} className="p-2 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-full transition-all" title="Excluir Turma"><Trash2 size={20} /></button>
                      {isExpanded ? <ChevronUp className="text-gray-400" /> : <ChevronDown className="text-gray-400" />}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="bg-gray-50 p-6 border-t border-gray-100 animate-in slide-in-from-top-2">
                      <h5 className="font-bold text-gray-700 mb-4 text-sm uppercase">Lista de Chamada</h5>
                      
                      {students.length === 0 ? (
                        <p className="text-gray-400 italic text-sm">Nenhum aluno entrou nesta turma ainda.</p>
                      ) : (
                        <div className="flex flex-col gap-3">
                          {students.map((st: any) => (
                            <div key={st.id} className="bg-white p-4 rounded-lg border border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                              
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm shrink-0">{st.full_name.charAt(0)}</div>
                                <p className="font-bold text-gray-700">{st.full_name}</p>
                              </div>

                              <div className="flex items-center gap-3">
                                {st.hasProject ? (
                                  <>
                                    {st.lifeUrl ? (
                                      <a href={st.lifeUrl} target="_blank" className="flex items-center gap-2 px-3 py-2 bg-green-50 text-green-700 hover:bg-green-100 rounded-md text-xs font-bold transition-colors border border-green-200"><FileText size={16} /> Projeto</a>
                                    ) : <span className="text-xs text-gray-400 px-2">Sem Projeto</span>}

                                    {st.resumeUrl ? (
                                      <a href={st.resumeUrl} target="_blank" className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-md text-xs font-bold transition-colors border border-blue-200"><FileText size={16} /> Currículo</a>
                                    ) : <span className="text-xs text-gray-400 px-2">Sem Currículo</span>}
                                  </>
                                ) : (
                                  <span className="text-xs font-medium text-orange-500 bg-orange-50 px-3 py-1 rounded-full border border-orange-100">Pendente</span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}*
'use client'

import { useState } from 'react'
import { FileText, User, Users, Trash2, ChevronDown, ChevronUp, Plus, AlertTriangle } from 'lucide-react'
// Certifique-se de que o nome da função aqui corresponde ao exportado em classes/actions.ts (createClassroom ou createClass)
import { createClassroom, deleteClassroom } from '../classes/actions'
import { deleteStudentProject } from '../actions'
import TeacherActionButtons from './TeacherActionButtons'
import { useRouter } from 'next/navigation'

export default function TeacherContent({ submissions, classrooms, studentsByClass }: any) {
  const [activeTab, setActiveTab] = useState<'submissions' | 'classes'>('submissions')
  const [expandedClass, setExpandedClass] = useState<string | null>(null)
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  // ----------------------------------------------------
  // HANDLERS
  // ----------------------------------------------------

  // Deletar Projeto
  const handleDeleteProject = async (id: string) => {
    if (!confirm("ATENÇÃO: Isso apagará permanentemente o projeto e os arquivos deste aluno. Continuar?")) return
    setLoading(true)
    const res = await deleteStudentProject(id)
    if (res?.error) alert(res.error)
    else router.refresh()
    setLoading(false)
  }

  // Deletar Turma
  const handleDeleteClass = async (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation() // Impede que o clique expanda/colapse a turma
    if (!confirm(`Deseja excluir a turma "${name}"? Todos os alunos serão desvinculados.`)) return
    
    setLoading(true)
    const res = await deleteClassroom(id)
    if (res?.error) alert(res.error)
    else {
      alert(res.success)
      router.refresh()
    }
    setLoading(false)
  }

  // Toggle do Acordeão
  const toggleClassExpand = (id: string) => {
    setExpandedClass(expandedClass === id ? null : id)
  }

  // ----------------------------------------------------
  // RENDERIZAÇÃO
  // ----------------------------------------------------

  return (
    <div>
      {/* LOADING OVERLAY * /}
      {loading && (
        <div className="fixed inset-0 bg-white/50 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-white p-4 rounded-lg shadow-lg flex items-center gap-3 border border-gray-200">
            <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="font-bold text-gray-700">Processando...</span>
          </div>
        </div>
      )}

      {/* ABAS RESPONSIVAS * /}
      <div className="flex flex-wrap gap-2 sm:gap-4 mb-8 border-b border-gray-200 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('submissions')}
          className={`pb-3 px-4 font-bold flex items-center gap-2 transition-colors whitespace-nowrap ${
            activeTab === 'submissions' ? 'text-[#009B3A] border-b-4 border-[#009B3A]' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <FileText size={20} /> Avaliações ({submissions.length})
        </button>
        <button
          onClick={() => setActiveTab('classes')}
          className={`pb-3 px-4 font-bold flex items-center gap-2 transition-colors whitespace-nowrap ${
            activeTab === 'classes' ? 'text-[#009B3A] border-b-4 border-[#009B3A]' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <Users size={20} /> Minhas Turmas ({classrooms.length})
        </button>
      </div>

      {/* -------------------------------------------------------- * /}
      {/* CONTEÚDO DA ABA: PROJETOS (SUBMISSIONS) * /}
      {/* -------------------------------------------------------- * /}
      {activeTab === 'submissions' && (
        <div className="grid grid-cols-1 gap-6">
          {submissions.length === 0 && (
             <div className="text-center py-12 bg-white rounded-xl shadow border border-gray-100">
                <p className="text-gray-400 flex flex-col items-center gap-2">
                    <FileText size={40} className="opacity-20"/>
                    Nenhum projeto pendente de avaliação.
                </p>
             </div>
          )}
          
          {submissions.map((sub: any) => (
            <div key={sub.id} className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden flex flex-col md:flex-row relative group transition-all hover:shadow-xl">
              
              {/* Botão de Excluir (Canto Superior) * /}
              <button 
                onClick={() => handleDeleteProject(sub.id)} 
                className="absolute top-4 right-4 p-2 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-full transition-all z-10" 
                title="Excluir Projeto"
              >
                <Trash2 size={20} />
              </button>

              {/* Barra Lateral de Status * /}
              <div className={`w-full md:w-3 h-2 md:h-auto 
                ${sub.status === 'submitted' || sub.status === 'pending' ? 'bg-yellow-500' : ''} 
                ${sub.status === 'approved' ? 'bg-[#009B3A]' : ''} 
                ${sub.status === 'changes_requested' ? 'bg-orange-500' : ''}
                ${sub.status === 'draft' ? 'bg-gray-300' : ''}
              `}></div>

              <div className="p-6 flex-1">
                {/* Cabeçalho do Card * /}
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 shrink-0 font-bold text-lg">
                    {sub.profiles?.full_name?.charAt(0) || <User size={24} />}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-[#2C3E50]">{sub.profiles?.full_name}</h3>
                    <p className="text-sm text-gray-500">{sub.profiles?.school_name}</p>
                    <span className="text-xs font-mono text-gray-400 mt-1 block">Enviado em: {new Date(sub.updated_at).toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>

                {/* Resumo do Projeto * /}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 my-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <div>
                        <span className="font-bold block text-gray-800 mb-1 uppercase text-xs tracking-wider">Mini Bio:</span> 
                        <p className="italic">"{sub.mini_bio}"</p>
                    </div>
                    <div>
                        <span className="font-bold block text-gray-800 mb-1 uppercase text-xs tracking-wider">Sonhos:</span> 
                        <p className="italic">"{sub.dreams}"</p>
                    </div>
                </div>

                {/* Links de Arquivos * /}
                <div className="flex flex-wrap gap-4 mb-6">
                  {sub.signedLifeUrl ? (
                    <a href={sub.signedLifeUrl} target="_blank" className="text-[#009B3A] text-sm font-bold flex items-center gap-1 hover:underline bg-green-50 px-3 py-2 rounded-lg border border-green-100">
                        <FileText size={16}/> Ver Projeto de Vida
                    </a>
                  ) : <span className="text-gray-400 text-xs flex items-center gap-1"><AlertTriangle size={12}/> Sem Projeto</span>}

                  {sub.signedResumeUrl ? (
                    <a href={sub.signedResumeUrl} target="_blank" className="text-blue-600 text-sm font-bold flex items-center gap-1 hover:underline bg-blue-50 px-3 py-2 rounded-lg border border-blue-100">
                        <FileText size={16}/> Ver Currículo
                    </a>
                  ) : <span className="text-gray-400 text-xs flex items-center gap-1"><AlertTriangle size={12}/> Sem Currículo</span>}
                </div>

                {/* Ações do Professor * /}
                <div className="pt-4 border-t border-gray-100">
                  <TeacherActionButtons 
                    projectId={sub.id} 
                    currentStatus={sub.status} 
                    currentFeedback={sub.teacher_feedback} 
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* -------------------------------------------------------- * / }
      {/* CONTEÚDO DA ABA: TURMAS (CLASSES) * /}
      {/* -------------------------------------------------------- * /}
      {activeTab === 'classes' && (
        <div className="space-y-8">
          
          {/* Formulário Criar Turma (Responsivo) * /}
          <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
            <h3 className="font-bold text-blue-900 mb-4 flex items-center gap-2"><Plus size={20}/> Criar Nova Turma</h3>
            <form action={createClassroom} className="flex flex-col md:flex-row gap-4">
              <input name="name" placeholder="Nome (Ex: 3º Ano A)" required className="flex-1 p-3 rounded-lg border border-blue-200 outline-none focus:ring-2 focus:ring-blue-400" />
              <input name="schoolName" placeholder="Escola" required className="flex-1 p-3 rounded-lg border border-blue-200 outline-none focus:ring-2 focus:ring-blue-400" />
              <button type="submit" className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 shadow-md transition-all active:scale-95">Criar</button>
            </form>
          </div>

          <div className="space-y-4">
            {classrooms.length === 0 && (
                <p className="text-center text-gray-500 py-8">Nenhuma turma criada ainda.</p>
            )}

            {classrooms.map((cls: any) => {
              const students = studentsByClass[cls.id] || []
              const isExpanded = expandedClass === cls.id
              
              return (
                <div key={cls.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  
                  {/* CABEÇALHO DA TURMA (Clickable DIV, não Button) * /}
                  <div 
                    onClick={() => toggleClassExpand(cls.id)} 
                    className="w-full flex flex-col sm:flex-row sm:items-center justify-between p-6 bg-white hover:bg-gray-50 transition-colors cursor-pointer gap-4"
                  >
                    <div>
                        <h4 className="font-bold text-lg text-[#2C3E50] flex items-center gap-2">
                            {cls.name}
                            <span className="text-xs font-normal bg-gray-100 px-2 py-1 rounded text-gray-500 border border-gray-200">{students.length} alunos</span>
                        </h4>
                        <p className="text-sm text-gray-500">{cls.school_name}</p>
                    </div>
                    
                    <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                      <div className="text-left sm:text-right">
                        <span className="text-xs text-gray-400 uppercase font-bold block">Código de Acesso</span>
                        <p className="text-xl font-mono font-bold text-[#009B3A] tracking-wider bg-green-50 px-2 rounded">{cls.code}</p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                          <button 
                            onClick={(e) => handleDeleteClass(e, cls.id, cls.name)} 
                            className="p-2 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-full transition-all" 
                            title="Excluir Turma"
                          >
                            <Trash2 size={20} />
                          </button>
                          {isExpanded ? <ChevronUp className="text-gray-400" /> : <ChevronDown className="text-gray-400" />}
                      </div>
                    </div>
                  </div>

                  {/* LISTA DE ALUNOS (Expandida) * /}
                  {isExpanded && (
                    <div className="bg-gray-50 p-4 sm:p-6 border-t border-gray-100 animate-in slide-in-from-top-2">
                      <h5 className="font-bold text-gray-700 mb-4 text-sm uppercase flex items-center gap-2">
                        <Users size={16}/> Lista de Chamada
                      </h5>
                      
                      {students.length === 0 ? (
                        <p className="text-gray-400 italic text-sm text-center py-2">Nenhum aluno entrou nesta turma ainda.</p>
                      ) : (
                        <div className="flex flex-col gap-3">
                          {students.map((st: any) => (
                            <div key={st.id} className="bg-white p-4 rounded-lg border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                              
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm shrink-0 uppercase">
                                    {st.full_name.charAt(0)}
                                </div>
                                <div>
                                    <p className="font-bold text-gray-700 text-sm">{st.full_name}</p>
                                    <p className="text-xs text-gray-400">{st.email}</p>
                                </div>
                              </div>

                              <div className="flex items-center gap-3 self-end sm:self-auto">
                                {st.hasProject ? (
                                  <>
                                    {st.lifeUrl ? (
                                      <a href={st.lifeUrl} target="_blank" className="flex items-center gap-2 px-3 py-2 bg-green-50 text-green-700 hover:bg-green-100 rounded-md text-xs font-bold transition-colors border border-green-200">
                                        <FileText size={14} /> Projeto
                                      </a>
                                    ) : <span className="text-xs text-gray-400 px-2 opacity-50">S/ Projeto</span>}

                                    {st.resumeUrl ? (
                                      <a href={st.resumeUrl} target="_blank" className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-md text-xs font-bold transition-colors border border-blue-200">
                                        <FileText size={14} /> Currículo
                                      </a>
                                    ) : <span className="text-xs text-gray-400 px-2 opacity-50">S/ Currículo</span>}
                                  </>
                                ) : (
                                  <span className="text-xs font-medium text-orange-500 bg-orange-50 px-3 py-1 rounded-full border border-orange-100">
                                    Pendente
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
} */
'use client'

import { useState } from 'react'
import { FileText, Users, Trash2, ChevronDown, ChevronUp, Plus, Target, Calendar, CheckCircle, XCircle, Clock, AlertTriangle, BookOpen } from 'lucide-react'
import { createClassroom, deleteClassroom } from '../classes/actions'
import { deleteStudentProject } from '../actions'
import TeacherActionButtons from './TeacherActionButtons'
import { useRouter } from 'next/navigation'

export default function TeacherContent({ submissions, classrooms, studentsByClass }: any) {
  const [activeTab, setActiveTab] = useState<'submissions' | 'classes'>('submissions')
  const [expandedClass, setExpandedClass] = useState<string | null>(null)
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleDeleteProject = async (id: string) => {
    if (!confirm("ATENÇÃO: Isso apagará permanentemente o projeto. Continuar?")) return
    setLoading(true)
    const res = await deleteStudentProject(id)
    if (res?.error) alert(res.error)
    else router.refresh()
    setLoading(false)
  }

  const handleDeleteClass = async (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation() 
    if (!confirm(`Deseja excluir a turma "${name}"?`)) return
    
    setLoading(true)
    const res = await deleteClassroom(id)
    if (res?.error) alert(res.error)
    else {
      alert(res.success)
      router.refresh()
    }
    setLoading(false)
  }

  const toggleClassExpand = (id: string) => {
    setExpandedClass(expandedClass === id ? null : id)
  }

  // --- BADGE DE STATUS DA LISTA DE CHAMADA ---
  const renderStatusBadge = (hasProject: boolean, status: string) => {
    if (!hasProject) {
        return <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2 py-1 rounded-full border border-gray-200">Não Iniciado</span>;
    }

    switch (status) {
        case 'approved':
            return (
                <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-1 rounded-full border border-green-200 flex items-center gap-1">
                    <CheckCircle size={12}/> Aprovado
                </span>
            );
        case 'rejected':
            return (
                <span className="text-xs font-bold text-red-700 bg-red-100 px-2 py-1 rounded-full border border-red-200 flex items-center gap-1">
                    <XCircle size={12}/> Reprovado
                </span>
            );
        case 'changes_requested':
            return (
                <span className="text-xs font-bold text-orange-700 bg-orange-100 px-2 py-1 rounded-full border border-orange-200 flex items-center gap-1">
                    <AlertTriangle size={12}/> Em Correção
                </span>
            );
        case 'pending':
            return (
                <span className="text-xs font-bold text-blue-700 bg-blue-100 px-2 py-1 rounded-full border border-blue-200 flex items-center gap-1">
                    <Clock size={12}/> Em Análise
                </span>
            );
        default: // draft ou unknown
            return (
                <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full border border-gray-200 flex items-center gap-1">
                    <BookOpen size={12}/> Rascunho
                </span>
            );
    }
  }

  return (
    <div>
      {loading && (
        <div className="fixed inset-0 bg-white/50 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-white p-4 rounded-lg shadow-lg flex items-center gap-3 border border-gray-200">
            <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="font-bold text-gray-700">Processando...</span>
          </div>
        </div>
      )}

      {/* ABAS */}
      <div className="flex flex-wrap gap-2 sm:gap-4 mb-8 border-b border-gray-200 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('submissions')}
          className={`pb-3 px-4 font-bold flex items-center gap-2 transition-colors whitespace-nowrap ${
            activeTab === 'submissions' ? 'text-[#009B3A] border-b-4 border-[#009B3A]' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <FileText size={20} /> Avaliações ({submissions.length})
        </button>
        <button
          onClick={() => setActiveTab('classes')}
          className={`pb-3 px-4 font-bold flex items-center gap-2 transition-colors whitespace-nowrap ${
            activeTab === 'classes' ? 'text-[#009B3A] border-b-4 border-[#009B3A]' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <Users size={20} /> Minhas Turmas ({classrooms.length})
        </button>
      </div>

      {/* ABA 1: FEED DE AVALIAÇÕES */}
      {activeTab === 'submissions' && (
        <div className="grid grid-cols-1 gap-6">
          {submissions.length === 0 && (
             <div className="text-center py-12 bg-white rounded-xl shadow border border-gray-100">
                <p className="text-gray-400 flex flex-col items-center gap-2">
                    <FileText size={40} className="opacity-20"/>
                    Nenhum projeto pendente de avaliação.
                </p>
             </div>
          )}
          
          {submissions.map((sub: any) => (
            <div key={sub.id} className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden flex flex-col md:flex-row relative group hover:shadow-xl transition-all">
              
              <button onClick={() => handleDeleteProject(sub.id)} className="absolute top-4 right-4 p-2 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-full transition-all z-10" title="Excluir"><Trash2 size={20} /></button>

              <div className={`w-full md:w-3 h-2 md:h-auto 
                ${sub.status === 'approved' ? 'bg-[#009B3A]' : ''} 
                ${sub.status === 'rejected' ? 'bg-red-600' : ''}
                ${sub.status === 'changes_requested' ? 'bg-orange-500' : ''}
                ${sub.status === 'pending' ? 'bg-blue-500' : ''}
              `}></div>

              <div className="p-6 flex-1">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 shrink-0 font-bold text-lg uppercase">{sub.profiles?.full_name?.charAt(0)}</div>
                  <div>
                    <h3 className="font-bold text-lg text-[#2C3E50]">{sub.profiles?.full_name}</h3>
                    <p className="text-sm text-gray-500">{sub.profiles?.school_name}</p>
                    <span className="text-xs font-mono text-gray-400 mt-1 block">Enviado em: {new Date(sub.updated_at).toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 mb-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <div><span className="font-bold block text-gray-800 mb-1 uppercase text-xs tracking-wider">Mini Bio:</span><p className="italic">"{sub.mini_bio}"</p></div>
                    <div><span className="font-bold block text-gray-800 mb-1 uppercase text-xs tracking-wider">Sonhos:</span><p className="italic">"{sub.dreams}"</p></div>
                </div>

                <div className="mb-6 bg-blue-50 p-4 rounded-lg border border-blue-100 text-sm">
                    <h4 className="font-bold text-blue-900 mb-3 flex items-center gap-2 border-b border-blue-200 pb-2"><Target size={16}/> Plano de Ação</h4>
                    <div className="space-y-3">
                        <div><span className="font-bold text-gray-700 block text-xs uppercase">Meta:</span><p className="text-gray-800">{sub.action_plan_goal || 'Não informado'}</p></div>
                        <div><span className="font-bold text-gray-700 block text-xs uppercase">Estratégia (Como):</span><p className="text-gray-800">{sub.action_plan_how || 'Não informado'}</p></div>
                        <div><span className="font-bold text-gray-700 block text-xs uppercase">Prazo:</span><p className="text-gray-800 flex items-center gap-1"><Calendar size={12}/> {sub.action_plan_deadline || 'Não informado'}</p></div>
                    </div>
                </div>

                <div className="flex flex-wrap gap-4 mb-6">
                  {sub.signedLifeUrl ? (<a href={sub.signedLifeUrl} target="_blank" className="text-[#009B3A] text-sm font-bold flex items-center gap-1 hover:underline bg-green-50 px-3 py-2 rounded-lg border border-green-100"><FileText size={16}/> Projeto (PDF)</a>) : <span className="text-gray-400 text-xs flex items-center gap-1 opacity-50"><AlertTriangle size={12}/> Sem Projeto</span>}
                  {sub.signedResumeUrl ? (<a href={sub.signedResumeUrl} target="_blank" className="text-blue-600 text-sm font-bold flex items-center gap-1 hover:underline bg-blue-50 px-3 py-2 rounded-lg border border-blue-100"><FileText size={16}/> Currículo (PDF)</a>) : <span className="text-gray-400 text-xs flex items-center gap-1 opacity-50"><AlertTriangle size={12}/> Sem Currículo</span>}
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <TeacherActionButtons projectId={sub.id} currentStatus={sub.status} currentFeedback={sub.teacher_feedback} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ABA 2: MINHAS TURMAS (Com Status Detalhado) */}
      {activeTab === 'classes' && (
        <div className="space-y-8">
          <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
            <h3 className="font-bold text-blue-900 mb-4 flex items-center gap-2"><Plus size={20}/> Criar Nova Turma</h3>
            <form action={createClassroom} className="flex flex-col md:flex-row gap-4">
              <input name="name" placeholder="Nome (Ex: 3º Ano A)" required className="flex-1 p-3 rounded-lg border border-blue-200 outline-none focus:ring-2 focus:ring-blue-400" />
              <input name="schoolName" placeholder="Escola" required className="flex-1 p-3 rounded-lg border border-blue-200 outline-none focus:ring-2 focus:ring-blue-400" />
              <button type="submit" className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 shadow-md">Criar</button>
            </form>
          </div>

          <div className="space-y-4">
             {classrooms.map((cls: any) => {
              const students = studentsByClass[cls.id] || []
              const isExpanded = expandedClass === cls.id
              return (
                <div key={cls.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <div onClick={() => toggleClassExpand(cls.id)} className="w-full flex flex-col sm:flex-row sm:items-center justify-between p-6 bg-white hover:bg-gray-50 transition-colors cursor-pointer gap-4">
                    <div>
                        <h4 className="font-bold text-lg text-[#2C3E50] flex items-center gap-2">
                            {cls.name}
                            <span className="text-xs font-normal bg-gray-100 px-2 py-1 rounded text-gray-500 border border-gray-200">{students.length} alunos</span>
                        </h4>
                        <p className="text-sm text-gray-500">{cls.school_name}</p>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                      <div className="text-left sm:text-right">
                        <span className="text-xs text-gray-400 uppercase font-bold block">Código</span>
                        <p className="text-xl font-mono font-bold text-[#009B3A] tracking-wider bg-green-50 px-2 rounded">{cls.code}</p>
                      </div>
                      <div className="flex items-center gap-2">
                          <button onClick={(e) => handleDeleteClass(e, cls.id, cls.name)} className="p-2 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-full transition-all"><Trash2 size={20} /></button>
                          {isExpanded ? <ChevronUp className="text-gray-400" /> : <ChevronDown className="text-gray-400" />}
                      </div>
                    </div>
                  </div>
                  
                  {isExpanded && (
                    <div className="bg-gray-50 p-4 sm:p-6 border-t border-gray-100 animate-in slide-in-from-top-2">
                       <div className="flex flex-col gap-3">
                          {students.length === 0 && <p className="text-gray-400 italic text-sm text-center">Nenhum aluno entrou nesta turma ainda.</p>}
                          
                          {students.map((st: any) => (
                             <div key={st.id} className="bg-white p-3 rounded-lg border border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-3">
                                <div className="flex items-center gap-3 w-full sm:w-auto">
                                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs uppercase shrink-0">
                                        {st.full_name.charAt(0)}
                                    </div>
                                    <span className="font-bold text-gray-700 text-sm truncate">{st.full_name}</span>
                                </div>
                                {/* O STATUS AGORA SERÁ RENDERIZADO AQUI COM A COR CORRETA */}
                                <div>
                                    {renderStatusBadge(st.hasProject, st.status)}
                                </div>
                             </div>
                          ))}
                       </div>
                    </div>
                  )}
                </div>
              )
             })}
          </div>
        </div>
      )}
    </div>
  )
}