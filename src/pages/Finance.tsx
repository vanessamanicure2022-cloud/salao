import React, { useState, useEffect } from 'react'
import { TrendingUp, Wallet, PieChart, Calendar, Loader2 } from 'lucide-react'
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
        setIsLoading(false)
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

                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="font-bold text-gray-800">Últimos Atendimentos</h3>
                            <span className="hidden md:block text-xs text-gray-400 font-medium uppercase tracking-widest">Baseado em Agendamentos</span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left min-w-[600px] md:min-w-0">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Cliente/Serviço</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Data</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Valor</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {transactions.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-10 text-center text-gray-400">Nenhuma movimentação este mês.</td>
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
                                                        {t.payment_method === 'Troca' ? 'Troca de Serviço' : t.payment_status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <span className={`font-bold ${t.payment_method === 'Troca' ? 'text-purple-600 italic' : 'text-gray-800'}`}>
                                                        {t.payment_method === 'Troca' ? 'Permuta' : `R$ ${t.amount.toFixed(2)}`}
                                                    </span>
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
        </div>
    )
}

export default Finance
