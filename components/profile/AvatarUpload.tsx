'use client'

import { useState, useRef } from 'react'
import { updateProfileAvatar } from '@/app/(protected)/profile/actions'
import { Camera, Loader2, User } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

interface AvatarUploadProps {
  currentUrl: string | null
  userName: string
  size?: 'sm' | 'lg'
}

export default function AvatarUpload({ currentUrl, userName, size = 'lg' }: AvatarUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(currentUrl)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)

    const formData = new FormData()
    formData.append('avatar', file)

    const result = await updateProfileAvatar(formData)

    if (result.success && result.publicUrl) {
      setAvatarUrl(result.publicUrl)
      router.refresh() // Atualiza a página para refletir em outros lugares
    } else {
      alert(result.error || "Erro ao atualizar foto.")
    }

    setUploading(false)
  }

  // Define tamanho das classes
  const containerSize = size === 'lg' ? 'w-24 h-24' : 'w-12 h-12'
  const iconSize = size === 'lg' ? 40 : 20

  return (
    <div className="relative group cursor-pointer inline-block">
      <div 
        className={`${containerSize} rounded-full overflow-hidden border-4 border-white shadow-md bg-gray-200 flex items-center justify-center relative`}
        onClick={() => !uploading && fileInputRef.current?.click()}
      >
        {/* Imagem ou Placeholder */}
        {uploading ? (
          <div className="bg-gray-100 w-full h-full flex items-center justify-center">
             <Loader2 className="animate-spin text-gray-400" />
          </div>
        ) : avatarUrl ? (
          <img 
            src={avatarUrl} 
            alt="Avatar" 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-[#2C3E50] text-white font-bold text-2xl">
            {userName.charAt(0).toUpperCase()}
          </div>
        )}

        {/* Overlay de Edição (Aparece no Hover) */}
        {!uploading && (
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Camera className="text-white" size={24} />
          </div>
        )}
      </div>

      {/* Input Invisível */}
      <input 
        type="file" 
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
        disabled={uploading}
      />
    </div>
  )
}