import React, { useState, useEffect } from 'react'
import {
    ChevronLeft,
    ChevronRight,
    Plus,
    Clock,
} from 'lucide-react'
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameMonth, isSameDay, eachDayOfInterval } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { supabase } from '../services/supabase'
import { sendWhatsAppNotification } from '../services/whatsapp'
import { generatePixCopyPaste, formatCurrency, formatDateBR } from '../utils/pix'

interface Appointment {
    id: string;
    client_id: string;
    service_id: string;
    start_time: string;
    status: string;
    payment_status?: string;
    payment_method?: string;
    notified?: boolean;
    client?: { name: string; phone: string };
    service?: { name: string; price: number };
}

interface Client {
    id: string;
    name: string;
    phone: string;
}

interface Service {
    id: string;
    name: string;
    price: number;
}

interface AppointmentsProps {
    profile?: any;
}

const Appointments: React.FC<AppointmentsProps> = ({ profile }) => {
    const [currentDate, setCurrentDate] = useState(new Date())
    const [selectedDate, setSelectedDate] = useState(new Date())
    const [appointments, setAppointments] = useState<Appointment[]>([])
    const [clients, setClients] = useState<Client[]>([])
    const [services, setServices] = useState<Service[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isSaving, setIsSaving] = useState(false)

    // Form states
    const [formData, setFormData] = useState({
        client_id: '',
        service_id: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        time: '09:00',
        payment_status: 'pendente',
        payment_method: 'PIX'
    })

    const fetchAllData = async () => {
        setIsLoading(true)
        try {
            // Fetch appointments
            const { data: appts } = await supabase
                .from('appointments')
                .select('*, client:clients(name, phone), service:services(name, price)')
                .order('start_time', { ascending: true })

            if (appts) setAppointments(appts)

            // Fetch clients
            const { data: cls } = await supabase.from('clients').select('id, name, phone').order('name')
            if (cls) setClients(cls)

            // Fetch services
            const { data: svs } = await supabase.from('services').select('id, name, price').order('name')
            if (svs) setServices(svs)
        } catch (error) {
            console.error('Error fetching data:', error)
        }
        setIsLoading(false)
    }

    useEffect(() => {
        fetchAllData()
    }, [])

    const nextMonth = () => setCurrentDate(addMonths(currentDate, 1))
    const prevMonth = () => setCurrentDate(subMonths(currentDate, 1))

    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(monthStart)
    const startDate = startOfWeek(monthStart)
    const endDate = endOfWeek(monthEnd)

    const calendarDays = eachDayOfInterval({
        start: startDate,
        end: endDate
    })

    const daysOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

    const handleCreateAppointment = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSaving(true)

        const start_time = new Date(`${formData.date}T${formData.time}:00`).toISOString()
        const end_time = new Date(new Date(start_time).getTime() + 60 * 60 * 1000).toISOString()

        const { data, error } = await supabase
            .from('appointments')
            .insert([{
                client_id: formData.client_id,
                service_id: formData.service_id,
                start_time,
                end_time,
                status: 'Agendado',
                payment_status: formData.payment_status,
                payment_method: formData.payment_method
            }])
            .select('*, client:clients(name, phone), service:services(name, price)')
            .single()

        if (error) {
            alert('Erro ao agendar: ' + error.message)
        } else if (data) {
            // Trigger WhatsApp
            const client = clients.find(c => c.id === formData.client_id)
            const service = services.find(s => s.id === formData.service_id)

            if (client && service) {
                const pixCode = generatePixCopyPaste(service.price, `Reserva ${service.name}`, profile?.pix_key)
                await sendWhatsAppNotification({
                    clientName: client.name,
                    phone: client.phone,
                    date: formatDateBR(formData.date),
                    time: formData.time,
                    serviceName: service.name,
                    price: formatCurrency(service.price),
                    pixCode
                })

                setAppointments(prev => [...prev.map(a => a.id === data.id ? { ...a, notified: true } : a)])
                await fetchAllData() // Refresh list
            }

            setIsModalOpen(false)
            setFormData({ ...formData, client_id: '', service_id: '' })
        }
        setIsSaving(false)
    }

    const appointmentsToday = appointments.filter(appt =>
        isSameDay(new Date(appt.start_time), new Date())
    )

    return (
        <div className="max-w-6xl mx-auto pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Agendamentos</h1>
                    <p className="text-sm text-gray-500">Gerencie seus horários para {format(currentDate, 'MMMM yyyy', { locale: ptBR })}</p>
                </div>
                <div className="flex items-center gap-2 md:gap-4 overflow-x-auto pb-1">
                    <div className="flex bg-white rounded-xl shadow-sm border border-gray-100">
                        <button onClick={prevMonth} className="p-2 hover:bg-gray-50 border-r border-gray-100 transition-colors">
                            <ChevronLeft className="w-5 h-5 text-gray-600" />
                        </button>
                        <button onClick={nextMonth} className="p-2 hover:bg-gray-50 transition-colors">
                            <ChevronRight className="w-5 h-5 text-gray-600" />
                        </button>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="btn-primary flex items-center gap-2 whitespace-nowrap"
                    >
                        <Plus className="w-5 h-5" />
                        Novo Agendamento
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-12 gap-6 md:gap-8">
                <div className="col-span-12 lg:col-span-9 hidden md:block">
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                        <div className="grid grid-cols-7 mb-2">
                            {daysOfWeek.map(day => (
                                <div key={day} className="text-center text-sm font-semibold text-gray-400 uppercase tracking-wider py-2">
                                    {day}
                                </div>
                            ))}
                        </div>
                        <div className="grid grid-cols-7 border-t border-l border-gray-100 rounded-xl overflow-hidden shadow-sm">
                            {calendarDays.map((day, idx) => {
                                const dayAppts = appointments.filter(appt => isSameDay(new Date(appt.start_time), day))
                                return (
                                    <div
                                        key={idx}
                                        onClick={() => setSelectedDate(day)}
                                        className={`min-h-[140px] p-4 border-r border-b border-gray-100 transition-all cursor-pointer group
                                            ${!isSameMonth(day, monthStart) ? 'bg-gray-50/50' : 'bg-white'}
                                            ${isSameDay(day, selectedDate) ? 'bg-brand-50/30' : 'hover:bg-brand-50/10'}
                                        `}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <span className={`text-sm font-medium ${isSameDay(day, new Date())
                                                ? 'bg-brand-600 text-white w-7 h-7 flex items-center justify-center rounded-full'
                                                : isSameMonth(day, monthStart) ? 'text-gray-700' : 'text-gray-300'
                                                }`}>
                                                {format(day, 'd')}
                                            </span>
                                            {dayAppts.length > 0 && (
                                                <div className="w-1.5 h-1.5 rounded-full bg-brand-500"></div>
                                            )}
                                        </div>

                                        <div className="space-y-1">
                                            {dayAppts.map(appt => (
                                                <div key={appt.id} className="text-[10px] bg-brand-50 text-brand-700 p-1 rounded border-l-2 border-brand-500 truncate font-medium flex items-center justify-between">
                                                    <span>{format(new Date(appt.start_time), 'HH:mm')} {appt.client?.name.split(' ')[0]}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>

                <div className="col-span-12 lg:col-span-3 space-y-6">
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <Clock className="w-5 h-5 text-brand-500" />
                            Próximos Hoje
                        </h3>
                        <div className="space-y-4">
                            {isLoading ? (
                                <p className="text-center py-4 text-gray-400 text-sm">Carregando...</p>
                            ) : appointmentsToday.length === 0 ? (
                                <p className="text-center py-4 text-gray-400 text-sm">Nenhum agendamento para hoje.</p>
                            ) : (
                                appointmentsToday.map(appt => (
                                    <div key={appt.id} className="p-3 rounded-2xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100 cursor-pointer">
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="text-sm font-bold text-gray-800">{format(new Date(appt.start_time), 'HH:mm')}</span>
                                            <div className="flex items-center gap-1">
                                                {appt.notified && <span className="text-[10px] text-green-600 font-bold">✓ ENVIADO</span>}
                                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase
                                                    ${appt.payment_status === 'pago' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}
                                                `}>
                                                    {appt.payment_status === 'pago' ? 'PAGO' : 'PENDENTE'}
                                                </span>
                                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase
                                                    ${appt.status === 'Agendado' ? 'bg-blue-100 text-blue-700' : 'bg-brand-100 text-brand-700'}
                                                `}>
                                                    {appt.status}
                                                </span>
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-600 font-medium">{appt.client?.name}</p>
                                        <p className="text-xs text-gray-400">{appt.service?.name}</p>
                                    </div>
                                ))
                            )}
                        </div>
                        <button className="w-full mt-6 py-3 text-sm font-semibold text-brand-600 hover:text-brand-700 transition-colors">
                            Ver todos agendamentos
                        </button>
                    </div>

                    <div className="bg-brand-600 p-6 rounded-3xl shadow-lg shadow-brand-100 text-white relative overflow-hidden group">
                        <div className="relative z-10">
                            <h4 className="font-bold mb-1">Dica do Dia</h4>
                            <p className="text-xs text-brand-100 leading-relaxed">
                                Mantenha o histórico de cores atualizado para surpreender suas clientes!
                            </p>
                        </div>
                        <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform"></div>
                    </div>
                </div>
            </div>

            {/* Modal Novo Agendamento */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl animate-in fade-in zoom-in duration-200 overflow-hidden">
                        <div className="p-8">
                            <div className="mb-6">
                                <h2 className="text-2xl font-bold text-gray-800">Novo Agendamento</h2>
                                <p className="text-gray-500 font-medium text-sm">A cliente receberá detalhes e PIX por WhatsApp.</p>
                            </div>

                            <form onSubmit={handleCreateAppointment} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Data</label>
                                        <input
                                            type="date"
                                            required
                                            value={formData.date}
                                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Horário</label>
                                        <input
                                            type="time"
                                            required
                                            value={formData.time}
                                            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Cliente</label>
                                    <select
                                        required
                                        value={formData.client_id}
                                        onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none transition-all appearance-none"
                                    >
                                        <option value="">Escolha a cliente...</option>
                                        {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Serviço</label>
                                    <select
                                        required
                                        value={formData.service_id}
                                        onChange={(e) => setFormData({ ...formData, service_id: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none transition-all appearance-none"
                                    >
                                        <option value="">Escolha o serviço...</option>
                                        {services.map(s => <option key={s.id} value={s.id}>{s.name} - {formatCurrency(s.price)}</option>)}
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Pagamento</label>
                                        <select
                                            value={formData.payment_status}
                                            onChange={(e) => setFormData({ ...formData, payment_status: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                                        >
                                            <option value="pendente">Pendente</option>
                                            <option value="pago">Pago</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Forma</label>
                                        <select
                                            value={formData.payment_method}
                                            onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none transition-all"
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
                                        onClick={() => setIsModalOpen(false)}
                                        className="flex-1 py-4 text-gray-400 font-bold hover:text-gray-600 transition-colors"
                                    >
                                        Voltar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSaving}
                                        className="flex-[2] py-4 bg-brand-600 text-white font-bold rounded-2xl hover:bg-brand-700 transition-all shadow-lg shadow-brand-200 active:scale-95 disabled:opacity-50"
                                    >
                                        {isSaving ? 'Processando...' : 'Confirmar e Notificar'}
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

export default Appointments
