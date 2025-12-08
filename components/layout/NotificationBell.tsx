'use client'

import { useState, useEffect, useRef } from 'react'
import { Bell, Check, Info, Calendar, ArrowRight, X } from 'lucide-react'
import { getNotifications, markAsRead, markAllAsRead } from '@/app/(protected)/notifications/actions'
import { useRouter } from 'next/navigation'
import Modal from '@/components/ui/Modal' // <--- Importamos o Modal que criamos antes

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<any[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [selectedNotification, setSelectedNotification] = useState<any | null>(null) // <--- Estado para o Modal
  
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Buscar notificações
  useEffect(() => {
    const fetchNotes = async () => {
      const data = await getNotifications()
      setNotifications(data)
      setLoading(false)
    }
    fetchNotes()
    
    // Atualiza a cada 60s
    const interval = setInterval(fetchNotes, 60000)
    return () => clearInterval(interval)
  }, [])

  // Fechar ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: any) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [dropdownRef])

  const unreadCount = notifications.filter(n => !n.read).length

  const handleNotificationClick = async (note: any) => {
    // 1. Marca como lida visualmente na hora
    setNotifications(prev => prev.map(n => n.id === note.id ? { ...n, read: true } : n))
    
    // 2. Marca no banco
    await markAsRead(note.id)
    
    // 3. Fecha o menu suspenso e abre o Modal com detalhes
    setIsOpen(false)
    setSelectedNotification(note)
  }

  const handleMarkAllRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    await markAllAsRead()
  }

  const handleRedirect = () => {
    if (selectedNotification?.link) {
      router.push(selectedNotification.link)
      setSelectedNotification(null) // Fecha o modal
    }
  }

  return (
    <>
      {/* Ícone e Dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="flex flex-col items-center text-gray-500 hover:text-gray-700 relative transition-colors p-1 rounded-full hover:bg-gray-100"
        >
          <Bell size={24} />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-in zoom-in">
              {unreadCount}
            </span>
          )}
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden animate-in slide-in-from-top-2 origin-top-right">
            
            <div className="p-3 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-700 text-sm">Notificações</h3>
              {unreadCount > 0 && (
                <button onClick={handleMarkAllRead} className="text-xs text-[#009B3A] hover:underline font-medium flex items-center gap-1">
                  <Check size={12}/> Marcar todas lidas
                </button>
              )}
            </div>

            <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
              {loading ? (
                  <div className="p-6 text-center text-gray-400 text-xs">Carregando...</div>
              ) : notifications.length === 0 ? (
                  <div className="p-8 text-center text-gray-400 text-sm flex flex-col items-center">
                      <Bell size={32} className="mb-2 opacity-20"/>
                      Nenhuma notificação nova.
                  </div>
              ) : (
                notifications.map((note) => (
                  <div 
                      key={note.id} 
                      onClick={() => handleNotificationClick(note)}
                      className={`p-4 border-b border-gray-50 cursor-pointer transition-colors hover:bg-gray-50 flex gap-3 relative
                        ${!note.read ? 'bg-blue-50/60' : 'bg-white'}
                      `}
                  >
                      {/* Bolinha de não lido */}
                      {!note.read && (
                        <span className="absolute top-4 right-4 w-2 h-2 bg-blue-500 rounded-full"></span>
                      )}

                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 
                        ${note.type === 'feedback' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}
                      >
                          <Info size={20} />
                      </div>

                      <div className="flex-1 pr-4">
                          <p className={`text-sm mb-1 ${!note.read ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>
                              {note.title}
                          </p>
                          <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                              {note.message}
                          </p>
                          <p className="text-[10px] text-gray-400 mt-2 flex items-center gap-1">
                              <Calendar size={10} />
                              {new Date(note.created_at).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute:'2-digit' })}
                          </p>
                      </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* --- MODAL DE DETALHES DA NOTIFICAÇÃO --- */}
      <Modal 
        isOpen={!!selectedNotification} 
        onClose={() => setSelectedNotification(null)}
        title="Detalhes da Notificação"
      >
        {selectedNotification && (
          <div className="space-y-6">
             {/* Cabeçalho do Modal */}
             <div className="text-center">
                <h2 className="text-xl font-bold text-gray-800 mb-2">{selectedNotification.title}</h2>
                <div className="text-xs text-gray-500 flex items-center justify-center gap-1">
                   <Calendar size={12}/>
                   Recebido em: {new Date(selectedNotification.created_at).toLocaleString('pt-BR')}
                </div>
             </div>

             {/* Corpo da Mensagem (Texto Completo) */}
             <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                {selectedNotification.message}
             </div>

             {/* Botão de Ação */}
             <div className="flex gap-3 pt-2">
                <button 
                  onClick={() => setSelectedNotification(null)}
                  className="flex-1 py-2.5 border border-gray-300 rounded-lg text-gray-600 font-bold hover:bg-gray-50 transition-colors"
                >
                  Fechar
                </button>
                
                {selectedNotification.link && (
                  <button 
                    onClick={handleRedirect}
                    className="flex-1 py-2.5 bg-[#009B3A] text-white rounded-lg font-bold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                  >
                    Ver no Painel <ArrowRight size={16} />
                  </button>
                )}
             </div>
          </div>
        )}
      </Modal>
    </>
  )
}