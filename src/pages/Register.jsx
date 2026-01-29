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
                // El perfil se creará automáticamente en el AuthContext 
                // una vez el usuario confirme su correo e inicie sesión (evitamos el 401).
                setIsSubmitted(true)
            }

        } catch (err) {
            setError(err.message || "Error al registrarse.")
        } finally {
            setIsLoading(false)
        }
    }

    if (isSubmitted) {
        return (
            <div className="min-h-screen bg-deep-space flex items-center justify-center p-4">
                <div className="bg-cyber-gray/90 backdrop-blur-xl p-8 rounded-3xl border border-neon-green/30 text-center max-w-md animate-in zoom-in-95">
                    <div className="inline-flex items-center justify-center p-4 rounded-full bg-neon-green/10 mb-6">
                        <Activity className="text-neon-green h-12 w-12" />
                    </div>
                    <h2 className="text-3xl font-black text-white mb-4 uppercase italic">¡Sistema Inicializado! GYMAI COACH</h2>
                    <p className="text-slate-300 mb-8 leading-relaxed">
                        Se ha enviado un correo de <span className="text-neon-green font-bold">confirmación y autenticación</span> a <span className="text-white font-mono">{email}</span>.
                        Por favor, verifica tu bandeja de entrada para activar tu cuenta.
                    </p>
                    <Link to="/login" className="block w-full py-4 bg-white text-black rounded-xl font-bold uppercase tracking-widest hover:bg-neon-green transition-all shadow-lg">
                        Ir al Acceso
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-deep-space relative flex items-center justify-center p-4 overflow-hidden">
            {/* Cyber Background */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-full h-[50vh] bg-gradient-to-t from-neon-purple/20 to-transparent pointer-events-none"></div>

            <div className="relative z-10 w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="inline-flex justify-center items-center p-4 rounded-full border-2 border-neon-green/30 bg-black/40 shadow-[0_0_20px_rgba(0,255,159,0.2)] mb-6 animate-pulse-slow">
                        <Activity className="text-neon-green h-10 w-10" />
                    </div>
                    <h1 className="text-4xl font-black text-white mb-2 uppercase italic tracking-tighter">
                        Crear <span className="text-neon-green">Cuenta</span>
                    </h1>
                    <p className="text-slate-400 font-mono text-xs tracking-widest">JOIN THE RESISTANCE</p>
                </div>

                <div className="bg-cyber-gray/90 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/10 relative">
                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-200 rounded-xl text-sm font-bold border-l-4 border-l-red-500">
                            ⚠ {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-neon-green text-[10px] font-bold uppercase tracking-wider mb-2 ml-1">Identidad (Nombre)</label>
                            <input
                                type="text"
                                required
                                className="input-field bg-black/50 focus:border-neon-green focus:ring-neon-green"
                                placeholder="Juan Pérez"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-neon-green text-[10px] font-bold uppercase tracking-wider mb-2 ml-1">Correo Electrónico</label>
                            <input
                                type="email"
                                required
                                className="input-field bg-black/50 focus:border-neon-green focus:ring-neon-green"
                                placeholder="usuario@futuro.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-neon-green text-[10px] font-bold uppercase tracking-wider mb-2 ml-1">Contraseña</label>
                            <input
                                type="password"
                                required
                                className="input-field bg-black/50 focus:border-neon-green focus:ring-neon-green"
                                placeholder="••••••••"
                                value={password}
                                minLength={6}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-4 rounded-xl flex justify-center items-center text-lg font-bold shadow-[0_0_15px_rgba(0,255,159,0.3)] hover:shadow-[0_0_30px_rgba(0,255,159,0.5)] mt-6 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white transition-all disabled:opacity-50 uppercase tracking-widest skew-x-[-5deg] hover:skew-x-0"
                        >
                            {isLoading ? <Loader2 className="animate-spin mr-2" /> : <Play size={20} className="mr-2 fill-current" />}
                            {isLoading ? 'Procesando...' : 'Iniciar Sistema'}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-white/5 text-center">
                        <p className="text-slate-500 text-sm">
                            ¿Ya registrado?{' '}
                            <Link to="/login" className="text-neon-green hover:underline font-bold inline-flex items-center gap-1 transition-colors">
                                ACCEDER <ArrowRight size={14} />
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}