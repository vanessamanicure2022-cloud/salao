import React, { useState, useEffect } from 'react'
import { Plus, Package, AlertCircle, ShoppingCart, Trash2, Edit2, Loader2, X, Search, Filter, Store, ExternalLink, Phone } from 'lucide-react'
import { supabase } from '../services/supabase'

interface InventoryItem {
    id: string
    name: string
    current_quantity: number
    min_quantity: number
    unit: string
    category: string
}

interface Distributor {
    id: string
    name: string
    address: string
    phone: string
    website: string
    description: string
}

const Inventory: React.FC = () => {
    const [items, setItems] = useState<InventoryItem[]>([])
    const [distributors, setDistributors] = useState<Distributor[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isLoadingDistributors, setIsLoadingDistributors] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isDistributorModalOpen, setIsDistributorModalOpen] = useState(false)
    const [editingItem, setEditingItem] = useState<InventoryItem | null>(null)
    const [filter, setFilter] = useState<'all' | 'low'>('all')
    const [searchTerm, setSearchTerm] = useState('')

    const [formData, setFormData] = useState({
        name: '',
        current_quantity: 0,
        min_quantity: 0,
        unit: 'un',
        category: 'Geral'
    })

    const fetchItems = async () => {
        setIsLoading(true)
        const { data, error } = await supabase
            .from('inventory')
            .select('*')
            .order('name', { ascending: true })

        if (data) setItems(data)
        if (error) console.error('Error fetching inventory:', error)
        setIsLoading(false)
    }

    useEffect(() => {
        fetchItems()
    }, [])

    const fetchDistributors = async () => {
        setIsLoadingDistributors(true)
        const { data, error } = await supabase
            .from('distributors')
            .select('*')
            .order('name', { ascending: true })

        if (data) setDistributors(data)
        if (error) console.error('Error fetching distributors:', error)
        setIsLoadingDistributors(false)
    }

    const handleOpenDistributors = () => {
        fetchDistributors()
        setIsDistributorModalOpen(true)
    }

    const handleOpenModal = (item?: InventoryItem) => {
        if (item) {
            setEditingItem(item)
            setFormData({
                name: item.name,
                current_quantity: item.current_quantity,
                min_quantity: item.min_quantity,
                unit: item.unit,
                category: item.category
            })
        } else {
            setEditingItem(null)
            setFormData({ name: '', current_quantity: 0, min_quantity: 0, unit: 'un', category: 'Geral' })
        }
        setIsModalOpen(true)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSaving(true)

        if (editingItem) {
            const { error } = await supabase
                .from('inventory')
                .update(formData)
                .eq('id', editingItem.id)

            if (error) alert('Erro ao atualizar: ' + error.message)
            else {
                setIsModalOpen(false)
                fetchItems()
            }
        } else {
            const { error } = await supabase
                .from('inventory')
                .insert([formData])

            if (error) alert('Erro ao salvar: ' + error.message)
            else {
                setIsModalOpen(false)
                fetchItems()
            }
        }
        setIsSaving(false)
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Deseja excluir este item do estoque?')) return
        const { error } = await supabase.from('inventory').delete().eq('id', id)
        if (error) alert('Erro ao excluir: ' + error.message)
        else fetchItems()
    }

    const filteredItems = items.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.category.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesStock = filter === 'all' || item.current_quantity <= item.min_quantity
        return matchesSearch && matchesStock
    })

    const lowStockCount = items.filter(item => item.current_quantity <= item.min_quantity).length

    return (
        <div className="max-w-6xl mx-auto pb-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Estoque de Materiais</h1>
                    <p className="text-sm text-gray-500">Controle o que você tem e o que precisa comprar</p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <button
                        onClick={handleOpenDistributors}
                        className="px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 bg-brand-50 text-brand-600 border border-brand-100 shadow-sm hover:bg-brand-100 transition-all"
                    >
                        <Store className="w-4 h-4" />
                        Distribuidores
                    </button>
                    <button
                        onClick={() => setFilter(filter === 'all' ? 'low' : 'all')}
                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${filter === 'low' ? 'bg-red-50 text-red-600 border border-red-100 shadow-sm' : 'bg-white border border-gray-100 text-gray-600'
                            }`}
                    >
                        <ShoppingCart className="w-4 h-4" />
                        {filter === 'low' ? 'Ver Tudo' : `Faltando (${lowStockCount})`}
                    </button>
                    <button
                        onClick={() => handleOpenModal()}
                        className="btn-primary flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        Novo Material
                    </button>
                </div>
            </div>

            <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Pesquisar materiais..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                    />
                </div>
                <div className="flex items-center gap-2 text-gray-400 text-sm font-medium px-4">
                    <Filter className="w-4 h-4" />
                    <span>{filteredItems.length} materiais encontrados</span>
                </div>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-10 h-10 animate-spin text-brand-600" />
                </div>
            ) : filteredItems.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-[2.5rem] border-2 border-dashed border-gray-100">
                    <Package className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">
                        {searchTerm ? 'Nenhum material encontrado para sua busca.' : filter === 'low' ? 'Nada na lista de compras! Seu estoque está em dia.' : 'Nenhum material cadastrado.'}
                    </p>
                </div>
            ) : (
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left min-w-[600px] md:min-w-0">
                            <thead className="bg-gray-50/50">
                                <tr>
                                    <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Material</th>
                                    <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">Quantidade</th>
                                    <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">Mínimo</th>
                                    <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Status</th>
                                    <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredItems.map(item => {
                                    const isLow = item.current_quantity <= item.min_quantity
                                    return (
                                        <tr key={item.id} className="hover:bg-gray-50/30 transition-colors group">
                                            <td className="px-8 py-5">
                                                <p className="font-bold text-gray-800">{item.name}</p>
                                                <p className="text-xs text-brand-500 uppercase font-bold tracking-tight">{item.category}</p>
                                            </td>
                                            <td className="px-8 py-5 text-center font-bold text-gray-700">
                                                <div className="flex flex-col items-center">
                                                    <span className={`text-lg ${isLow ? 'text-red-600' : 'text-gray-800'}`}>
                                                        {item.current_quantity}
                                                    </span>
                                                    <span className="text-[10px] text-gray-400 font-normal uppercase">{item.unit}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-center font-bold text-gray-400 group-hover:text-gray-500 transition-colors">
                                                {item.min_quantity}
                                            </td>
                                            <td className="px-8 py-5">
                                                {isLow ? (
                                                    <span className="flex items-center gap-1.5 text-red-600 font-bold text-[10px] uppercase bg-red-100/50 px-3 py-1.5 rounded-full w-fit border border-red-100">
                                                        <AlertCircle className="w-3.5 h-3.5" />
                                                        Reposição Necessária
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-1.5 text-green-600 font-bold text-[10px] uppercase bg-green-100/50 px-3 py-1.5 rounded-full w-fit border border-green-100">
                                                        Disponível
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => handleOpenModal(item)}
                                                        className="p-2.5 bg-gray-50 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-xl transition-all"
                                                        title="Editar"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(item.id)}
                                                        className="p-2.5 bg-gray-50 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                                        title="Excluir"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="p-8">
                            <div className="flex justify-between items-center mb-8">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-800">{editingItem ? 'Editar Material' : 'Novo Material'}</h2>
                                    <p className="text-gray-400 text-sm">Preencha os dados do material</p>
                                </div>
                                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-50 rounded-xl transition-colors">
                                    <X className="w-5 h-5 text-gray-400" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Nome do Material</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                                        placeholder="Ex: Esmalte Nude"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Quantidade Atual</label>
                                        <input
                                            type="number"
                                            required
                                            value={formData.current_quantity}
                                            onChange={(e) => setFormData({ ...formData, current_quantity: Number(e.target.value) })}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Quant. Mínima</label>
                                        <input
                                            type="number"
                                            required
                                            value={formData.min_quantity}
                                            onChange={(e) => setFormData({ ...formData, min_quantity: Number(e.target.value) })}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Unidade</label>
                                        <select
                                            value={formData.unit}
                                            onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                                        >
                                            <option value="un">Unidade</option>
                                            <option value="ml">ml</option>
                                            <option value="pct">Pacote</option>
                                            <option value="par">Par</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Categoria</label>
                                        <select
                                            value={formData.category}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                                        >
                                            <option value="Geral">Geral</option>
                                            <option value="Esmaltes">Esmaltes</option>
                                            <option value="Descartáveis">Descartáveis</option>
                                            <option value="Gel">Gel/Acrílico</option>
                                        </select>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="w-full btn-primary py-4 mt-6 flex justify-center items-center gap-2"
                                >
                                    {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : editingItem ? 'Salvar Edição' : 'Cadastrar Material'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {isDistributorModalOpen && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-2xl shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="p-8">
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                                        <Store className="w-6 h-6 text-brand-600" />
                                        Distribuidores Recomendados
                                    </h2>
                                    <p className="text-gray-400 text-sm">Lista de fornecedores em Guarulhos e SP (mais em conta)</p>
                                </div>
                                <button onClick={() => setIsDistributorModalOpen(false)} className="p-2 hover:bg-gray-50 rounded-xl">
                                    <X className="w-5 h-5 text-gray-400" />
                                </button>
                            </div>

                            {isLoadingDistributors ? (
                                <div className="flex justify-center py-10">
                                    <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
                                </div>
                            ) : distributors.length === 0 ? (
                                <div className="text-center py-10 border-2 border-dashed border-gray-100 rounded-3xl">
                                    <p className="text-gray-400">Nenhum distribuidor cadastrado ainda.</p>
                                    <p className="text-xs text-gray-300 mt-2">Dica: Rode o arquivo SQL de distribuidores!</p>
                                </div>
                            ) : (
                                <div className="max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                                    <div className="grid grid-cols-1 gap-4">
                                        {distributors.map(dist => (
                                            <div key={dist.id} className="p-5 bg-gray-50 rounded-3xl border border-gray-100 hover:border-brand-200 transition-colors group">
                                                <div className="flex justify-between items-start mb-3">
                                                    <h3 className="font-bold text-gray-800 text-lg">{dist.name}</h3>
                                                    {dist.website && (
                                                        <a
                                                            href={dist.website}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="p-2 bg-white text-brand-600 rounded-xl shadow-sm hover:bg-brand-50 transition-colors"
                                                        >
                                                            <ExternalLink className="w-4 h-4" />
                                                        </a>
                                                    )}
                                                </div>
                                                <p className="text-xs text-gray-500 mb-4 line-clamp-2">{dist.description}</p>
                                                <div className="flex flex-col gap-2">
                                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                                        <Package className="w-3.5 h-3.5 text-brand-400" />
                                                        <span className="truncate">{dist.address}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-xs font-bold text-brand-600">
                                                        <Phone className="w-3.5 h-3.5" />
                                                        {dist.phone}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Inventory
