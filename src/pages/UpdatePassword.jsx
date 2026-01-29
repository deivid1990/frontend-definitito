import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { Lock, CheckCircle, ShieldAlert, Loader2 } from 'lucide-react'

export default function UpdatePassword() {
    const [password, setPassword] = useState('')
    const [message, setMessage] = useState(null)
    const [error, setError] = useState(null)
    const [isLoading, setIsLoading] = useState(false)
    const [isValidating, setIsValidating] = useState(true)
    const navigate = useNavigate()

    useEffect(() => {
        // Supabase procesa el hash de la URL (access_token) automáticamente.
        // Esperamos un momento para que el cliente se sincronice.
        const checkSession = async () => {
            // Intentar obtener sesión varias veces si es necesario (el procesamiento del hash puede tardar ms)
            for (let i = 0; i < 5; i++) {
                const { data: { session } } = await supabase.auth.getSession()
                if (session) {
                    setIsValidating(false)
                    return
                }
                await new Promise(r => setTimeout(r, 500))
            }

            setError('No se detectó una sesión de recuperación válida. Por favor, asegúrate de abrir el enlace desde el mismo navegador o solicita uno nuevo.')
            setIsValidating(false)
        }
        checkSession()
    }, [])

    const handleUpdate = async (e) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)
        setMessage(null)

        try {
            const { error } = await supabase.auth.updateUser({ password })
            if (error) throw error
            setMessage('✅ Contraseña actualizada correctamente. Redirigiendo...')
            setTimeout(() => navigate('/dashboard'), 2500)
        } catch (err) {
            setError(err.message)
        } finally {
            setIsLoading(false)
        }
    }

    if (isValidating) {
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
                <Loader2 className="animate-spin text-indigo-500" size={40} />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-zinc-950 relative flex items-center justify-center p-4 overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(79,70,229,0.1),transparent_50%)] pointer-events-none"></div>

            <div className="bg-zinc-900/80 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/10 w-full max-w-md shadow-2xl relative">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-indigo-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-indigo-500/30">
                        <Lock className="text-indigo-400 h-8 w-8" />
                    </div>
                    <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter">Nueva <span className="text-indigo-500">Clave</span></h1>
                    <p className="text-zinc-500 text-sm mt-2">Establece tu nuevo código de acceso neural</p>
                </div>

                {message && (
                    <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl text-sm font-bold flex items-center gap-3 animate-in fade-in">
                        <CheckCircle size={20} />
                        {message}
                    </div>
                )}

                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl text-sm font-bold flex items-center gap-3 animate-in shake-in">
                        <ShieldAlert size={20} />
                        {error}
                    </div>
                )}

                {!message && !error && (
                    <form onSubmit={handleUpdate} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Escribir Nueva Contraseña</label>
                            <input
                                type="password"
                                required
                                className="w-full bg-black/50 border border-zinc-800 text-white px-5 py-4 rounded-2xl focus:border-indigo-500 outline-none transition-all placeholder:text-zinc-700"
                                placeholder="Mínimo 6 caracteres"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                minLength={6}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-4 bg-white text-black font-black uppercase tracking-widest rounded-2xl hover:bg-indigo-500 hover:text-white transition-all shadow-xl active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isLoading ? <Loader2 className="animate-spin" /> : 'RE-ESTABLECER CLAVE'}
                        </button>
                    </form>
                )}

                {error && (
                    <button
                        onClick={() => navigate('/login')}
                        className="w-full py-4 text-zinc-500 font-bold uppercase tracking-widest text-[10px] hover:text-white transition-colors"
                    >
                        Volver al Inicio
                    </button>
                )}
            </div>
        </div>
    )
}
