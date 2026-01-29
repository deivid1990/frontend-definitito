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
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none"></div>

            <div className="relative z-10 w-full max-w-md">
                <div className="text-center mb-10 group">
                    <div className="inline-flex justify-center items-center p-5 bg-black/50 border border-indigo-500/30 rounded-2xl shadow-[0_0_20px_rgba(79,70,229,0.2)] mb-6 group-hover:scale-110 transition-transform backdrop-blur-md">
                        <Lock className="text-indigo-400 h-10 w-10 shadow-indigo-500" />
                    </div>
                    <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter">Nueva <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Credencial</span></h1>
                    <p className="text-slate-500 font-mono text-[10px] tracking-[0.3em] uppercase mt-2">Actualización de Seguridad</p>
                </div>

                <div className="bg-zinc-900/80 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-2xl border border-white/10 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent"></div>

                    {message && (
                        <div className="text-center animate-in zoom-in-95 duration-500 py-4">
                            <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-emerald-500/20">
                                <CheckCircle size={32} className="text-emerald-400" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2 uppercase tracking-tight">Clave Sincronizada</h3>
                            <p className="text-slate-400 text-sm mb-8 font-medium">
                                Tu código de acceso ha sido actualizado en el núcleo central.
                            </p>
                            <div className="flex items-center justify-center gap-3 text-cyan-400 font-mono text-[10px] uppercase tracking-widest">
                                <Loader2 className="animate-spin" size={14} /> Redirigiendo al Dashboard
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="text-center animate-in fade-in duration-500 py-4">
                            <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-red-500/20">
                                <ShieldAlert size={32} className="text-red-400" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2 uppercase tracking-tight">Error de Validación</h3>
                            <p className="text-slate-400 text-sm mb-8 leading-relaxed font-medium">
                                {error}
                            </p>
                            <button
                                onClick={() => navigate('/login')}
                                className="block w-full py-4 bg-white text-black rounded-xl font-black uppercase tracking-widest hover:bg-zinc-200 transition-all shadow-lg active:scale-95"
                            >
                                Solicitar Nuevo Enlace
                            </button>
                        </div>
                    )}

                    {!message && !error && (
                        <form onSubmit={handleUpdate} className="space-y-6">
                            <div>
                                <label className="block text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em] mb-3 ml-1">Nueva Clave de Seguridad</label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-indigo-400 transition-colors" size={18} />
                                    <input
                                        type="password"
                                        required
                                        className="w-full bg-black/60 border border-zinc-800 focus:border-indigo-500/50 text-white pl-12 pr-4 py-4 rounded-xl outline-none transition-all placeholder:text-zinc-700 text-sm"
                                        placeholder="Mínimo 6 caracteres"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        minLength={6}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-xl transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-3 disabled:opacity-50 uppercase tracking-[0.2em] text-xs"
                            >
                                {isLoading ? <Loader2 className="animate-spin" /> : 'Sincronizar nueva Password'}
                            </button>

                            <p className="text-center text-[9px] text-zinc-600 uppercase tracking-widest leading-relaxed">
                                Al confirmar, se cerrarán todas las sesiones activas en otros dispositivos por seguridad.
                            </p>
                        </form>
                    )}
                </div>
            </div>
        </div>
    )
}
