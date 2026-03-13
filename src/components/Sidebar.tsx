import React from 'react'
import {
    Calendar as CalendarIcon,
    Users,
    Settings,
    CreditCard,
    LogOut,
    Scissors,
    Package
} from 'lucide-react'
import { supabase } from '../services/supabase'
import logo from '../assets/logo.png'

interface SidebarProps {
    activePage: string;
    setActivePage: (page: string) => void;
    profile?: any;
}

const Sidebar: React.FC<SidebarProps> = ({ activePage, setActivePage, profile }) => {
    const menuItems = [
        { id: 'appointments', label: 'Agendamentos', icon: CalendarIcon },
        { id: 'clients', label: 'Clientes', icon: Users },
        { id: 'services', label: 'Serviços', icon: Settings },
        { id: 'finance', label: 'Financeiro', icon: CreditCard },
        { id: 'inventory', label: 'Estoque', icon: Package },
    ]

    return (
        <aside className="hidden md:flex w-64 bg-white border-r border-gray-100 flex-col h-screen sticky top-0">
            <div className="p-6">
                <div className="flex items-center gap-3 mb-10">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center p-1 shadow-md border border-gray-50">
                        <img src={logo} alt="Logo" className="w-full h-full object-contain rounded-lg" />
                    </div>
                    <div>
                        <h2 className="font-bold text-gray-800 leading-tight">{profile?.studio_name || 'Vanessa Cristina'}</h2>
                        <p className="text-xs text-brand-500 font-medium tracking-wide">{profile?.studio_subtitle || 'STUDIO NAILS'}</p>
                    </div>
                </div>

                <nav className="space-y-1">
                    {menuItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActivePage(item.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activePage === item.id
                                ? 'bg-brand-50 text-brand-700'
                                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                                }`}
                        >
                            <item.icon className="w-5 h-5" />
                            {item.label}
                        </button>
                    ))}
                </nav>
            </div>

            <div className="mt-auto p-6 flex flex-col gap-4">
                <button
                    onClick={() => setActivePage('settings')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activePage === 'settings'
                        ? 'bg-brand-50 text-brand-700'
                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                        }`}
                >
                    <Settings className="w-5 h-5" />
                    Configurações
                </button>

                <button
                    onClick={() => supabase.auth.signOut()}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-red-500 hover:bg-red-50 transition-colors"
                >
                    <LogOut className="w-5 h-5" />
                    Sair
                </button>

                <div className="pt-4 border-t border-gray-50 text-center">
                    <p className="text-[9px] text-gray-300 font-bold uppercase tracking-[0.15em]">arcsolucoesintegradas v0.1 beta</p>
                </div>
            </div>
        </aside>
    )
}

export default Sidebar
