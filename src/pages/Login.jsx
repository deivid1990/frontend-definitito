import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Zap, ArrowRight, Lock, Loader2 } from 'lucide-react'

export default function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState(null)
    const [isLoading, setIsLoading] = useState(false)

    const { signIn } = useAuth()
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)

        try {
            const { error: signInError } = await signIn(email, password)
            if (signInError) throw signInError

            // Redirigimos al dashboard tras el éxito
            navigate('/dashboard')
        } catch (err) {
            console.error('Error de login:', err)
            // Manejo de errores amigable
            if (err.message.includes("Invalid login")) {
                setError('Credenciales incorrectas. Verifica tu email y clave.')
            } else if (err.message.includes("Email not confirmed")) {
                setError('Por favor, confirma tu email antes de acceder.')
            } else {
                setError('Error de conexión con el sistema.')
            }
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-zinc-950 relative flex items-center justify-center p-4 overflow-hidden">
            {/* Background Image Layer */}
            <img
                src="/C:/Users/david/.gemini/antigravity/brain/532fc4f2-147b-4305-be2a-8335abf4f387/futuristic_gym_interior_1769365562331.png"
                className="absolute inset-0 w-full h-full object-cover opacity-20 scale-110 blur-sm"
                alt="Gym Background"
            />

            {/* Fondo Cyberpunk y Efectos de Luz */}
            <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/80 via-zinc-950/40 to-zinc-950/90 pointer-events-none"></div>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600"></div>

            {/* Brillos (Blobs) de fondo */}
            <div className="absolute top-1/4 -left-20 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>
            <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>

            <div className="relative z-10 w-full max-w-md px-4">
                {/* Logo y Encabezado */}
                <div className="text-center mb-8 sm:mb-10 group">
                    <div className="inline-flex justify-center items-center p-4 sm:p-5 bg-black/50 border border-cyan-500/30 rounded-xl sm:rounded-2xl shadow-[0_0_20px_rgba(6,182,212,0.2)] mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300 backdrop-blur-md">
                        <Zap className="text-cyan-400 h-10 w-10 sm:h-12 sm:w-12 drop-shadow-[0_0_10px_rgba(6,182,212,0.8)]" />
                    </div>
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-2 tracking-tighter italic">
                        GYM<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">AI</span> COACH
                    </h1>
                    <p className="text-slate-400 text-xs sm:text-sm font-mono tracking-widest uppercase">Sistema de Entrenamiento V2.0</p>
                </div>

                {/* Tarjeta de Formulario */}
                <div className="bg-zinc-900/80 backdrop-blur-xl p-6 sm:p-8 rounded-2xl sm:rounded-3xl shadow-2xl border border-white/10 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-50"></div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 text-red-200 rounded-xl text-sm font-bold flex items-center gap-2 animate-pulse">
                            <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_10px_red]"></div>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-cyan-400 text-xs font-bold uppercase tracking-wider mb-2 ml-1">Credencial de Acceso</label>
                            <input
                                type="email"
                                required
                                className="w-full bg-black/60 border border-zinc-700 focus:border-cyan-500 text-white p-3 rounded-xl outline-none transition-all placeholder:text-zinc-600"
                                placeholder="usuario@sistema.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-cyan-400 text-xs font-bold uppercase tracking-wider mb-2 ml-1">Clave de Seguridad</label>
                            <input
                                type="password"
                                required
                                className="w-full bg-black/60 border border-zinc-700 focus:border-cyan-500 text-white p-3 rounded-xl outline-none transition-all placeholder:text-zinc-600"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        <div className="flex justify-end">
                            <Link
                                to="/forgot-password"
                                className="text-xs text-slate-500 hover:text-purple-400 transition-colors font-mono"
                            >
                                ¿OLVIDASTE TU CLAVE?
                            </Link>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-4 bg-cyan-600 hover:bg-cyan-500 disabled:bg-zinc-700 text-white font-bold rounded-xl shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2 group relative overflow-hidden"
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                {isLoading ? <Loader2 className="animate-spin" /> : 'Acceder al Sistema'}
                                {!isLoading && <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />}
                            </span>
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-white/5 text-center">
                        <p className="text-slate-500 text-sm">
                            ¿Sin credenciales?{' '}
                            <Link to="/register" className="text-cyan-400 hover:text-emerald-400 font-bold inline-flex items-center gap-1 transition-colors group">
                                REGISTRARSE <Lock size={14} />
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}