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

            // Redirige tras login exitoso
            navigate('/dashboard')
        } catch (err) {
            console.error('Error de login:', err)
            const msg = err.message || ''
            if (msg.includes('Invalid login')) {
                setError('Credenciales incorrectas. Verifica tu email y clave.')
            } else if (msg.includes('Email not confirmed')) {
                setError('Confirma tu email antes de acceder.')
            } else if (msg.includes('rate limit')) {
                setError('Demasiados intentos. Intenta más tarde.')
            } else {
                setError(msg || 'Error de autenticación.')
            }
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-zinc-950 relative flex items-center justify-center p-4 overflow-hidden">
            <img
                src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop"
                className="absolute inset-0 w-full h-full object-cover opacity-20 scale-110 blur-sm"
                alt="Gym Background"
            />

            <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/80 via-zinc-950/40 to-zinc-950/90"></div>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600"></div>

            <div className="relative z-10 w-full max-w-md px-4">
                <div className="text-center mb-8">
                    <div className="inline-flex justify-center items-center p-5 bg-black/50 border border-cyan-500/30 rounded-2xl mb-6">
                        <Zap className="text-cyan-400 h-12 w-12" />
                    </div>
                    <h1 className="text-4xl font-black text-white mb-2 italic tracking-tighter">
                        GYM<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">AI</span> COACH
                    </h1>
                    <p className="text-slate-400 text-xs font-mono uppercase tracking-widest">
                        Sistema de Entrenamiento V2.0
                    </p>
                </div>

                <div className="bg-zinc-900/80 p-8 rounded-3xl shadow-2xl border border-white/10">
                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 text-red-200 rounded-xl text-sm font-bold">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-cyan-400 text-xs font-bold uppercase mb-2">
                                Credencial de Acceso
                            </label>
                            <input
                                type="email"
                                required
                                data-testid="login-email"
                                className="w-full bg-black/60 border border-zinc-700 focus:border-cyan-500 text-white p-3 rounded-xl outline-none"
                                placeholder="usuario@sistema.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-cyan-400 text-xs font-bold uppercase mb-2">
                                Clave de Seguridad
                            </label>
                            <input
                                type="password"
                                required
                                data-testid="login-password"
                                className="w-full bg-black/60 border border-zinc-700 focus:border-cyan-500 text-white p-3 rounded-xl outline-none"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            data-testid="login-submit"
                            className="w-full py-4 bg-cyan-600 hover:bg-cyan-500 disabled:bg-zinc-700 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                        >
                            {isLoading ? <Loader2 className="animate-spin" /> : 'Acceder al Sistema'}
                            {!isLoading && <ArrowRight size={20} />}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-white/5 text-center">
                        <p className="text-slate-500 text-sm">
                            ¿Sin credenciales?{' '}
                            <Link to="/register" className="text-cyan-400 font-bold">
                                REGISTRARSE <Lock size={14} />
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

