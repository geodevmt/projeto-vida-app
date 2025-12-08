/*'use client'

import { useState } from 'react'
import { evaluateProject } from '../actions'
import { Check, X, MessageSquare } from 'lucide-react'

export default function TeacherActionButtons({ 
  projectId, 
  currentStatus,
  currentFeedback 
}: { 
  projectId: string, 
  currentStatus: string,
  currentFeedback: string | null
}) {
  const [loading, setLoading] = useState(false)

  const handleApprove = async () => {
    if (!confirm("Tem certeza que deseja APROVAR este projeto?")) return
    setLoading(true)
    await evaluateProject(projectId, 'approved')
    setLoading(false)
  }

  const handleRequestChanges = async () => {
    // No MVP, usamos o prompt do navegador. Na versão final, seria um Modal bonito.
    const feedback = prompt("Descreva o que o aluno precisa corrigir:", currentFeedback || "")
    if (!feedback) return // Cancelou ou vazio

    setLoading(true)
    await evaluateProject(projectId, 'changes_requested', feedback)
    setLoading(false)
  }

  if (loading) return <span className="text-gray-400 text-sm">Processando...</span>

  // Se já estiver aprovado, não mostra botões (ou mostra botão de desfazer se quiser evoluir depois)
  if (currentStatus === 'approved') return null

  return (
    <div className="flex gap-3">
      <button 
        onClick={handleApprove}
        className="flex items-center gap-2 bg-[#009B3A] hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors"
      >
        <Check size={16} /> Aprovar Projeto
      </button>

      <button 
        onClick={handleRequestChanges}
        className="flex items-center gap-2 bg-white border border-yellow-500 text-yellow-700 hover:bg-yellow-50 px-4 py-2 rounded-lg text-sm font-bold transition-colors"
      >
        <MessageSquare size={16} /> Solicitar Correção
      </button>
    </div>
  )
}* /
'use client'

import { useState } from 'react'
import { evaluateProject } from '../actions'
import { Check, MessageSquare, Loader2, AlertTriangle } from 'lucide-react'
import Modal from '@/components/ui/Modal'

export default function TeacherActionButtons({ 
  projectId, 
  currentStatus,
  currentFeedback 
}: { 
  projectId: string, 
  currentStatus: string,
  currentFeedback: string | null
}) {
  const [loading, setLoading] = useState(false)
  const [isApproveOpen, setIsApproveOpen] = useState(false)
  const [isRejectOpen, setIsRejectOpen] = useState(false)
  const [feedbackText, setFeedbackText] = useState(currentFeedback || '')

  const handleApprove = async () => {
    setLoading(true)
    await evaluateProject(projectId, 'approved')
    setLoading(false)
    setIsApproveOpen(false)
  }

  const handleRequestChanges = async () => {
    if (!feedbackText.trim()) return alert("Por favor, escreva um feedback.")
    
    setLoading(true)
    await evaluateProject(projectId, 'changes_requested', feedbackText)
    setLoading(false)
    setIsRejectOpen(false)
  }

  if (loading) return <div className="flex items-center gap-2 text-gray-500 text-sm"><Loader2 className="animate-spin" size={16}/> Processando...</div>

  // Se já estiver aprovado, não mostra botões (ou mostra apenas status)
  if (currentStatus === 'approved') return (
    <div className="flex items-center gap-2 text-green-600 font-bold text-sm bg-green-50 px-3 py-2 rounded-lg border border-green-200">
        <Check size={16} /> Projeto Aprovado
    </div>
  )

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
        <button 
          onClick={() => setIsApproveOpen(true)}
          className="flex items-center justify-center gap-2 bg-[#009B3A] hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors shadow-sm"
        >
          <Check size={16} /> Aprovar Projeto
        </button>

        <button 
          onClick={() => setIsRejectOpen(true)}
          className="flex items-center justify-center gap-2 bg-white border border-yellow-500 text-yellow-700 hover:bg-yellow-50 px-4 py-2 rounded-lg text-sm font-bold transition-colors shadow-sm"
        >
          <MessageSquare size={16} /> Solicitar Correção
        </button>
      </div>

      {/* --- MODAL DE APROVAÇÃO --- * /}
      <Modal isOpen={isApproveOpen} onClose={() => setIsApproveOpen(false)} title="Confirmar Aprovação">
         <div className="text-center">
            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check size={32} />
            </div>
            <p className="text-gray-600 mb-6">
                Você está prestes a aprovar este projeto de vida. O aluno será notificado imediatamente.
            </p>
            <div className="flex gap-3">
                <button onClick={() => setIsApproveOpen(false)} className="flex-1 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 font-medium">Cancelar</button>
                <button onClick={handleApprove} className="flex-1 py-2 bg-[#009B3A] hover:bg-green-700 text-white rounded-lg font-bold">Confirmar</button>
            </div>
         </div>
      </Modal>

      {/* --- MODAL DE CORREÇÃO --- * /}
      <Modal isOpen={isRejectOpen} onClose={() => setIsRejectOpen(false)} title="Solicitar Correções">
         <div>
            <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-100 flex items-start gap-2 mb-4">
                <AlertTriangle className="text-yellow-600 shrink-0 mt-0.5" size={16} />
                <p className="text-xs text-yellow-800">Descreva o que precisa ser melhorado. O aluno poderá editar e reenviar.</p>
            </div>
            
            <label className="block text-sm font-bold text-gray-700 mb-2">Feedback do Professor</label>
            <textarea 
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-yellow-500 outline-none text-sm min-h-[120px]"
                placeholder="Ex: Melhore a descrição da sua meta..."
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
            />
            
            <div className="flex gap-3 mt-6">
                <button onClick={() => setIsRejectOpen(false)} className="flex-1 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 font-medium">Cancelar</button>
                <button onClick={handleRequestChanges} className="flex-1 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-bold">Enviar Feedback</button>
            </div>
         </div>
      </Modal>
    </>
  )
}*/
'use client'

