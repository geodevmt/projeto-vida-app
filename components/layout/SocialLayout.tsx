'use client'

import { ReactNode, useState } from 'react'
import { Home, User, Bell, LogOut, Menu, Search, X, GraduationCap, Shield, Mail } from 'lucide-react'
import AvatarUpload from '@/components/profile/AvatarUpload'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import NotificationBell from '@/components/layout/NotificationBell'
import DeadlineWidget from '@/components/dashboard/DeadlineWidget' // <--- IMPORT

interface SocialLayoutProps {
  children: ReactNode;
  profile: any;
  role: 'student' | 'teacher' | 'admin';
  deadline?: any; // <--- PROP
}

export default function SocialLayout({ children, profile, role, deadline }: SocialLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const themeColor = role === 'admin' ? 'text-purple-600' : 'text-[#009B3A]';
  const themeBg = role === 'admin' ? 'bg-purple-600' : 'bg-[#009B3A]';
  const themeGradient = role === 'admin' ? 'from-purple-600 to-blue-600' : 'from-[#009B3A] to-[#2C3E50]';
  const logoText = role === 'admin' ? 'Portal Admin' : 'Projeto de Vida';

  return (
    <div className="min-h-screen bg-[#F3F4F6] pb-20 md:pb-0 font-sans"> 
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm px-4 py-2">
        <div className="max-w-7xl mx-auto flex justify-between items-center h-14">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 group">
              <div className={`${themeBg} text-white p-1.5 rounded-lg transition-colors`}>{role === 'admin' ? <Shield size={24} /> : <GraduationCap size={24} />}</div>
              <div className="leading-tight"><span className="block text-sm font-bold text-gray-500 uppercase tracking-wider">Portal</span><span className="block text-xl font-black text-[#2C3E50] tracking-tight -mt-1">{logoText}</span></div>
            </Link>
            <div className="hidden md:flex items-center bg-gray-100 rounded-full px-4 py-2 w-64 transition-all focus-within:w-72 focus-within:bg-white focus-within:ring-2 focus-within:ring-gray-200 ml-6"><Search size={18} className="text-gray-400" /><input type="text" placeholder="Pesquisar..." className="bg-transparent border-none text-sm ml-2 w-full outline-none placeholder:text-gray-400" /></div>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <Link href="/" className={`flex flex-col items-center ${themeColor} border-b-2 border-current pb-1 px-2`}><Home size={24} /></Link>
            <NotificationBell />
            <div className="flex items-center gap-3 pl-4 border-l border-gray-200"><div className="text-right hidden lg:block"><p className="text-sm font-bold text-gray-700 leading-tight">{profile.full_name?.split(' ')[0] || 'Admin'}</p><button onClick={handleSignOut} className="text-xs text-red-500 hover:underline">Sair</button></div><AvatarUpload currentUrl={profile.avatar_url} userName={profile.full_name || 'Admin'} size="sm" /></div>
          </div>
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-full">{isMobileMenuOpen ? <X /> : <Menu />}</button>
        </div>
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-16 right-4 w-56 bg-white rounded-xl shadow-xl border border-gray-100 p-2 animate-in slide-in-from-top-2 z-50">
            <div className="p-3 border-b border-gray-100 mb-2"><p className="font-bold text-gray-800 truncate">{profile.full_name}</p><p className="text-xs text-gray-500 uppercase">{role}</p></div>
            <button onClick={handleSignOut} className="w-full flex items-center gap-2 p-2 text-red-600 hover:bg-red-50 rounded-lg text-sm font-bold"><LogOut size={16} /> Sair do Sistema</button>
          </div>
        )}
      </nav>

      <div className="max-w-7xl mx-auto pt-4 md:pt-6 px-0 md:px-4 grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="hidden md:block md:col-span-3 lg:col-span-3">
          <div className="sticky top-24 space-y-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden relative group">
              <div className={`h-24 bg-gradient-to-r ${themeGradient}`}></div>
              <div className="px-4 pb-6 text-center -mt-12">
                <div className="inline-block p-1.5 bg-white rounded-full"><AvatarUpload currentUrl={profile.avatar_url} userName={profile.full_name || 'A'} size="lg" /></div>
                <h2 className="font-bold text-gray-800 text-lg mt-2 px-2">{profile.full_name || 'Usuário'}</h2>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mt-1">{role === 'admin' ? 'Gestão Geral' : profile.school_name || 'Escola Estadual'}</p>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2">
              <NavItem icon={Home} label="Início" active theme={themeColor} />
              {role === 'admin' && (<><NavItem icon={Mail} label="Convites" theme={themeColor} /><NavItem icon={User} label="Usuários" theme={themeColor} /></>)}
            </div>
          </div>
        </div>

        <div className="col-span-1 md:col-span-9 lg:col-span-6 space-y-6">
           {children}
        </div>

        {/* --- COLUNA DIREITA ATUALIZADA --- */}
        <div className="hidden lg:block lg:col-span-3">
          <div className="sticky top-24 space-y-4">
            <DeadlineWidget initialData={deadline} isTeacher={role === 'teacher'} /> {/* <--- AQUI */}
            <div className="text-xs text-gray-400 px-2 leading-relaxed text-center"><p>Portal Projeto de Vida © {new Date().getFullYear()}</p></div>
          </div>
        </div>
      </div>

      <div className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 flex justify-around items-center py-3 z-40 safe-area-pb shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <MobileNavItem icon={Home} label="Início" active color={role === 'admin' ? 'text-purple-600' : 'text-[#009B3A]'} />
        {role === 'admin' ? (<MobileNavItem icon={Mail} label="Convites" />) : (<MobileNavItem icon={Search} label="Buscar" />)}
        <div className="relative"><MobileNavItem icon={Bell} label="Avisos" /></div>
        <MobileNavItem icon={User} label="Perfil" />
      </div>
    </div>
  )
}

function NavItem({ icon: Icon, label, active, badge, theme }: any) {
  const activeClass = active ? `bg-gray-100 ${theme || 'text-[#009B3A]'}` : 'text-gray-600 hover:bg-gray-50';
  return (<div className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all ${activeClass}`}><div className="flex items-center gap-3"><Icon size={20} strokeWidth={active ? 2.5 : 2} /><span className={`text-sm ${active ? 'font-bold' : 'font-medium'}`}>{label}</span></div>{badge && <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md">{badge}</span>}</div>)
}
function MobileNavItem({ icon: Icon, label, active, color }: any) {
  return (<button className={`flex flex-col items-center justify-center w-full ${active ? (color || 'text-[#009B3A]') : 'text-gray-400'}`}><Icon size={24} strokeWidth={active ? 2.5 : 2} /><span className="text-[10px] font-medium mt-1">{label}</span></button>)
}