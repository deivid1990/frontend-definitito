import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Mail, ArrowLeft, Loader2, Send, CheckCircle } from 'lucide-react'

export default function ForgotPassword() {
    const [email, setEmail] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(null)
    const [isSubmitted, setIsSubmitted] = useState(false)
    const { resetPassword } = useAuth()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)

        try {
            const { error } = await resetPassword(email)
            if (error) throw error
            setIsSubmitted(true)
        } catch (err) {
            setError(err.message || 'Error al enviar el correo de recuperación.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-zinc-950 relative flex items-center justify-center p-4 overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600"></div>
            <div className="absolute top-1/4 -left-20 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>
            <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>

            <div className="relative z-10 w-full max-w-md">
                <div className="text-center mb-10 group">
                    <div className="inline-flex justify-center items-center p-5 bg-black/50 border border-cyan-500/30 rounded-2xl shadow-[0_0_20px_rgba(6,182,212,0.2)] mb-6 group-hover:scale-110 transition-transform backdrop-blur-md">
                        <Mail className="text-cyan-400 h-10 w-10 shadow-cyan-500" />
                    </div>
                    <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter">Recuperar <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-500">Acceso</span></h1>
                    <p className="text-slate-500 font-mono text-[10px] tracking-[0.3em] uppercase mt-2">Protocolo de Restauración</p>
                </div>

                <div className="bg-zinc-900/80 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-2xl border border-white/10 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-50"></div>

                    {isSubmitted ? (
                        <div className="text-center animate-in zoom-in-95 duration-500">
                            <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-emerald-500/20">
                                <CheckCircle size={32} className="text-emerald-400" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2 uppercase tracking-tight">Transmisión Exitosa</h3>
                            <p className="text-slate-400 text-sm mb-8 leading-relaxed font-medium">
                                Si hay un núcleo de datos vinculado a <span className="text-white font-mono break-all">{email}</span>, recibirás un enlace de restauración en breve.
                                <br /><br />
                                <span className="text-[10px] text-zinc-500 italic">Revisa tu bandeja de SPAM si no lo encuentras.</span>
                            </p>
                            <Link to="/login" className="block w-full py-4 bg-white text-black rounded-xl font-black uppercase tracking-widest hover:bg-cyan-500 hover:text-white transition-all shadow-lg active:scale-95">
                                Volver al Inicio
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-cyan-400 text-[10px] font-black uppercase tracking-[0.2em] mb-3 ml-1">Frecuencia de Enlace (Email)</label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-cyan-400 transition-colors" size={18} />
                                    <input
                                        type="email"
                                        required
                                        className="w-full bg-black/60 border border-zinc-800 focus:border-cyan-500/50 text-white pl-12 pr-4 py-4 rounded-xl outline-none transition-all placeholder:text-zinc-700 text-sm"
                                        placeholder="usuario@sistema.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>

                            {error && (
                                <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-200 rounded-xl text-xs font-bold flex items-center gap-2 animate-in shake-1">
                                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_5px_red]"></div>
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-xl transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-3 disabled:opacity-50 uppercase tracking-[0.2em] text-xs"
                            >
                                {isLoading ? <Loader2 className="animate-spin" /> : <Send size={16} />}
                                {isLoading ? 'Transmitiendo...' : 'Solicitar Reseteo'}
                            </button>

                            <div className="text-center pt-2">
                                <Link to="/login" className="text-slate-500 hover:text-white text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-colors">
                                    <ArrowLeft size={14} /> Cancelar Operación
                                </Link>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    )
}
