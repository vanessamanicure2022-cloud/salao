/**
 * Utilitário para gerar código PIX Copia e Cola estático
 * Para um sistema real, o ideal seria usar uma API de pagamento (Mercado Pago, Efí, etc)
 * para gerar QRCodes dinâmicos com confirmação de pagamento.
 */

export const generatePixCopyPaste = (amount: number, description: string, customKey?: string) => {
    const pixKey = customKey || import.meta.env.VITE_PIX_KEY || 'suachavepix@aqui.com'
    const merchantName = 'VANESSA CRISTINA'
    const merchantCity = 'SAO PAULO'

    // Formatação básica (Simplificada para demonstração)
    return `${pixKey} - VALOR: R$ ${amount.toFixed(2)} - REF: ${description}`
}

export const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(value)
}

export const formatDateBR = (dateStr: string) => {
    const date = new Date(dateStr)
    return new Intl.DateTimeFormat('pt-BR').format(date)
}
