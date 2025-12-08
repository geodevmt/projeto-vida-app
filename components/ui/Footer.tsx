import { CodeXml, Heart } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="w-full py-6 bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-center gap-2 text-sm text-gray-500">
        
        <div className="flex items-center gap-2">
          <CodeXml size={18} className="text-[#009B3A]" /> {/* Ícone de Código Verde */}
          <span>Desenvolvido por</span>
        </div>

        <div className="flex items-center gap-1">
          <strong className="text-gray-800 font-semibold">Paulo César Jr.</strong>
        </div>

        <span className="hidden sm:inline text-gray-300">|</span>

        <span className="text-xs">
          Portal Projeto de Vida &copy; {new Date().getFullYear()}
        </span>

      </div>
    </footer>
  )
}