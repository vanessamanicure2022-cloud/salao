import { supabase } from './supabase'

/**
 * Serviço de Notificação via WhatsApp
 * Integração preparada para Evolution API ou Z-API
 */

interface NotificationData {
    clientName: string;
    phone: string;
    date: string;
    time: string;
    serviceName: string;
    price: string;
    pixCode: string;
}

export const sendWhatsAppNotification = async (data: NotificationData) => {
    const apiUrl = import.meta.env.VITE_WHATSAPP_API_URL
    const apiKey = import.meta.env.VITE_WHATSAPP_API_KEY
    const instanceId = import.meta.env.VITE_WHATSAPP_INSTANCE_ID

    const message = `Olá, *${data.clientName}*! Confirmamos seu horário na Vanessa Cristina.
    
📅 Data: *${data.date}*
⏰ Hora: *${data.time}*
📍 Serviço: *${data.serviceName}*

--------------------------------
💎 Para garantir sua reserva: Realize o pagamento do valor de *${data.price}* via PIX abaixo.

🔑 *PIX Copia e Cola:*
${data.pixCode}

Após o pagamento, por favor envie o comprovante por aqui!`

    console.log('Enviando WhatsApp para:', data.phone)
    console.log('Mensagem:', message)

    if (!apiUrl || !apiKey || !instanceId) {
        console.warn('Configurações de WhatsApp ausentes. Apenas simulando envio no console.')
        return { success: true, simulated: true }
    }

    try {
        // Exemplo de chamada para Evolution API
        /*
        const response = await fetch(`${apiUrl}/message/sendText/${instanceId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': apiKey
            },
            body: JSON.stringify({
                number: data.phone.replace(/\D/g, ''),
                text: message
            })
        })
        return await response.json()
        */
        return { success: true }
    } catch (error) {
        console.error('Erro ao enviar WhatsApp:', error)
        return { success: false, error }
    }
}
