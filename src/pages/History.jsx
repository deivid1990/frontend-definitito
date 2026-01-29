import { useState, useEffect } from 'react'
import { api } from '../lib/api'
import { Calendar, Clock, Activity, TrendingUp, Star, Trash2, Plus, Edit3 } from 'lucide-react'
import ConfirmModal from '../components/ConfirmModal'
import ManualWorkoutModal from '../components/ManualWorkoutModal'

export default function History() {
    const [history, setHistory] = useState([])
    const [loading, setLoading] = useState(true)
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null })
    const [showManualModal, setShowManualModal] = useState(false)
    const [editingSession, setEditingSession] = useState(null)

    const fetchHistory = async () => {
        try {
            const response = await api.get('/api/sesiones')
            setHistory(response)
        } catch (error) {
            console.error("Error al cargar historial:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchHistory()
    }, [])

    const handleManualSave = async (payload) => {
        try {
            if (editingSession) {
                await api.put(`/api/sesiones/${editingSession.id}`, payload)
            } else {
                await api.post('/api/sesiones', payload)
            }
            setEditingSession(null)
            fetchHistory()
        } catch (error) {
            alert('Error al procesar el registro: ' + error.message)
        }
    }

    const handleDelete = async () => {
        if (!deleteModal.id) return
        try {
            await api.delete(`/api/sesiones/${deleteModal.id}`)
            setHistory(history.filter(s => s.id !== deleteModal.id))
            setDeleteModal({ isOpen: false, id: null })
        } catch (error) {
            alert('Error al eliminar el registro: ' + error.message)
        }
    }

    const formatDuration = (totalMinutes) => {
        const mins = parseInt(totalMinutes) || 0;
        if (mins < 60) return `${mins} min`;
        const h = Math.floor(mins / 60);
        const m = mins % 60;
        return m > 0 ? `${h} h ${m} min` : `${h} h`;
    }

    if (loading) return (
        <div className="flex items-center justify-center p-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
    )

    return (
        <div className="max-w-5xl mx-auto space-y-10 p-4">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                <div className="flex-1 min-w-0">
                    <h1 className="text-3xl sm:text-5xl font-black italic tracking-tighter text-white uppercase leading-tight">
                        Historial de <span className="text-indigo-500">Entrenamientos</span>
                    </h1>
                </div>

                <button
                    onClick={() => setShowManualModal(true)}
                    className="flex items-center gap-3 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-4 rounded-2xl font-black uppercase italic tracking-widest text-xs shadow-xl shadow-indigo-600/20 transition-all active:scale-95 border border-white/10"
                >
                    <Plus size={20} /> AGREGAR ENTRENAMIENTO
                </button>
            </header>

            <div className="grid gap-6">
                {history.length > 0 ? (
                    history.map((session) => (
                        <div key={session.id} className="bg-zinc-900/40 border border-white/5 p-8 rounded-[2.5rem] backdrop-blur-md hover:border-indigo-500/30 transition-all group relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>

                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                <div className="flex gap-6 items-center">
                                    <div className="p-4 bg-black/60 rounded-2xl border border-indigo-500/20 text-indigo-400 shadow-inner">
                                        <Calendar size={24} />
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter group-hover:text-indigo-400 transition-colors">
                                            {session.name || 'Entrenamiento General'}
                                        </h3>
                                        <div className="flex flex-wrap gap-4 text-[10px] text-zinc-500 font-black uppercase tracking-widest">
                                            <span className="flex items-center gap-2">
                                                <Clock size={14} className="text-indigo-500" />
                                                {new Date(session.started_at).toLocaleDateString('es-ES', {
                                                    day: '2-digit', month: '2-digit', year: 'numeric'
                                                })}
                                                <span className="text-zinc-700 mx-1">•</span>
                                                {new Date(session.started_at).toLocaleTimeString('es-ES', {
                                                    hour: '2-digit', minute: '2-digit'
                                                })}
                                            </span>
                                            <span className="flex items-center gap-2">
                                                <Activity size={14} className="text-indigo-500" />
                                                {formatDuration(session.duration_minutes || session.duration)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col items-end gap-3 w-full md:w-auto">
                                    <div className="flex gap-1">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Star
                                                key={star}
                                                size={18}
                                                fill={(session.rating || 5) >= star ? '#6366f1' : 'none'}
                                                className={(session.rating || 5) >= star ? 'text-indigo-500' : 'text-zinc-800'}
                                            />
                                        ))}
                                    </div>
                                    <div className="flex items-center gap-4 mt-2">
                                        <button
                                            onClick={() => {
                                                setEditingSession(session)
                                                setShowManualModal(true)
                                            }}
                                            className="p-3 bg-indigo-500/10 text-indigo-500/60 hover:text-indigo-500 hover:bg-indigo-500/20 rounded-xl transition-all active:scale-95"
                                        >
                                            <Edit3 size={18} />
                                        </button>
                                        <button
                                            onClick={() => setDeleteModal({ isOpen: true, id: session.id })}
                                            className="p-3 bg-red-500/10 text-red-500/60 hover:text-red-500 hover:bg-red-500/20 rounded-xl transition-all active:scale-95"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                        <div className="px-5 py-2 bg-indigo-500/10 rounded-full border border-indigo-500/20">
                                            <span className="text-xl font-black text-white italic">
                                                {(session.rating || 5) * 20}<span className="text-indigo-500 ml-1">XP</span>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-32 bg-zinc-950/40 rounded-[3rem] border border-dashed border-white/5">
                        <TrendingUp size={64} className="mx-auto text-zinc-800 mb-6 opacity-30" />
                        <p className="text-zinc-600 font-mono text-xs uppercase tracking-widest leading-loose text-center">
                            Sistema de registros vacío.<br />Inicia una misión para sincronizar datos técnicos.
                        </p>
                    </div>
                )}
            </div>

            {/* Modal de Confirmación de Borrado */}
            <ConfirmModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, id: null })}
                onConfirm={handleDelete}
                title="¿Eliminar Registro?"
                message="¿Estás seguro de que deseas borrar este registro de misión? Esta acción eliminará permanentemente los datos de rendimiento de esta sesión."
                confirmText="SÍ, ELIMINAR"
                cancelText="NO, CANCELAR"
            />
            {/* Modal de Registro Manual / Edición */}
            <ManualWorkoutModal
                isOpen={showManualModal}
                onClose={() => {
                    setShowManualModal(false)
                    setEditingSession(null)
                }}
                onSave={handleManualSave}
                initialData={editingSession}
            />
        </div>
    )
}

// Icono decorativo (solo si lo necesitas fuera del componente principal)
function HistoryIcon({ className }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    )
}