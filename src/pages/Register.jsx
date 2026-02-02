import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Activity, Loader2, Play } from 'lucide-react'

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
            } else {
                setError("El servidor no devolvió datos de usuario.")
            }
        } catch (err) {
            setError(err.message || "Error al procesar el registro.")
        } finally {
            setIsLoading(false)
        }
    }

    if (isSubmitted) {
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
                <div className="bg-zinc-900/80 p-8 rounded-3xl text-center max-w-md border border-cyan-500/30">
                    <Activity className="text-cyan-400 h-12 w-12 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-white mb-4">¡Registro exitoso!</h2>
                    <p className="text-slate-400 mb-6">
                        Revisa tu correo para confirmar tu cuenta.
                    </p>

                    <Link
                        to="/login"
                        data-testid="go-to-login"
                        className="block w-full py-3 bg-cyan-600 text-white rounded-xl font-bold hover:bg-cyan-500"
                    >
                        VOLVER AL LOGIN
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-zinc-900/60 p-8 rounded-3xl border border-white/10">

                {error && (
                    <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-300 rounded-xl text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">

                    <div>
                        <label className="block text-cyan-400 text-xs mb-1">Nombre completo</label>
                        <input
                            type="text"
                            required
                            data-testid="register-fullname"
                            className="w-full bg-black/40 border border-zinc-800 text-white px-4 py-3 rounded-xl"
                            placeholder="JUAN PÉREZ"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-cyan-400 text-xs mb-1">Email</label>
                        <input
                            type="email"
                            required
                            data-testid="register-email"
                            className="w-full bg-black/40 border border-zinc-800 text-white px-4 py-3 rounded-xl"
                            placeholder="USUARIO@SISTEMA.COM"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-cyan-400 text-xs mb-1">Contraseña</label>
                        <input
                            type="password"
                            required
                            minLength={6}
                            data-testid="register-password"
                            className="w-full bg-black/40 border border-zinc-800 text-white px-4 py-3 rounded-xl"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        data-testid="register-submit"
                        className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-500 disabled:bg-zinc-800 flex justify-center items-center gap-2"
                    >
                        {isLoading ? <Loader2 className="animate-spin" /> : <>INICIAR SISTEMA <Play size={14} /></>}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-slate-500 text-sm">
                        ¿Ya tienes cuenta?{' '}
                        <Link
                            to="/login"
                            data-testid="link-login"
                            className="text-cyan-400 hover:text-cyan-300 font-bold"
                        >
                            ACCEDER AQUÍ
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}