import { useState } from 'react'
import { evaluateProject } from '../actions'
import { Check, MessageSquare, Loader2, XCircle, AlertOctagon } from 'lucide-react'
import Modal from '@/components/ui/Modal'

export default function TeacherActionButtons({ 
  projectId, 
  currentStatus,
  currentFeedback 
}: { 
  projectId: string, 
  currentStatus: string,
  currentFeedback: string | null
}) {
  const [loading, setLoading] = useState(false)
  const [isApproveOpen, setIsApproveOpen] = useState(false)
  const [isRejectOpen, setIsRejectOpen] = useState(false)
  const [isChangesOpen, setIsChangesOpen] = useState(false)
  const [feedbackText, setFeedbackText] = useState(currentFeedback || '')

  const handleAction = async (status: 'approved' | 'changes_requested' | 'rejected') => {
    if ((status === 'changes_requested' || status === 'rejected') && !feedbackText.trim()) {
        return alert("Por favor, escreva o motivo.")
    }
    
    setLoading(true)
    await evaluateProject(projectId, status, feedbackText)
    setLoading(false)
    setIsApproveOpen(false); setIsChangesOpen(false); setIsRejectOpen(false);
  }

  if (loading) return <div className="flex items-center gap-2 text-gray-500 text-sm"><Loader2 className="animate-spin" size={16}/> Processando...</div>

  if (currentStatus === 'approved') return (
    <div className="flex items-center gap-2 text-green-600 font-bold text-sm bg-green-50 px-3 py-2 rounded-lg border border-green-200">
        <Check size={16} /> Aprovado
    </div>
  )

  if (currentStatus === 'rejected') return (
    <div className="flex items-center gap-2 text-red-600 font-bold text-sm bg-red-50 px-3 py-2 rounded-lg border border-red-200">
        <XCircle size={16} /> Reprovado
    </div>
  )

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-2 w-full">
        <button onClick={() => setIsApproveOpen(true)} className="flex-1 flex items-center justify-center gap-2 bg-[#009B3A] hover:bg-green-700 text-white px-3 py-2 rounded-lg text-xs font-bold transition-colors">
          <Check size={14} /> Aprovar
        </button>

        <button onClick={() => setIsChangesOpen(true)} className="flex-1 flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-2 rounded-lg text-xs font-bold transition-colors">
          <MessageSquare size={14} /> Correção
        </button>

        <button onClick={() => setIsRejectOpen(true)} className="flex-1 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-xs font-bold transition-colors">
          <XCircle size={14} /> Reprovar
        </button>
      </div>

      {/* MODAL APROVAR */}
      <Modal isOpen={isApproveOpen} onClose={() => setIsApproveOpen(false)} title="Confirmar Aprovação">
         <div className="text-center">
            <p className="text-gray-600 mb-6">Confirmar aprovação deste projeto?</p>
            <div className="flex gap-3"><button onClick={() => setIsApproveOpen(false)} className="flex-1 py-2 border rounded-lg">Cancelar</button><button onClick={() => handleAction('approved')} className="flex-1 py-2 bg-green-600 text-white rounded-lg">Sim, Aprovar</button></div>
         </div>
      </Modal>

      {/* MODAL CORREÇÃO */}
      <Modal isOpen={isChangesOpen} onClose={() => setIsChangesOpen(false)} title="Solicitar Correções">
         <div>
            <textarea className="w-full border rounded-lg p-3 text-sm mb-4" placeholder="O que corrigir?" value={feedbackText} onChange={e => setFeedbackText(e.target.value)} />
            <div className="flex gap-3"><button onClick={() => setIsChangesOpen(false)} className="flex-1 py-2 border rounded-lg">Cancelar</button><button onClick={() => handleAction('changes_requested')} className="flex-1 py-2 bg-yellow-500 text-white rounded-lg">Enviar</button></div>
         </div>
      </Modal>

      {/* MODAL REPROVAR */}
      <Modal isOpen={isRejectOpen} onClose={() => setIsRejectOpen(false)} title="Reprovar Projeto">
         <div>
            <div className="bg-red-50 p-3 rounded mb-4 text-red-800 text-sm flex gap-2">
                <AlertOctagon size={20} className="shrink-0"/>
                <p>Use se o projeto for inaceitável. O aluno terá que refazer.</p>
            </div>
            <textarea className="w-full border rounded-lg p-3 text-sm mb-4" placeholder="Motivo da reprovação..." value={feedbackText} onChange={e => setFeedbackText(e.target.value)} />
            <div className="flex gap-3"><button onClick={() => setIsRejectOpen(false)} className="flex-1 py-2 border rounded-lg">Cancelar</button><button onClick={() => handleAction('rejected')} className="flex-1 py-2 bg-red-600 text-white rounded-lg">Reprovar</button></div>
         </div>
      </Modal>
    </>
  )
}