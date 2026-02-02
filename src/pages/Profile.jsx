import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import { User, Loader2, CheckCircle, History, X } from 'lucide-react'
import ConfirmModal from '../components/ConfirmModal'

export default function Profile() {
    const { user } = useAuth()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [profile, setProfile] = useState({
        full_name: '',
        age: '',
        weight: '',
        height: '',
        fitness_level: 'Principiante',
        goal: 'Salud'
    })
    const [showSuccess, setShowSuccess] = useState(false)

    const [history, setHistory] = useState([])
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null })

    useEffect(() => {
        if (user) {
            getProfile()
            fetchHistory()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user])

    const fetchHistory = async () => {
        try {
            const { data, error } = await supabase
                .from('biometric_history')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })

            if (error) throw error
            setHistory(data || [])
        } catch (error) {
            console.error('Error fetching history:', error)
        }
    }

    const getProfile = async () => {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single()

            if (error && error.code !== 'PGRST116') {
                throw error
            }

            if (data) {
                setProfile({
                    full_name: data.full_name || '',
                    age: data.age || '',
                    weight: data.weight || '',
                    height: data.height || '',
                    fitness_level: data.fitness_level || 'Principiante',
                    goal: data.goal || 'Salud'
                })
            }
        } catch (error) {
            console.error('Error fetching profile:', error)
        } finally {
            setLoading(false)
        }
    }

    const updateProfile = async (e) => {
        e.preventDefault()
        if (!profile.full_name) {
            alert('El nombre es obligatorio')
            return
        }

        try {
            setSaving(true)
            setShowSuccess(false)

            const updates = {
                id: user.id,
                full_name: profile.full_name,
                age: profile.age,
                weight: profile.weight,
                height: profile.height,
                fitness_level: profile.fitness_level,
                goal: profile.goal
            }

            const { error: profileError } = await supabase.from('profiles').upsert(updates)
            if (profileError) throw profileError

            const historyEntry = {
                user_id: user.id,
                weight: profile.weight,
                height: profile.height,
                age: profile.age,
                fitness_level: profile.fitness_level,
                goal: profile.goal
            }

            const { error: historyError } = await supabase.from('biometric_history').insert([historyEntry])
            if (historyError) console.error('Error guardando historial:', historyError)

            setShowSuccess(true)
            fetchHistory()
            setTimeout(() => setShowSuccess(false), 5000)
        } catch (error) {
            alert('❌ Error: ' + error.message)
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async () => {
        if (!deleteModal.id) return
        try {
            const { error } = await supabase
                .from('biometric_history')
                .delete()
                .eq('id', deleteModal.id)

            if (error) throw error
            setHistory(prev => prev.filter(entry => entry.id !== deleteModal.id))
            setDeleteModal({ isOpen: false, id: null })
        } catch (error) {
            alert('Error eliminando registro: ' + error.message)
        }
    }

    const handleChange = (e) => {
        setProfile({ ...profile, [e.target.name]: e.target.value })
    }

    return (
        <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-10 pb-16 sm:pb-24 animate-fade-up space-y-8 sm:space-y-12">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-start gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white mb-2 flex items-center gap-3 sm:gap-4 italic uppercase tracking-tighter">
                        <User className="text-indigo-500" size={24} /> Mis <span className="text-indigo-500">Biometrías</span>
                    </h1>
                    <p className="text-zinc-500 font-medium font-mono text-[10px] sm:text-xs uppercase tracking-widest">
                        Sincronización de parámetros vitales con el núcleo AI
                    </p>
                </div>

                {showSuccess && (
                    <div
                        data-testid="profile-success"
                        className="bg-emerald-500 text-black px-4 sm:px-6 py-2 sm:py-3 rounded-xl sm:rounded-2xl font-black text-[9px] sm:text-[10px] uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(16,185,129,0.4)] animate-in zoom-in slide-in-from-right-10 flex items-center gap-2 sm:gap-3"
                    >
                        <CheckCircle size={16} className="sm:w-[18px] sm:h-[18px]" /> ¡REGISTRO EXITOSO!
                    </div>
                )}
            </div>

            {loading ? (
                <div className="bg-zinc-900/40 backdrop-blur-xl p-12 sm:p-20 rounded-2xl sm:rounded-[2.5rem] border border-white/5 text-center text-zinc-600 animate-pulse">
                    <Loader2 className="animate-spin mx-auto mb-4 sm:mb-6 text-indigo-500" size={40} />
                    <p className="font-mono text-[9px] sm:text-[10px] tracking-widest uppercase">Escaneando Enlace Neuronal...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12">
                    {/* FORMULARIO */}
                    <div className="bg-zinc-900/60 backdrop-blur-2xl p-6 sm:p-8 rounded-2xl sm:rounded-[3rem] border border-white/5 shadow-2xl relative overflow-hidden h-fit">
                        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent"></div>

                        <h2 className="text-indigo-400 font-black uppercase text-[9px] sm:text-[10px] tracking-[0.3em] sm:tracking-[0.4em] mb-6 sm:mb-8 flex items-center gap-2">
                            ACTUALIZAR ESTADO
                        </h2>

                        <form onSubmit={updateProfile} className="space-y-5 sm:space-y-6">
                            <div className="space-y-3 sm:space-y-4">
                                <label className="block text-zinc-500 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] ml-1">
                                    Firma del Atleta
                                </label>
                                <input
                                    name="full_name"
                                    data-testid="input-name"
                                    value={profile.full_name}
                                    onChange={handleChange}
                                    className="w-full bg-black/40 border border-white/5 text-white rounded-xl sm:rounded-2xl px-4 sm:px-5 py-3 sm:py-4 focus:border-indigo-500 outline-none transition-all font-bold text-sm sm:text-base"
                                    placeholder="Nombre Completo"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3 sm:gap-4">
                                <div className="space-y-2">
                                    <label className="block text-zinc-500 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] ml-1">
                                        Edad
                                    </label>
                                    <input
                                        type="number"
                                        name="age"
                                        data-testid="input-age"
                                        value={profile.age}
                                        onChange={handleChange}
                                        className="w-full bg-black/40 border border-white/5 text-white rounded-xl sm:rounded-2xl px-4 sm:px-5 py-3 sm:py-4 focus:border-indigo-500 outline-none transition-all font-mono font-bold text-sm sm:text-base"
                                        placeholder="25"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-zinc-500 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] ml-1">
                                        Peso (kg)
                                    </label>
                                    <input
                                        type="number"
                                        name="weight"
                                        data-testid="input-weight"
                                        value={profile.weight}
                                        onChange={handleChange}
                                        className="w-full bg-black/40 border border-white/5 text-white rounded-xl sm:rounded-2xl px-4 sm:px-5 py-3 sm:py-4 focus:border-indigo-500 outline-none transition-all font-mono font-bold text-sm sm:text-base"
                                        placeholder="70"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 sm:gap-4">
                                <div className="space-y-2">
                                    <label className="block text-zinc-500 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] ml-1">
                                        Estatura (cm)
                                    </label>
                                    <input
                                        type="number"
                                        name="height"
                                        data-testid="input-height"
                                        value={profile.height}
                                        onChange={handleChange}
                                        className="w-full bg-black/40 border border-white/5 text-white rounded-xl sm:rounded-2xl px-4 sm:px-5 py-3 sm:py-4 focus:border-indigo-500 outline-none transition-all font-mono font-bold text-sm sm:text-base"
                                        placeholder="175"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-zinc-500 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] ml-1">
                                        Objetivo
                                    </label>
                                    <select
                                        name="goal"
                                        value={profile.goal}
                                        onChange={handleChange}
                                        className="w-full bg-black/40 border border-white/5 text-white rounded-xl sm:rounded-2xl px-4 sm:px-5 py-3 sm:py-4 focus:border-indigo-500 outline-none cursor-pointer font-black text-[9px] sm:text-[10px] uppercase"
                                    >
                                        <option value="salud">Salud</option>
                                        <option value="hipertrofia">Músculo</option>
                                        <option value="fuerza">Fuerza</option>
                                        <option value="definicion">Grasa</option>
                                    </select>
                                </div>
                            </div>

                            <button
                                type="submit"
                                data-testid="btn-save-profile"
                                disabled={saving}
                                className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase italic tracking-[0.15em] text-[10px] rounded-2xl transition-all active:scale-95 disabled:opacity-50 border border-white/10 shadow-xl shadow-indigo-600/20"
                            >
                                {saving ? <Loader2 className="animate-spin mx-auto" size={18} /> : 'TRANSMITIR BIOMETRÍA'}
                            </button>
                        </form>
                    </div>

                    {/* HISTORIAL */}
                    <div className="space-y-6">
                        <h2 className="text-zinc-500 font-black uppercase text-[10px] tracking-[0.4em] ml-4 flex items-center gap-3">
                            <History size={14} className="text-indigo-500" /> Histórico de Registros
                        </h2>

                        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-4 scrollbar-hide">
                            {history.length === 0 ? (
                                <div className="p-10 border border-dashed border-zinc-800 rounded-[2rem] text-center">
                                    <p className="text-zinc-600 font-mono text-[10px] uppercase tracking-widest">Sin registros detectados</p>
                                </div>
                            ) : (
                                history.map((entry) => (
                                    <div key={entry.id} className="bg-zinc-900/40 border border-white/5 p-6 rounded-[2rem] hover:border-indigo-500/30 transition-all group flex items-center justify-between relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => setDeleteModal({ isOpen: true, id: entry.id })}
                                                className="p-2 text-zinc-600 hover:text-red-500 transition-colors"
                                                title="Eliminar registro"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-1">
                                                {new Date(entry.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                            </p>
                                            <div className="flex gap-4 items-center">
                                                <span className="text-xl font-black text-white italic tracking-tighter">{entry.weight}KG</span>
                                                <span className="text-xs text-zinc-600 font-bold uppercase">{entry.height}CM</span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-[9px] font-black bg-zinc-800 text-zinc-500 px-3 py-1.5 rounded-full uppercase tracking-widest">
                                                EDAD: {entry.age}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}

            <ConfirmModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, id: null })}
                onConfirm={handleDelete}
                title="¿Eliminar Registro?"
                message="¿Estás seguro de que deseas borrar este registro de tu historial biométrico? Estos datos se perderán para siempre."
                confirmText="SÍ, ELIMINAR"
                cancelText="NO, CANCELAR"
            />
        </div>
    )
}
