'use client'

import { FileText, Clock, CheckCircle, AlertTriangle, XCircle } from 'lucide-react'

export default function ProjectHistory({ projects }: { projects: any[] }) {
  if (!projects || projects.length === 0) return null

  return (
    <div className="space-y-6 mt-8">
      <h3 className="font-bold text-gray-700 text-lg flex items-center gap-2 px-1 border-b pb-2">
        <FileText className="text-[#009B3A]" /> Histórico de Envios
      </h3>

      <div className="grid grid-cols-1 gap-4">
        {projects.map((proj) => (
          <div key={proj.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 relative overflow-hidden group hover:shadow-md transition-shadow">
            
            {/* Barra de Status Lateral */}
            <div className={`absolute left-0 top-0 bottom-0 w-1.5 
              ${proj.status === 'approved' ? 'bg-green-500' : ''}
              ${proj.status === 'pending' ? 'bg-blue-500' : ''}
              ${proj.status === 'changes_requested' ? 'bg-orange-500' : ''}
              ${proj.status === 'rejected' ? 'bg-red-600' : ''}
            `}></div>

            <div className="pl-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                    Enviado em: {new Date(proj.updated_at).toLocaleDateString('pt-BR')}
                  </span>
                  <h4 className="font-bold text-gray-800 text-lg mt-1">
                    {proj.action_plan_goal || 'Projeto de Vida'}
                  </h4>
                </div>
                
                {/* Badge de Status Atualizado */}
                <StatusBadge status={proj.status} />
              </div>

              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {proj.mini_bio || 'Sem descrição.'}
              </p>

              {/* Feedback do Professor */}
              {proj.teacher_feedback && (
                <div className={`p-3 rounded-lg border mb-4 text-sm animate-in fade-in
                    ${proj.status === 'rejected' ? 'bg-red-50 border-red-100' : 'bg-blue-50 border-blue-100'}
                `}>
                  <p className={`font-bold text-xs uppercase mb-1 flex items-center gap-1
                     ${proj.status === 'rejected' ? 'text-red-900' : 'text-blue-900'}
                  `}>
                    <CheckCircle size={12}/> Feedback do Professor:
                  </p>
                  <p className={`${proj.status === 'rejected' ? 'text-red-800' : 'text-blue-800'} italic`}>
                    "{proj.teacher_feedback}"
                  </p>
                </div>
              )}

              {/* Rodapé do Card */}
              <div className="flex gap-3 mt-2 border-t border-gray-100 pt-3">
                 <div className="text-xs text-gray-500 flex items-center gap-1">
                    <CheckCircle size={12} className="text-green-500"/> Arquivos salvos no sistema
                 </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
    if (status === 'approved') return (
        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 border border-green-200">
            <CheckCircle size={12}/> Aprovado
        </span>
    )
    if (status === 'changes_requested') return (
        <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 border border-orange-200">
            <AlertTriangle size={12}/> Em Correção
        </span>
    )
    if (status === 'rejected') return (
        <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 border border-red-200">
            <XCircle size={12}/> Reprovado
        </span>
    )
    // Default: Pending / Draft
    return (
        <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 border border-blue-200">
            <Clock size={12}/> Em Análise
        </span>
    )
}