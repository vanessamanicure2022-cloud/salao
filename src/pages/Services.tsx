import React, { useState, useEffect } from 'react'
import { Plus, Settings2, Clock, DollarSign, Trash2, Edit2, Loader2, X } from 'lucide-react'
import { supabase } from '../services/supabase'

interface Service {
    id: string
    name: string
    duration_minutes: number
    price: number
    category: string
    active: boolean
}

const Services: React.FC = () => {
    const [services, setServices] = useState<Service[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false)

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        duration_minutes: 60,
        price: 0,
        category: 'Manicure',
    })

    const fetchServices = async () => {
        setIsLoading(true)
        const { data, error } = await supabase
            .from('services')
            .select('*')
            .order('name', { ascending: true })

        if (data) setServices(data)
        if (error) console.error('Error fetching services:', error)
        setIsLoading(false)
    }

    useEffect(() => {
        fetchServices()
    }, [])

    const handleOpenModal = () => setIsModalOpen(true)
    const handleCloseModal = () => {
        setIsModalOpen(false)
        setFormData({ name: '', duration_minutes: 60, price: 0, category: 'Manicure' })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSaving(true)

        const { error } = await supabase
            .from('services')
            .insert([formData])

        if (error) {
            alert('Erro ao salvar serviço: ' + error.message)
        } else {
            handleCloseModal()
            fetchServices()
        }
        setIsSaving(false)
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Deseja realmente excluir este serviço?')) return

        const { error } = await supabase
            .from('services')
            .delete()
            .eq('id', id)

        if (error) {
            alert('Erro ao excluir serviço: ' + error.message)
        } else {
            fetchServices()
        }
    }

    return (
        <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Serviços</h1>
                    <p className="text-gray-500">Configure seus serviços, durações e preços</p>
                </div>
                <button
                    onClick={handleOpenModal}
                    className="btn-primary flex items-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    Novo Serviço
                </button>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-10 h-10 animate-spin text-brand-600" />
                </div>
            ) : services.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-[2.5rem] border-2 border-dashed border-gray-100">
                    <Settings2 className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">Nenhum serviço cadastrado.</p>
                    <button onClick={handleOpenModal} className="mt-4 text-brand-600 font-bold hover:underline">
                        Cadastrar agora
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {services.map(service => (
                        <div key={service.id} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow group">
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-12 h-12 bg-accent-nude/50 rounded-2xl flex items-center justify-center text-accent-gold">
                                    <Settings2 className="w-6 h-6" />
                                </div>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button className="p-2 hover:bg-gray-50 rounded-lg text-gray-400 hover:text-brand-600 transition-colors">
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(service.id)}
                                        className="p-2 hover:bg-gray-50 rounded-lg text-gray-400 hover:text-red-500 transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <h3 className="font-bold text-gray-800 text-lg mb-1">{service.name}</h3>
                            <p className="text-xs text-brand-500 font-medium uppercase tracking-wide mb-4">{service.category}</p>

                            <div className="space-y-3 pt-4 border-t border-gray-50">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-gray-500">
                                        <Clock className="w-4 h-4" />
                                        <span className="text-sm">Duração</span>
                                    </div>
                                    <span className="text-sm font-bold text-gray-700">{service.duration_minutes} min</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-gray-500">
                                        <DollarSign className="w-4 h-4" />
                                        <span className="text-sm">Preço</span>
                                    </div>
                                    <span className="text-lg font-bold text-brand-700">R$ {Number(service.price).toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal Novo Serviço */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="p-8">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-gray-800">Novo Serviço</h2>
                                <button onClick={handleCloseModal} className="p-2 hover:bg-gray-50 rounded-xl transition-colors">
                                    <X className="w-5 h-5 text-gray-400" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Nome do Serviço</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                                        placeholder="Ex: Pé e Mão"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Categoria</label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                                    >
                                        <option value="Manicure">Manicure</option>
                                        <option value="Pedicure">Pedicure</option>
                                        <option value="Manicure/Pedicure">Manicure/Pedicure</option>
                                        <option value="Alongamento">Alongamento</option>
                                        <option value="Tratamento">Tratamento</option>
                                        <option value="Outros">Outros</option>
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Duração (min)</label>
                                        <input
                                            type="number"
                                            required
                                            value={formData.duration_minutes}
                                            onChange={(e) => setFormData({ ...formData, duration_minutes: Number(e.target.value) })}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Preço (R$)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            required
                                            value={formData.price}
                                            onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="pt-4">
                                    <button
                                        type="submit"
                                        disabled={isSaving}
                                        className="w-full py-4 bg-brand-600 text-white font-bold rounded-2xl hover:bg-brand-700 transition-all shadow-lg shadow-brand-200 active:scale-95 disabled:opacity-50"
                                    >
                                        {isSaving ? 'Salvando...' : 'Cadastrar Serviço'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Services
