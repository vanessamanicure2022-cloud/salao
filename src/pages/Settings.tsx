import React, { useState, useEffect } from 'react'
import { User, Save, Loader2, Camera } from 'lucide-react'
import { supabase } from '../services/supabase'

interface Profile {
    id: string
    studio_name: string
    studio_subtitle: string
    logo_url?: string
    pix_key?: string
}

const Settings: React.FC = () => {
    const [profile, setProfile] = useState<Profile | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [formData, setFormData] = useState({
        studio_name: '',
        studio_subtitle: '',
        pix_key: '',
    })

    useEffect(() => {
        const fetchProfile = async () => {
            setIsLoading(true)
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .limit(1)
                .single()

            if (data) {
                setProfile(data)
                setFormData({
                    studio_name: data.studio_name,
                    studio_subtitle: data.studio_subtitle,
                    pix_key: data.pix_key || '',
                })
            } else if (error && error.code === 'PGRST116') {
                // No profile found, initialize with defaults
                setFormData({
                    studio_name: 'Vanessa Cristina',
                    studio_subtitle: 'STUDIO NAILS',
                    pix_key: '',
                })
            }
            setIsLoading(false)
        }

        fetchProfile()
    }, [])

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSaving(true)

        if (profile) {
            const { error } = await supabase
                .from('profiles')
                .update(formData)
                .eq('id', profile.id)

            if (error) alert('Erro ao atualizar: ' + error.message)
            else alert('Perfil atualizado com sucesso! (Recarregue para ver as mudanças na barra lateral)')
        } else {
            const { error } = await supabase
                .from('profiles')
                .insert([formData])

            if (error) alert('Erro ao salvar: ' + error.message)
            else alert('Perfil criado com sucesso!')
        }
        setIsSaving(false)
    }

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Configurações</h1>
                <p className="text-sm text-gray-500">Gerencie as informações do seu Studio</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="col-span-1 md:block hidden">
                    <nav className="space-y-1">
                        <button className="w-full flex items-center gap-3 px-4 py-3 bg-brand-50 text-brand-700 rounded-2xl font-bold text-left">
                            <User className="w-5 h-5" />
                            Perfil do Studio
                        </button>
                    </nav>
                </div>

                <div className="col-span-1 md:col-span-2">
                    <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                        <div className="p-8 border-b border-gray-50">
                            <h3 className="text-xl font-bold text-gray-800">Perfil</h3>
                            <p className="text-gray-400 text-sm">Altere o nome e identidade do sistema</p>
                        </div>

                        <form onSubmit={handleSave} className="p-8 space-y-6">
                            {isLoading ? (
                                <div className="flex flex-col items-center py-10">
                                    <Loader2 className="w-8 h-8 animate-spin text-brand-600 mb-2" />
                                    <p className="text-sm text-gray-400">Carregando perfil...</p>
                                </div>
                            ) : (
                                <>
                                    <div className="flex items-center gap-6 mb-8">
                                        <div className="relative group">
                                            <div className="w-24 h-24 bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-200 flex items-center justify-center">
                                                <Camera className="w-8 h-8 text-gray-300" />
                                            </div>
                                            <div className="absolute inset-0 bg-black/20 rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                                                <span className="text-[10px] text-white font-bold uppercase">Alterar</span>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-800">Logo do Studio</p>
                                            <p className="text-xs text-gray-400">JPG ou PNG. Máximo de 2MB.</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Nome do Studio</label>
                                            <input
                                                type="text"
                                                value={formData.studio_name}
                                                onChange={(e) => setFormData({ ...formData, studio_name: e.target.value })}
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                                                placeholder="Ex: Vanessa Cristina"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Subtítulo (Identidade)</label>
                                            <input
                                                type="text"
                                                value={formData.studio_subtitle}
                                                onChange={(e) => setFormData({ ...formData, studio_subtitle: e.target.value })}
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                                                placeholder="Ex: STUDIO NAILS"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Chave PIX (E-mail, CPF ou Celular)</label>
                                            <input
                                                type="text"
                                                value={formData.pix_key}
                                                onChange={(e) => setFormData({ ...formData, pix_key: e.target.value })}
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none transition-all font-mono text-sm"
                                                placeholder="Ex: vanessa@pix.com"
                                            />
                                            <p className="text-[10px] text-gray-400 mt-1">Esta chave será enviada automaticamente nas mensagens de WhatsApp.</p>
                                        </div>
                                    </div>

                                    <div className="pt-6">
                                        <button
                                            type="submit"
                                            disabled={isSaving}
                                            className="btn-primary w-full py-4 flex items-center justify-center gap-2"
                                        >
                                            {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                            Salvar Alterações
                                        </button>
                                    </div>
                                </>
                            )}
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Settings
