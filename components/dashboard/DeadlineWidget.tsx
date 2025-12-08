'use client'

import { useState } from 'react'
import { Calendar, Edit2, Save, X } from 'lucide-react'
import { saveDeadline } from '@/app/(protected)/teacher/actions'

interface DeadlineWidgetProps {
  initialData: any
  isTeacher: boolean
}

export default function DeadlineWidget({ initialData, isTeacher }: DeadlineWidgetProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [start, setStart] = useState(initialData?.start_date || '')
  const [end, setEnd] = useState(initialData?.end_date || '')
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    setLoading(true)
    await saveDeadline(start, end)
    setLoading(false)
    setIsEditing(false)
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '--/--'
    const date = new Date(dateStr)
    return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()).toLocaleDateString('pt-BR')
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 relative group">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-gray-600 text-sm flex items-center gap-2">
            <Calendar size={16} className="text-[#009B3A]"/> Cronograma
        </h3>
        {isTeacher && !isEditing && (
            <button onClick={() => setIsEditing(true)} className="text-gray-400 hover:text-blue-600 transition-colors">
                <Edit2 size={14} />
            </button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-3 animate-in fade-in">
            <div><label className="text-xs font-bold block mb-1">Início</label><input type="date" value={start} onChange={e => setStart(e.target.value)} className="w-full text-sm border rounded p-1"/></div>
            <div><label className="text-xs font-bold block mb-1">Término</label><input type="date" value={end} onChange={e => setEnd(e.target.value)} className="w-full text-sm border rounded p-1"/></div>
            <div className="flex gap-2 pt-2"><button onClick={handleSave} disabled={loading} className="bg-[#009B3A] text-white px-3 py-1 rounded text-xs font-bold flex-1 flex justify-center items-center gap-1"><Save size={12}/> Salvar</button><button onClick={() => setIsEditing(false)} className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs"><X size={12}/></button></div>
        </div>
      ) : (
        <div className="space-y-4">
            <div className="flex gap-3 items-start"><div className="w-2 h-2 mt-1.5 rounded-full bg-blue-400 shrink-0"></div><div><p className="text-sm text-gray-700 font-medium">Início das Entregas</p><p className="text-xs text-gray-400 mt-0.5">{formatDate(start)}</p></div></div>
            <div className="flex gap-3 items-start"><div className="w-2 h-2 mt-1.5 rounded-full bg-yellow-400 shrink-0"></div><div><p className="text-sm text-gray-700 font-medium">Prazo Final</p><p className="text-xs text-red-500 font-bold mt-0.5">{formatDate(end)}</p></div></div>
        </div>
      )}
    </div>
  )
}