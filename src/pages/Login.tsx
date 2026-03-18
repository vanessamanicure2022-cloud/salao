import React, { useState } from 'react'
import { supabase } from '../services/supabase'
import { Mail, Lock, AlertCircle, Loader2 } from 'lucide-react'
import logo from '../assets/logo.png'

const Login: React.FC = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [isForgot, setIsForgot] = useState(false)
    const [forgotEmail, setForgotEmail] = useState('')
    const [forgotMessage, setForgotMessage] = useState<string | null>(null)

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (error) {
            setError(error.message)
            setIsLoading(false)
        } else {
            setIsLoading(false)
        }
    }

    const handleForgot = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setForgotMessage(null)
        const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
            redirectTo: window.location.origin + '/reset-password'
        })
        if (error) {
            setForgotMessage(error.message)
        } else {
            setForgotMessage('Email de redefinição enviado. Verifique sua caixa de entrada.')
        }
        setIsLoading(false)
    }

    return (
        <div className="min-h-screen bg-[#FDFBFB] flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-10">
                    <div className="inline-flex w-24 h-24 bg-white rounded-3xl items-center justify-center p-2 shadow-xl shadow-brand-100 mb-6 border border-gray-50">
                        <img src={logo} alt="Vanessa Cristina Logo" className="w-full h-full object-contain rounded-2xl" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-800 leading-tight">Vanessa Cristina</h1>
                    <p className="text-brand-500 font-medium tracking-wide">STUDIO NAILS - GESTÃO</p>
                </div>

                <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-gray-100 border border-gray-100">
                    <h2 className="text-xl font-bold text-gray-800 mb-6">Acesse sua conta</h2>

                    <form onSubmit={handleLogin} className="space-y-5">
                        {error && (
                            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-sm animate-shake">
                                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                <p>{error === 'Invalid login credentials' ? 'E-mail ou senha incorretos' : error}</p>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">E-mail</label>
                            <div className="relative">
                                <Mail className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all outline-none text-gray-800"
                                    placeholder="vanessa@exemplo.com"
                                />
                            </div>
                        </div>

                        {isForgot ? (
                            <form onSubmit={handleForgot} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">E-mail para redefinir senha</label>
                                    <div className="relative">
                                        <Mail className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                                        <input
                                            type="email"
                                            required
                                            value={forgotEmail}
                                            onChange={(e) => setForgotEmail(e.target.value)}
                                            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all outline-none text-gray-800"
                                            placeholder="vanessa@exemplo.com"
                                        />
                                    </div>
                                </div>
                                {forgotMessage && (
                                    <p className="text-center text-sm text-green-600">{forgotMessage}</p>
                                )}
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full py-4 bg-brand-600 text-white font-bold rounded-2xl hover:bg-brand-700 transition-all shadow-lg shadow-brand-200 disabled:opacity-50"
                                >
                                    {isLoading ? 'Enviando...' : 'Enviar link de redefinição'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setIsForgot(false); setForgotMessage(null); setForgotEmail(''); }}
                                    className="w-full py-2 text-gray-600"
                                >
                                    Voltar ao login
                                </button>
                            </form>
                        ) : (
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Senha</label>
                                <div className="relative">
                                    <Lock className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all outline-none text-gray-800"
                                        placeholder="••••••••"
                                    />
                                </div>
                                <p className="mt-2 text-right text-sm text-brand-600 cursor-pointer" onClick={() => setIsForgot(true)}>
                                    Esqueceu a senha?
                                </p>
                            </div>
                        )}

                        {!isForgot && (
                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full py-4 bg-brand-600 text-white font-bold rounded-2xl hover:bg-brand-700 transition-all shadow-lg shadow-brand-200 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Entrando...
                                        </>
                                    ) : 'Entrar no Sistema'}
                                </button>
                            </div>
                        )}
                    </form>
                </div>

                <p className="mt-8 text-center text-[10px] text-gray-400 font-medium uppercase tracking-widest">
                    arcsolucoesintegradas v0.1 beta
                </p>
                <p className="mt-2 text-center text-[10px] text-gray-400">
                    Vanessa Cristina Studio Nails &copy; 2026. Todos os direitos reservados.
                </p>
            </div>
        </div>
    )
}

export default Login
