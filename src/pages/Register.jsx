import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabaseClient'
import { Activity, ArrowRight, Loader2, Play } from 'lucide-react'

export default function Register() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [fullName, setFullName] = useState('')
    const [isSubmitted, setIsSubmitted] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(null)

    const { signUp } = useAuth()
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)

        try {
            const { data, error: authError } = await signUp(email, password, { full_name: fullName })

            if (authError) throw authError

            if (data?.user) {
                setIsSubmitted(true)
            }
        } catch (err) {
            console.error('Error de registro:', err)
            const msg = err.message || ""
            if (msg.includes("User already registered")) {
                setError('Este correo ya está registrado. Intenta iniciar sesión.')
            } else if (msg.includes("Password should be")) {
                setError('La contraseña es demasiado débil (mínimo 6 caracteres).')
            } else {
                setError(msg || "Error al procesar el registro en el servidor.")
            }
        } finally {
            setIsLoading(false)
        }
    }

    if (isSubmitted) {
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
                <div className="bg-zinc-900/80 backdrop-blur-xl p-8 rounded-[2.5rem] border border-cyan-500/30 text-center max-w-md shadow-2xl animate-in zoom-in-95">
                    <div className="inline-flex items-center justify-center p-5 rounded-2xl bg-cyan-500/10 mb-6 border border-cyan-500/20">
                        <Activity className="text-cyan-400 h-12 w-12 drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]" />
                    </div>
                    <h2 className="text-3xl font-black text-white mb-4 italic uppercase tracking-tighter">¡SISTEMA INICIALIZADO!</h2>
                    <p className="text-slate-400 mb-8 leading-relaxed font-medium">
                        Se ha enviado un correo de <span className="text-cyan-400 font-bold">confirmación</span> a:
                        <br />
                        <span className="text-white font-mono text-sm break-all">{email}</span>
                        <br /><br />
                        <span className="text-xs italic bg-white/5 py-2 px-4 rounded-lg block">
                            Revisa tu bandeja de entrada y spam. Debes activar el enlace para poder entrar al sistema.
                        </span>
                    </p>
                    <Link to="/login" className="block w-full py-4 bg-cyan-600 text-white rounded-xl font-bold uppercase tracking-widest hover:bg-cyan-500 transition-all shadow-lg shadow-cyan-500/20">
                        VOLVER AL LOGIN
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-zinc-950 relative flex items-center justify-center p-4 overflow-hidden">
            {/* Background Image Layer */}
            <img
                src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop"
                className="absolute inset-0 w-full h-full object-cover opacity-20 scale-110 blur-sm"
                alt="Gym Background"
            />

            {/* Background Blur Effects */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600"></div>
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none"></div>

            <div className="relative z-10 w-full max-w-md">
                <div className="text-center mb-8 group">
                    <div className="inline-flex justify-center items-center p-4 bg-black/50 border border-cyan-500/30 rounded-2xl shadow-[0_0_20px_rgba(6,182,212,0.2)] mb-6 group-hover:scale-110 transition-transform backdrop-blur-md">
                        <Activity className="text-cyan-400 h-10 w-10" />
                    </div>
                    <h1 className="text-4xl font-black text-white mb-2 italic uppercase tracking-tighter">
                        Nueva <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-500">Identidad</span>
                    </h1>
                    <p className="text-slate-500 font-mono text-[10px] tracking-[0.3em] uppercase">Phase 1: Registration</p>
                </div>

                <div className="bg-zinc-900/60 backdrop-blur-2xl p-6 sm:p-8 rounded-3xl shadow-2xl border border-white/10 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent"></div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 text-red-200 rounded-xl text-xs font-bold flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_5px_red]"></div>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-cyan-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2 ml-1">Firma Real (Nombre)</label>
                            <input
                                type="text"
                                required
                                className="w-full bg-black/40 border border-zinc-800 focus:border-cyan-500/50 text-white px-4 py-3 rounded-xl outline-none transition-all placeholder:text-zinc-600 text-sm"
                                placeholder="JUAN PÉREZ"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-cyan-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2 ml-1">Canal de Enlace (Email)</label>
                            <input
                                type="email"
                                required
                                className="w-full bg-black/40 border border-zinc-800 focus:border-cyan-500/50 text-white px-4 py-3 rounded-xl outline-none transition-all placeholder:text-zinc-600 text-sm"
                                placeholder="USUARIO@SISTEMA.COM"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-cyan-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2 ml-1">Clave de Encriptación</label>
                            <input
                                type="password"
                                required
                                className="w-full bg-black/40 border border-zinc-800 focus:border-cyan-500/50 text-white px-4 py-3 rounded-xl outline-none transition-all placeholder:text-zinc-600 text-sm"
                                placeholder="••••••••"
                                value={password}
                                minLength={6}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-800 text-white font-black rounded-xl shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 group mt-4 uppercase tracking-[0.2em] text-xs"
                        >
                            {isLoading ? <Loader2 className="animate-spin" /> : <>INICIAR SISTEMA <Play size={14} className="fill-current" /></>}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-white/5 text-center">
                        <p className="text-slate-500 text-xs font-medium">
                            ¿IDENTIDAD EXISTENTE?{' '}
                            <Link to="/login" className="text-cyan-400 hover:text-cyan-300 font-bold transition-colors">
                                ACCEDER AQUÍ
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
