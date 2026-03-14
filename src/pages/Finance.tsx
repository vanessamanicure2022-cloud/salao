import React, { useState, useEffect } from 'react'
import { TrendingUp, Wallet, PieChart, Calendar, Loader2, Edit2, Trash2, RefreshCcw } from 'lucide-react'
import { supabase } from '../services/supabase'
import { format, startOfMonth, endOfMonth } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface Transaction {
    id: string
    client: string
    service: string
    amount: number
    date: string
    payment_status: string
    payment_method: string
}

const Finance: React.FC = () => {
    const [isLoading, setIsLoading] = useState(true)
    const [stats, setStats] = useState([
        { label: 'Faturamento Mensal', value: 'R$ 0,00', icon: TrendingUp },
        { label: 'A Receber (Pendente)', value: 'R$ 0,00', icon: Wallet },
        { label: 'Total de Atendimentos', value: '0', icon: PieChart },
    ])
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [fetchingStatus, setFetchingStatus] = useState<string | null>(null)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [clients, setClients] = useState<any[]>([])
    const [services, setServices] = useState<any[]>([])
    const [editingData, setEditingData] = useState<any>(null)
    const [isSaving, setIsSaving] = useState(false)

    const fetchFinanceData = async () => {
        setIsLoading(true)
        const now = new Date()
        const monthStart = startOfMonth(now).toISOString()
        const monthEnd = endOfMonth(now).toISOString()

        const { data: appts, error } = await supabase
            .from('appointments')
            .select('*, client:clients(name), service:services(price, name)')
            .gte('start_time', monthStart)
            .lte('start_time', monthEnd)
            .order('start_time', { ascending: false })

        if (appts) {
            let totalRevenue = 0
            let pendingRevenue = 0
            const formattedTransactions: Transaction[] = appts.map(a => {
                const price = a.service?.price || 0
                if (a.payment_method === 'Troca') {
                    // Troca de serviço não entra no faturamento monetário
                } else if (a.payment_status === 'pago') {
                    totalRevenue += price
                } else {
                    pendingRevenue += price
                }
                return {
                    id: a.id,
                    client: a.client?.name || 'Cliente deletada',
                    service: a.service?.name || 'Serviço deletado',
                    amount: price,
                    date: format(new Date(a.start_time), "dd 'de' MMM, HH:mm", { locale: ptBR }),
                    payment_status: a.payment_status || 'pendente',
                    payment_method: a.payment_method || 'A definir'
                }
            })

            setTransactions(formattedTransactions)
            setStats([
                { label: 'Faturamento Mensal', value: `R$ ${totalRevenue.toFixed(2)}`, icon: TrendingUp },
                { label: 'A Receber (Pendente)', value: `R$ ${pendingRevenue.toFixed(2)}`, icon: Wallet },
                { label: 'Total de Atendimentos', value: appts.length.toString(), icon: PieChart },
            ])
        }

        if (error) console.error('Error fetching finance data:', error)

        // Also fetch clients and services for the edit modal
        const { data: cls } = await supabase.from('clients').select('id, name').order('name')
        if (cls) setClients(cls)
        const { data: svs } = await supabase.from('services').select('id, name, price').order('name')
        if (svs) setServices(svs)

        setIsLoading(false)
    }

    const handleEditClick = async (transactionId: string) => {
        setFetchingStatus(transactionId)
        const { data: appt, error } = await supabase
            .from('appointments')
            .select('*')
            .eq('id', transactionId)
            .single()

        if (appt) {
            const date = new Date(appt.start_time)
            setEditingData({
                id: appt.id,
                client_id: appt.client_id,
                service_id: appt.service_id,
                date: format(date, 'yyyy-MM-dd'),
                time: format(date, 'HH:mm'),
                payment_status: appt.payment_status,
                payment_method: appt.payment_method
            })
            setIsEditModalOpen(true)
        }
        setFetchingStatus(null)
    }

    const handleUpdateAppointment = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSaving(true)

        const start_time = new Date(`${editingData.date}T${editingData.time}:00`).toISOString()
        const end_time = new Date(new Date(start_time).getTime() + 60 * 60 * 1000).toISOString()

        const { error } = await supabase
            .from('appointments')
            .update({
                client_id: editingData.client_id,
                service_id: editingData.service_id,
                start_time,
                end_time,
                payment_status: editingData.payment_status,
                payment_method: editingData.payment_method
            })
            .eq('id', editingData.id)

        if (error) {
            alert('Erro ao salvar: ' + error.message)
        } else {
            await fetchFinanceData()
            setIsEditModalOpen(false)
            setEditingData(null)
        }
        setIsSaving(false)
    }

    const handleStatusToggle = async (id: string, currentStatus: string) => {
        const newStatus = currentStatus === 'pago' ? 'pendente' : 'pago'
        setFetchingStatus(id)

        const { error } = await supabase
            .from('appointments')
            .update({ payment_status: newStatus })
            .eq('id', id)

        if (error) {
            alert('Erro ao atualizar status: ' + error.message)
        } else {
            await fetchFinanceData()
        }
        setFetchingStatus(null)
    }

    const handleDeleteAppointment = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir este agendamento?')) return
        setFetchingStatus(id)

        const { error } = await supabase
            .from('appointments')
            .delete()
            .eq('id', id)

        if (error) {
            alert('Erro ao excluir: ' + error.message)
        } else {
            await fetchFinanceData()
        }
        setFetchingStatus(null)
    }

    useEffect(() => {
        fetchFinanceData()
    }, [])

    return (
        <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Financeiro</h1>
                    <p className="text-sm text-gray-500">Acompanhe seu faturamento e atendimentos real</p>
                </div>
                <div className="flex gap-4">
                    <button className="px-4 py-2 bg-white border border-gray-100 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-2 shadow-sm">
                        <Calendar className="w-4 h-4" />
                        {format(new Date(), 'MMMM yyyy', { locale: ptBR })}
                    </button>
                </div>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-10 h-10 animate-spin text-brand-600" />
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                        {stats.map((stat, idx) => (
                            <div key={idx} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                                <div className="flex items-center gap-4 mb-2">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${idx === 0 ? 'bg-green-50 text-green-600' :
                                        idx === 1 ? 'bg-yellow-50 text-yellow-600' : 'bg-brand-50 text-brand-600'
                                        }`}>
                                        <stat.icon className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
                                        <h4 className="text-2xl font-bold text-gray-800">{stat.value}</h4>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="font-bold text-gray-800">Últimos Atendimentos</h3>
                            <span className="hidden md:block text-xs text-gray-400 font-medium uppercase tracking-widest">Baseado em Agendamentos</span>
                        </div>
                        <div className="overflow-visible min-h-[300px]">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Cliente/Serviço</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Data</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Valor</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {transactions.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-10 text-center text-gray-400">Nenhuma movimentação este mês.</td>
                                        </tr>
                                    ) : (
                                        transactions.map(t => (
                                            <tr key={t.id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <p className="text-sm font-bold text-gray-800">{t.client}</p>
                                                    <p className="text-xs text-gray-400">{t.service}</p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-sm text-gray-600">{t.date}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${t.payment_method === 'Troca' ? 'bg-purple-100 text-purple-700' :
                                                        t.payment_status === 'pago' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                                        }`}>
                                                        {t.payment_method === 'Troca' ? 'Troca de Serviço' : `${t.payment_status} - ${t.payment_method}`}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <span className={`font-bold ${t.payment_method === 'Troca' ? 'text-purple-600 italic' : 'text-gray-800'}`}>
                                                        {t.payment_method === 'Troca' ? 'Permuta' : `R$ ${t.amount.toFixed(2)}`}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        {t.payment_method !== 'Troca' && (
                                                            <button
                                                                onClick={() => handleEditClick(t.id)}
                                                                title="Editar Atendimento"
                                                                disabled={fetchingStatus === t.id}
                                                                className={`p-2 rounded-xl border transition-all ${fetchingStatus === t.id ? 'opacity-50 cursor-not-allowed' :
                                                                    'bg-brand-50 border-brand-100 text-brand-600 hover:bg-brand-100'
                                                                    }`}
                                                            >
                                                                {fetchingStatus === t.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Edit2 className="w-4 h-4" />}
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => handleDeleteAppointment(t.id)}
                                                            disabled={fetchingStatus === t.id}
                                                            className={`p-2 bg-red-50 border border-red-100 text-red-600 rounded-xl hover:bg-red-100 transition-all ${fetchingStatus === t.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                            title="Excluir"
                                                        >
                                                            {fetchingStatus === t.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}

            {/* Modal Edição Rápida */}
            {isEditModalOpen && editingData && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl animate-in fade-in zoom-in duration-200 overflow-hidden">
                        <div className="p-8">
                            <div className="mb-6">
                                <h2 className="text-2xl font-bold text-gray-800">Editar Atendimento</h2>
                                <p className="text-gray-500 font-medium text-sm">Altere detalhes do atendimento e valores.</p>
                            </div>

                            <form onSubmit={handleUpdateAppointment} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Data</label>
                                        <input
                                            type="date"
                                            required
                                            value={editingData.date}
                                            onChange={(e) => setEditingData({ ...editingData, date: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Horário</label>
                                        <input
                                            type="time"
                                            required
                                            value={editingData.time}
                                            onChange={(e) => setEditingData({ ...editingData, time: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Cliente</label>
                                    <select
                                        required
                                        value={editingData.client_id}
                                        onChange={(e) => setEditingData({ ...editingData, client_id: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none appearance-none"
                                    >
                                        {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Serviço</label>
                                    <select
                                        required
                                        value={editingData.service_id}
                                        onChange={(e) => setEditingData({ ...editingData, service_id: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none appearance-none"
                                    >
                                        {services.map(s => <option key={s.id} value={s.id}>{s.name} - R$ {s.price.toFixed(2)}</option>)}
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Status</label>
                                        <select
                                            value={editingData.payment_status}
                                            onChange={(e) => setEditingData({ ...editingData, payment_status: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none"
                                        >
                                            <option value="pendente">Pendente</option>
                                            <option value="pago">Pago</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Forma</label>
                                        <select
                                            value={editingData.payment_method}
                                            onChange={(e) => setEditingData({ ...editingData, payment_method: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none"
                                        >
                                            <option value="PIX">PIX</option>
                                            <option value="Cartão">Cartão</option>
                                            <option value="Dinheiro">Dinheiro</option>
                                            <option value="Troca">Troca de Serviço</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-6">
                                    <button
                                        type="button"
                                        onClick={() => { setIsEditModalOpen(false); setEditingData(null); }}
                                        className="flex-1 py-4 text-gray-400 font-bold hover:text-gray-600 transition-colors"
                                    >
                                        Voltar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSaving}
                                        className="flex-[2] py-4 bg-amber-500 text-white font-bold rounded-2xl hover:bg-amber-600 transition-all shadow-lg shadow-amber-200 active:scale-95 disabled:opacity-50"
                                    >
                                        {isSaving ? 'Salvando...' : 'Salvar Alterações'}
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

export default Finance
