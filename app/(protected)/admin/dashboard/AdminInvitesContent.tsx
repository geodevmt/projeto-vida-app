'use client'

import { useState } from 'react'
import { Mail, RefreshCw, Trash2, Copy, CheckCircle, Plus, Loader2 } from 'lucide-react'
import { generateInvite, deleteInvite, resetInvite } from './actions'

export default function AdminInvitesContent({ invites }: { invites: any[] }) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null)

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)
    
    const res = await generateInvite(email)
    
    if (res.error) {
        setMessage({ text: res.error, type: 'error' })
    } else {
        setMessage({ text: res.success || 'Convite gerado!', type: 'success' })
        setEmail('')
    }
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    if(!confirm("Excluir convite?")) return;
    await deleteInvite(id)
  }

  const handleReset = async (id: string) => {
    if(!confirm("Gerar novo link para este convite?")) return;
    await resetInvite(id)
  }

  const handleCopy = (token: string) => {
    const url = `${window.location.origin}/invite/${token}`
    navigator.clipboard.writeText(url)
    alert("Link copiado!")
  }

  return (
    <div className="space-y-6">
      
      {/* Create Invite Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
            <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                <Plus size={20} />
            </div>
            <div>
                <h2 className="font-bold text-gray-800 text-lg">Novo Professor</h2>
                <p className="text-xs text-gray-500">Envie um convite para liberar o cadastro.</p>
            </div>
        </div>
        
        <form onSubmit={handleCreate} className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
                <Mail size={18} className="absolute left-3 top-3 text-gray-400" />
                <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="E-mail do professor..." 
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all outline-none text-sm"
                />
            </div>
            <button 
                type="submit" 
                disabled={loading}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2.5 rounded-lg font-bold text-sm transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
            >
                {loading ? <Loader2 size={18} className="animate-spin"/> : 'Gerar Convite'}
            </button>
        </form>
        
        {message && (
            <div className={`mt-4 p-3 rounded-lg text-sm flex items-center gap-2 ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                {message.type === 'success' ? <CheckCircle size={16}/> : <Trash2 size={16}/>}
                {message.text}
            </div>
        )}
      </div>

      {/* Invites List */}
      <div className="space-y-4">
        <h3 className="font-bold text-gray-500 text-xs uppercase tracking-wider ml-1">Histórico de Convites</h3>
        
        {invites.length === 0 && (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200 border-dashed text-gray-400">
                Nenhum convite encontrado.
            </div>
        )}

        {invites.map((invite) => (
            <div key={invite.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-md transition-shadow">
                
                <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shrink-0 ${invite.used ? 'bg-green-500' : 'bg-gray-400'}`}>
                        {invite.email.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <p className="font-bold text-gray-800 text-sm">{invite.email}</p>
                        <div className="flex items-center gap-2 text-xs mt-0.5">
                            {invite.used 
                                ? <span className="text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded-full flex items-center gap-1">Cadastrado</span> 
                                : <span className="text-orange-500 font-bold bg-orange-50 px-2 py-0.5 rounded-full">Pendente</span>
                            }
                            <span className="text-gray-400">• Expira: {new Date(invite.expires_at).toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto border-t sm:border-t-0 pt-3 sm:pt-0 w-full sm:w-auto justify-end">
                    {!invite.used && (
                        <>
                            <button 
                                onClick={() => handleCopy(invite.token)}
                                className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg text-xs font-bold transition-colors"
                                title="Copiar Link"
                            >
                                <Copy size={18} />
                            </button>
                            <button 
                                onClick={() => handleReset(invite.id)}
                                className="p-2 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Renovar Link"
                            >
                                <RefreshCw size={18} />
                            </button>
                        </>
                    )}
                    
                    <button 
                        onClick={() => handleDelete(invite.id)}
                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Excluir"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>

            </div>
        ))}
      </div>

    </div>
  )
}