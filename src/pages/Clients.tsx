import React, { useState, useEffect } from 'react'
import { Plus, Search, MoreVertical, Phone, Mail, Heart, Edit2, Trash2, X } from 'lucide-react'
import { supabase } from '../services/supabase'

interface Client {
    id: string;
    name: string;
    phone: string;
    email: string;
    preferences: string;
    status: string;
    services_count: number;
}

const Clients: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('')
    const [clients, setClients] = useState<Client[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [editingClient, setEditingClient] = useState<Client | null>(null)
    const [activeMenu, setActiveMenu] = useState<string | null>(null)

    // Form states
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        preferences: ''
    })

    const fetchClients = async () => {
        setIsLoading(true)
        const { data, error } = await supabase
            .from('clients')
            .select('*')
            .order('name', { ascending: true })

        if (data) setClients(data)
        if (error) console.error('Error fetching clients:', error)
        setIsLoading(false)
    }

    useEffect(() => {
        fetchClients()
    }, [])

    const handleOpenModal = (client?: Client) => {
        if (client) {
            setEditingClient(client)
            setFormData({
                name: client.name,
                phone: client.phone || '',
                email: client.email || '',
                preferences: client.preferences || ''
            })
        } else {
            setEditingClient(null)
            setFormData({ name: '', phone: '', email: '', preferences: '' })
        }
        setIsModalOpen(true)
        setActiveMenu(null)
    }

    const handleCloseModal = () => {
        setIsModalOpen(false)
        setEditingClient(null)
        setFormData({ name: '', phone: '', email: '', preferences: '' })
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSaving(true)

        if (editingClient) {
            const { error } = await supabase
                .from('clients')
                .update(formData)
                .eq('id', editingClient.id)

            if (error) alert('Erro ao atualizar: ' + error.message)
            else {
                handleCloseModal()
                fetchClients()
            }
        } else {
            const { error } = await supabase
                .from('clients')
                .insert([formData])

            if (error) alert('Erro ao salvar cliente: ' + error.message)
            else {
                handleCloseModal()
                fetchClients()
            }
        }
        setIsSaving(false)
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir esta cliente? Esta ação não pode ser desfeita.')) return

        const { error } = await supabase
            .from('clients')
            .delete()
            .eq('id', id)

        if (error) alert('Erro ao excluir: ' + error.message)
        else fetchClients()
        setActiveMenu(null)
    }

    const filteredClients = clients.filter(client =>
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (client.phone && client.phone.includes(searchTerm)) ||
        (client.preferences && client.preferences.toLowerCase().includes(searchTerm.toLowerCase()))
    )

    return (
        <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Clientes</h1>
                    <p className="text-sm text-gray-500">Gerencie sua base de clientes e históricos de fidelidade</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="btn-primary flex items-center gap-2 w-fit"
                >
                    <Plus className="w-5 h-5" />
                    Novo Cliente
                </button>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex items-center gap-4">
                    <div className="relative flex-1">
                        <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Buscar por nome, telefone ou cor preferida..."
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-brand-500 text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[700px] md:min-w-0">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Cliente</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Contato</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Preferência</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Fidelidade</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-20 text-center text-gray-400">
                                        Carregando clientes...
                                    </td>
                                </tr>
                            ) : filteredClients.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-20 text-center text-gray-400">
                                        Nenhum cliente encontrado.
                                    </td>
                                </tr>
                            ) : (
                                filteredClients.map(client => (
                                    <tr key={client.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-brand-100 rounded-full flex items-center justify-center text-brand-700 font-bold uppercase">
                                                    {client.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-gray-800">{client.name}</p>
                                                    <p className="text-xs text-gray-400">{client.services_count || 0} serviços realizados</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 text-xs text-gray-600">
                                                    <Phone className="w-3 h-3" />
                                                    {client.phone}
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-gray-600">
                                                    <Mail className="w-3 h-3" />
                                                    {client.email}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Heart className="w-4 h-4 text-brand-400 fill-brand-400" />
                                                <span className="text-xs font-medium text-gray-700">{client.preferences || 'Sem preferências'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase
                                              ${client.status === 'diamante' ? 'bg-purple-100 text-purple-700' :
                                                    client.status === 'ouro' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'}
                                            `}>
                                                {client.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right relative">
                                            <button
                                                onClick={() => setActiveMenu(activeMenu === client.id ? null : client.id)}
                                                className={`p-2 rounded-lg transition-all border ${activeMenu === client.id ? 'bg-brand-50 border-brand-100 text-brand-600' : 'hover:bg-white border-transparent hover:border-gray-100 text-gray-400'}`}
                                            >
                                                <MoreVertical className="w-4 h-4" />
                                            </button>

                                            {activeMenu === client.id && (
                                                <>
                                                    <div className="fixed inset-0 z-40" onClick={() => setActiveMenu(null)}></div>
                                                    <div className="absolute right-6 top-14 w-40 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                                        <button
                                                            onClick={() => handleOpenModal(client)}
                                                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 font-medium"
                                                        >
                                                            <Edit2 className="w-4 h-4 text-blue-500" />
                                                            Editar
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(client.id)}
                                                            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 font-medium"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                            Excluir
                                                        </button>
                                                    </div>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Novo Cliente */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="p-8">
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-800">{editingClient ? 'Editar Cliente' : 'Cadastrar Cliente'}</h2>
                                    <p className="text-gray-500 font-medium">{editingClient ? 'Atualize os dados da cliente' : 'Preencha os dados da nova cliente'}</p>
                                </div>
                                <button onClick={handleCloseModal} className="p-2 hover:bg-gray-50 rounded-xl transition-colors">
                                    <X className="w-5 h-5 text-gray-400" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Nome Completo</label>
                                    <input
                                        type="text"
                                        name="name"
                                        required
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-brand-500 transition-all outline-none"
                                        placeholder="Ex: Beatriz Silva"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Telefone/WhatsApp</label>
                                        <input
                                            type="text"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-brand-500 transition-all outline-none text-sm"
                                            placeholder="(11) 99999-9999"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">E-mail</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-brand-500 transition-all outline-none text-sm"
                                            placeholder="beatriz@email.com"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Preferências (Cores/Marcas)</label>
                                    <textarea
                                        name="preferences"
                                        rows={3}
                                        value={formData.preferences}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-brand-500 transition-all outline-none text-sm resize-none"
                                        placeholder="Ex: Gosta de cores nudes, marca Risque..."
                                    ></textarea>
                                </div>

                                <div className="flex gap-4 pt-6">
                                    <button
                                        type="button"
                                        onClick={handleCloseModal}
                                        className="flex-1 py-3 bg-gray-50 text-gray-600 font-bold rounded-xl hover:bg-gray-100 transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSaving}
                                        className="flex-1 py-3 bg-brand-600 text-white font-bold rounded-xl hover:bg-brand-700 transition-all shadow-lg shadow-brand-200 active:scale-95 disabled:opacity-50"
                                    >
                                        {isSaving ? 'Salvando...' : editingClient ? 'Atualizar Cliente' : 'Salvar Cliente'}
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

export default Clients
