import React from 'react'
import { Calendar, Users, Settings, CreditCard, Package } from 'lucide-react'

interface MobileNavProps {
    activePage: string
    setActivePage: (page: string) => void
}

const MobileNav: React.FC<MobileNavProps> = ({ activePage, setActivePage }) => {
    const items = [
        { id: 'appointments', icon: Calendar, label: 'Agenda' },
        { id: 'clients', icon: Users, label: 'Clientes' },
        { id: 'finance', icon: CreditCard, label: 'Finanças' },
        { id: 'inventory', icon: Package, label: 'Estoque' },
        { id: 'settings', icon: Settings, label: 'Menu' },
    ]

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex justify-around items-center px-2 py-3 z-50 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
            {items.map((item) => (
                <button
                    key={item.id}
                    onClick={() => setActivePage(item.id)}
                    className={`flex flex-col items-center gap-1 min-w-[64px] transition-colors ${activePage === item.id ? 'text-brand-600' : 'text-gray-400'
                        }`}
                >
                    <item.icon className={`w-6 h-6 ${activePage === item.id ? 'stroke-[2.5px]' : 'stroke-[2px]'}`} />
                    <span className="text-[10px] font-bold uppercase tracking-wider">{item.label}</span>
                </button>
            ))}
        </nav>
    )
}

export default MobileNav
