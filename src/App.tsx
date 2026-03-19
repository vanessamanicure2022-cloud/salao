import React, { useState, useEffect } from 'react'
import { supabase } from './services/supabase'
import Sidebar from './components/Sidebar'
import Appointments from './pages/Appointments'
import Clients from './pages/Clients'
import Services from './pages/Services'
import Finance from './pages/Finance'
import Login from './pages/Login'
import Settings from './pages/Settings'
import Inventory from './pages/Inventory'
import MobileNav from './components/MobileNav'
import { Session } from '@supabase/supabase-js'

const App: React.FC = () => {
    const [session, setSession] = useState<Session | null>(null)
    const [activePage, setActivePage] = useState('appointments')
    const [isLoading, setIsLoading] = useState(true)
    const [profile, setProfile] = useState<any>(null)

    useEffect(() => {
        // Obter sessão inicial com tempo limite de segurança
        const authTimeout = setTimeout(() => {
            setIsLoading(false)
        }, 5000)

        // Obter sessão inicial
        supabase.auth.getSession()
            .then(({ data: { session } }) => {
                clearTimeout(authTimeout)
                setSession(session)
                setIsLoading(false)
            })
            .catch((err) => {
                console.error('Erro na auth:', err)
                clearTimeout(authTimeout)
                setIsLoading(false)
            })

        // Escutar mudanças na autenticação
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session)
        })

        // Fetch profile
        const fetchProfile = async () => {
            try {
                const { data } = await supabase.from('profiles').select('*').limit(1).single()
                if (data) setProfile(data)
            } catch (err) {
                console.error('Erro profile:', err)
            }
        }
        fetchProfile()

        return () => subscription.unsubscribe()
    }, [])

    const renderPage = () => {
        switch (activePage) {
            case 'appointments':
                return <Appointments profile={profile} />
            case 'clients':
                return <Clients />
            case 'services':
                return <Services />
            case 'finance':
                return <Finance />
            case 'settings':
                return <Settings />
            case 'inventory':
                return <Inventory />
            default:
                return <Appointments profile={profile} />
        }
    }

    if (isLoading) {
        return (
            <div className="h-screen flex items-center justify-center bg-[#FDFBFB]">
                <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin"></div>
            </div>
        )
    }

    if (!session) {
        return <Login />
    }
    return (
        <div className="flex h-screen bg-[#FDFBFB]">
            <Sidebar activePage={activePage} setActivePage={setActivePage} profile={profile} />

            <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8">
                {renderPage()}
            </main>

            <MobileNav activePage={activePage} setActivePage={setActivePage} />
        </div>
    )
}

export default App
