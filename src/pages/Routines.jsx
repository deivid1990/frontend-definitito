import { useState, useEffect } from 'react'
import { api } from '../lib/api'
import { Plus, Calendar, Dumbbell, PlayCircle, Trash2, AlertTriangle, Star, CheckCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import ConfirmModal from '../components/ConfirmModal'

export default function Routines() {
    const [routines, setRoutines] = useState([])
    const [userSessions, setUserSessions] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null })

    const fetchRoutines = async () => {
        try {
            setError(null)
            const [routinesData, sessionsData] = await Promise.all([
                api.get('/api/rutinas'),
                api.get('/api/sesiones')
            ])
            setRoutines(routinesData || [])
            setUserSessions(sessionsData || [])
        } catch (error) {
            console.error('Error fetching data', error)
            setError('No pudimos cargar tus rutinas. Revisa tu conexión.')
        } finally {
            setLoading(false)
        }
    }

    const renderStars = (rating) => {
        return (
            <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        size={12}
                        className={`${star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-zinc-800'} transition-all`}
                    />
                ))}
            </div>
        );
    };

    const handleDelete = async () => {
        if (!deleteModal.id) return

        const id = deleteModal.id
        setDeleteModal({ isOpen: false, id: null })

        // Optimistic UI
        const originalRoutines = [...routines]
        setRoutines(routines.filter(r => r.id !== id))

        try {
            await api.delete(`/api/rutinas/${id}`)
        } catch (err) {
            setRoutines(originalRoutines)
            alert('Error al eliminar la rutina: ' + err.message)
        }
    }

    useEffect(() => {
        fetchRoutines()
    }, [])

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 sm:mb-8 gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Mis Rutinas</h1>
                    <p className="text-slate-400 text-sm sm:text-base">Gestiona y organiza tu entrenamiento semanal.</p>
                </div>
                <Link to="/coach" className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-indigo-500/20 transition-all font-medium active:scale-95 text-sm sm:text-base">
                    <Plus size={18} className="sm:w-5 sm:h-5" /> <span className="hidden sm:inline">Nueva Rutina (IA)</span><span className="sm:hidden">Crear</span>
                </Link>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl flex items-center gap-3">
                    <AlertTriangle size={20} />
                    {error}
                </div>
            )}

            {loading ? (
                <div className="grid grid-cols-1 gap-6">
                    {[1, 2].map(i => (
                        <div key={i} className="h-32 bg-zinc-900/50 rounded-2xl border border-white/5 animate-pulse"></div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {routines.length === 0 && !error && (
                        <div className="text-center py-16 bg-zinc-900/30 rounded-3xl border border-dashed border-zinc-800 backdrop-blur-sm">
                            <div className="bg-zinc-800/50 p-4 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                                <Calendar className="text-slate-500 h-10 w-10" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">No tienes rutinas todavía</h3>
                            <p className="text-slate-400 mb-6 max-w-sm mx-auto">Deja que nuestra IA diseñe un plan personalizado para tus objetivos.</p>
                            <Link to="/coach" className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 text-indigo-400 px-6 py-3 rounded-xl border border-indigo-500/20 transition-all font-bold">
                                <Dumbbell size={18} /> Crear Rutina con IA
                            </Link>
                        </div>
                    )}

                    {routines.map(routine => (
                        <div key={routine.id} className="bg-zinc-900/40 backdrop-blur-md border border-white/5 rounded-2xl sm:rounded-[2.5rem] p-4 sm:p-6 lg:p-8 hover:border-indigo-500/40 hover:bg-zinc-900/60 transition-all duration-500 shadow-2xl group animate-fade-up">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-8">
                                <div className="flex items-start gap-4 sm:gap-6">
                                    <div className="h-12 w-12 sm:h-14 sm:w-14 lg:h-16 lg:w-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl sm:rounded-2xl flex flex-col items-center justify-center text-white font-black shadow-lg shadow-indigo-900/40 shrink-0 group-hover:scale-110 transition-transform duration-500">
                                        <span className="text-xl sm:text-2xl leading-none">{routine.days_per_week}</span>
                                        <span className="text-[7px] sm:text-[8px] uppercase tracking-[0.2em] opacity-70">Días</span>
                                    </div>
                                    <div>
                                        <span className="text-sm sm:text-base font-black text-white italic tracking-tighter uppercase">{routine.name}</span>
                                        <p className="text-zinc-500 text-xs sm:text-sm flex flex-wrap items-center gap-2 sm:gap-3 mt-2 font-mono">
                                            <span className="bg-indigo-500/10 text-indigo-400 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full uppercase tracking-widest border border-indigo-500/20 text-[10px] sm:text-xs">{routine.goal || 'General'}</span>
                                            <span className="opacity-30 hidden sm:inline">|</span>
                                            <span className="uppercase tracking-widest text-[10px] sm:text-xs">ACTUALIZADA: {new Date(routine.updated_at || routine.created_at).toLocaleDateString('es-ES')}</span>
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 sm:gap-4 self-end md:self-auto">
                                    <button
                                        onClick={() => setDeleteModal({ isOpen: true, id: routine.id })}
                                        className="p-2 sm:p-3 rounded-xl bg-zinc-800 text-zinc-500 hover:text-red-400 hover:bg-red-900/20 transition-all duration-300 active:scale-90"
                                    >
                                        <Trash2 size={18} className="sm:w-5 sm:h-5" />
                                    </button>
                                    <Link to={`/entrenar/${routine.id}`} className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-white text-black hover:bg-indigo-500 hover:text-white font-black text-[10px] sm:text-xs uppercase tracking-widest transition-all duration-500 shadow-xl hover:shadow-indigo-500/20 active:scale-95 flex items-center gap-2 sm:gap-3">
                                        <PlayCircle size={16} className="sm:w-5 sm:h-5" /> <span className="hidden sm:inline">ACCEDER AL SISTEMA</span><span className="sm:hidden">ENTRENAR</span>
                                    </Link>
                                </div>
                            </div>

                            {routine.routine_days && (
                                <div className="mt-6 sm:mt-8 lg:mt-10 space-y-4">
                                    <div className="flex items-center justify-between px-2 mb-4 sm:mb-6">
                                        <h4 className="text-[10px] sm:text-xs text-zinc-500 font-black uppercase tracking-[0.3em] sm:tracking-[0.4em]">Programación Semanal</h4>
                                        <div className="h-px flex-1 bg-white/5 mx-4 sm:mx-6"></div>
                                    </div>

                                    <div className="space-y-3">
                                        {[1, 2, 3, 4, 5, 6, 7].map(dayNum => {
                                            const dayNames = {
                                                1: 'LUNES', 2: 'MARTES', 3: 'MIÉRCOLES',
                                                4: 'JUEVES', 5: 'VIERNES', 6: 'SÁBADO', 7: 'DOMINGO'
                                            };
                                            const dayData = routine.routine_days.find(d => d.day_number === dayNum);

                                            // Buscar la última sesión para este día específico de esta rutina
                                            const lastSession = userSessions
                                                .filter(s => s.routine_id === routine.id && s.day_number === dayNum)
                                                .sort((a, b) => new Date(b.started_at) - new Date(a.started_at))[0];

                                            if (dayData) {
                                                return (
                                                    <Link
                                                        key={dayNum}
                                                        to={`/entrenar/${routine.id}/${dayNum}`}
                                                        className="flex items-center justify-between bg-black/40 border border-white/5 p-4 sm:p-6 rounded-xl sm:rounded-[2rem] hover:border-indigo-500/40 hover:bg-indigo-500/5 transition-all group/day cursor-pointer relative overflow-hidden"
                                                    >
                                                        <div className="absolute left-0 top-0 w-1 h-full bg-indigo-600"></div>
                                                        <div className="flex items-center gap-3 sm:gap-6 flex-1">
                                                            <div className="text-left min-w-[80px] sm:min-w-[120px]">
                                                                <p className="text-[10px] sm:text-xs text-indigo-400 font-black tracking-widest">{dayNames[dayNum]}</p>
                                                                <span className="text-white font-black italic uppercase tracking-tighter text-lg sm:text-2xl leading-none">Misión {dayNum}</span>
                                                            </div>
                                                            <div className="h-6 sm:h-8 w-px bg-white/5"></div>
                                                            <div className="flex-1">
                                                                <p className="text-base sm:text-lg text-zinc-300 font-bold uppercase tracking-tight">{dayData.name}</p>
                                                                <div className="flex gap-2 mt-1">
                                                                    {lastSession ? (
                                                                        renderStars(lastSession.rating)
                                                                    ) : (
                                                                        <span className="text-[9px] sm:text-[10px] bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded-full font-black uppercase tracking-widest">Activo</span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-4">
                                                            {lastSession ? (
                                                                <div className="bg-emerald-500/20 p-2 rounded-lg border border-emerald-500/30">
                                                                    <CheckCircle size={18} className="sm:w-5 sm:h-5 text-emerald-500" />
                                                                </div>
                                                            ) : (
                                                                <PlayCircle size={20} className="sm:w-6 sm:h-6 text-indigo-500 group-hover/day:scale-110 transition-transform" />
                                                            )}
                                                        </div>
                                                    </Link>
                                                );
                                            } else {
                                                return (
                                                    <div
                                                        key={dayNum}
                                                        className="flex items-center justify-between bg-zinc-950/20 border border-dashed border-white/5 p-6 rounded-[2rem] opacity-40 grayscale"
                                                    >
                                                        <div className="flex items-center gap-6">
                                                            <div className="text-left min-w-[120px]">
                                                                <p className="text-xs text-zinc-500 font-black tracking-widest">{dayNames[dayNum]}</p>
                                                                <span className="text-zinc-600 font-black italic uppercase tracking-tighter text-2xl leading-none">Descanso</span>
                                                            </div>
                                                            <div className="h-8 w-px bg-white/5"></div>
                                                            <p className="text-base text-zinc-700 font-bold uppercase tracking-widest italic">Recuperación Neural Automática</p>
                                                        </div>
                                                        <div className="w-6 h-6 rounded-full border border-zinc-800 flex items-center justify-center">
                                                            <div className="w-1.5 h-1.5 bg-zinc-800 rounded-full"></div>
                                                        </div>
                                                    </div>
                                                );
                                            }
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
            {/* Modal de Confirmación de Borrado */}
            <ConfirmModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, id: null })}
                onConfirm={handleDelete}
                title="¿Eliminar Rutina?"
                message="¿Estás seguro de que deseas borrar esta rutina? Se perderán todos los días y ejercicios configurados en ella."
                confirmText="SÍ, ELIMINAR"
                cancelText="NO, CANCELAR"
            />
        </div>
    )
}