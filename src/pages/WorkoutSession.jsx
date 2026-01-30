import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import { Timer, CheckCircle, Save, Play, PlayCircle, Info } from 'lucide-react'
import ConfirmModal from '../components/ConfirmModal'
import ExerciseVideo from '../components/ExerciseVideo'
import WorkoutSummaryModal from '../components/WorkoutSummaryModal'
import { getExerciseVideoId, getYoutubeUrl } from '../services/videoService'

export default function WorkoutSession() {
    const { routineId, dayNumber } = useParams()
    const navigate = useNavigate()
    const [routine, setRoutine] = useState(null)
    const [activeDay, setActiveDay] = useState(null)
    const [loading, setLoading] = useState(true)
    const [elapsedTime, setElapsedTime] = useState(0)
    const [sessionData, setSessionData] = useState([])
    const [startTime] = useState(new Date())

    // Estados para el Video y Confirmación
    const [videoModal, setVideoModal] = useState({ isOpen: false, url: '', name: '' })
    const [showSummary, setShowSummary] = useState(false)

    useEffect(() => {
        fetchRoutine()
    }, [])

    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date()
            const diff = Math.floor((now - startTime) / 1000)
            setElapsedTime(diff)
        }, 1000)
        return () => clearInterval(interval)
    }, [startTime])

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }

    const fetchRoutine = async () => {
        try {
            const data = await api.get(`/api/rutinas/${routineId}`)
            setRoutine(data)

            if (data && data.routine_days && data.routine_days.length > 0) {
                // Buscamos el día por el dayNumber de la URL, o el primero por defecto
                let selectedDay = data.routine_days[0]
                if (dayNumber) {
                    const day = data.routine_days.find(d => d.day_number === parseInt(dayNumber))
                    if (day) selectedDay = day
                }

                setActiveDay(selectedDay)
                initializeSession(selectedDay)
            }
        } catch (error) {
            console.error('Error fetching routine', error)
        } finally {
            setLoading(false)
        }
    }

    const initializeSession = (day) => {
        if (!day?.routine_exercises) return;

        const initialData = day.routine_exercises.map(ex => ({
            exercise_id: ex.exercise_id,
            exercise_name: ex.exercise?.name || 'Ejercicio',
            video_url: ex.exercise?.video_url,
            rpe: 5, // Valor por defecto Neutro
            sets: Array.from({ length: ex.sets || 3 }).map(() => ({
                reps: ex.reps || 10,
                weight: ex.target_weight || 0,
                completed: false
            }))
        }))
        setSessionData(initialData)
    }

    const updateSet = (exerciseIndex, setIndex, field, value) => {
        const newData = [...sessionData]
        newData[exerciseIndex].sets[setIndex][field] = value
        setSessionData(newData)
    }

    const updateRPE = (exerciseIndex, value) => {
        const newData = [...sessionData]
        newData[exerciseIndex].rpe = parseInt(value)
        setSessionData(newData)
    }

    const toggleComplete = (exerciseIndex, setIndex) => {
        const newData = [...sessionData]
        newData[exerciseIndex].sets[setIndex].completed = !newData[exerciseIndex].sets[setIndex].completed
        setSessionData(newData)
    }

    const handleFinalSave = async ({ rating, duration }) => {
        setShowSummary(false)
        try {
            const payload = {
                routine_id: routineId,
                day_number: parseInt(dayNumber),
                name: `${routine.name} - ${activeDay.name}`,
                started_at: startTime,
                ended_at: new Date(),
                duration_minutes: duration,
                rating: rating,
                exercises: sessionData
            }

            await api.post('/api/sesiones', payload)
            navigate('/rutinas')
        } catch (error) {
            alert('Error guardando sesión: ' + error.message)
        }
    }

    if (loading) return <div className="text-center p-10 text-white">Cargando entrenamiento...</div>
    if (!routine) return <div className="text-center p-10 text-white">Rutina no encontrada</div>

    return (
        <div className="max-w-3xl mx-auto pb-32 p-4">
            <ExerciseVideo
                isOpen={videoModal.isOpen}
                onClose={() => setVideoModal({ ...videoModal, isOpen: false })}
                videoUrl={videoModal.url}
                exerciseName={videoModal.name}
            />

            <div className="mb-6 sm:mb-10 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 bg-zinc-900/40 p-4 sm:p-8 rounded-2xl sm:rounded-[2.5rem] border border-white/5 backdrop-blur-md shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500 group-hover:w-2 transition-all"></div>
                <div className="min-w-0 flex-1">
                    <h1 className="text-2xl sm:text-4xl font-black text-white uppercase italic tracking-tighter mb-1 truncate">{routine.name}</h1>
                    <p className="text-indigo-400 font-mono text-[10px] sm:text-sm flex items-center gap-2 uppercase tracking-[0.2em] sm:tracking-[0.3em] font-bold">
                        <Play size={10} fill="currentColor" className="animate-pulse" />
                        {(() => {
                            const dayNames = {
                                1: 'Lunes', 2: 'Martes', 3: 'Miércoles',
                                4: 'Jueves', 5: 'Viernes', 6: 'Sábado', 7: 'Domingo'
                            };
                            return dayNames[dayNumber] || `Día ${dayNumber}`;
                        })()}
                        <span className="opacity-30 mx-1">|</span>
                        <span className="truncate">{activeDay?.name}</span>
                    </p>
                </div>
                <div className="flex sm:block items-center justify-between w-full sm:w-auto mt-2 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-t-0 border-white/5">
                    <div className="flex items-center gap-2 text-zinc-500 sm:mb-1 sm:justify-end font-mono text-[9px] sm:text-xs font-black tracking-widest uppercase">
                        <Timer size={12} className="text-indigo-500" /> <span className="sm:inline hidden">Tiempo de Misión</span><span className="sm:hidden">TIEMPO</span>
                    </div>
                    <span className="text-white font-mono text-2xl sm:text-4xl font-black tabular-nums tracking-tighter">{formatTime(elapsedTime)}</span>
                </div>
            </div>

            <div className="space-y-10">
                {sessionData.map((ex, exIdx) => (
                    <div key={exIdx} className="bg-zinc-900/50 border border-white/5 rounded-[2.5rem] p-8 backdrop-blur-xl relative group hover:border-indigo-500/20 transition-all duration-500">
                        <div className="flex justify-between items-start mb-8">
                            <div className="flex items-center gap-4">
                                <div className="w-1.5 h-8 bg-indigo-500 rounded-full"></div>
                                <h3 className="font-black text-xl text-white uppercase tracking-tight italic">{ex.exercise_name}</h3>
                            </div>
                            <button
                                onClick={() => {
                                    const videoId = getExerciseVideoId(ex.exercise_name);
                                    const finalUrl = ex.video_url || (videoId ? getYoutubeUrl(videoId) : null);
                                    setVideoModal({ isOpen: true, url: finalUrl, name: ex.exercise_name });
                                }}
                                className="flex items-center gap-2 bg-indigo-500/10 hover:bg-indigo-500 text-indigo-400 hover:text-white px-5 py-3 rounded-xl transition-all font-black text-xs uppercase tracking-widest border border-indigo-500/20"
                            >
                                <PlayCircle size={16} /> Tutorial
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-12 gap-2 px-1 sm:px-2 text-[8px] sm:text-xs font-black text-zinc-600 uppercase tracking-widest text-center">
                                <div className="col-span-2">SET</div>
                                <div className="col-span-4">PESO</div>
                                <div className="col-span-3">REPS</div>
                                <div className="col-span-3">FIN</div>
                            </div>

                            {ex.sets.map((set, setIdx) => (
                                <div key={setIdx} className={`grid grid-cols-12 gap-2 items-center p-2 sm:p-4 rounded-xl sm:rounded-2xl transition-all duration-500 border ${set.completed ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-black/40 border-white/5'}`}>
                                    <div className={`col-span-2 text-center font-mono text-[10px] sm:text-xs font-black ${set.completed ? 'text-emerald-400' : 'text-zinc-600'}`}>{setIdx + 1}</div>
                                    <div className="col-span-4">
                                        <div className="relative">
                                            <input
                                                type="number"
                                                value={set.weight}
                                                onChange={(e) => updateSet(exIdx, setIdx, 'weight', e.target.value)}
                                                className="w-full bg-black/60 text-white text-center rounded-lg sm:rounded-xl py-2 sm:py-3 border border-white/10 focus:border-indigo-500 outline-none transition-all font-mono font-bold text-xs sm:text-base"
                                            />
                                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[8px] text-zinc-600 font-black hidden sm:block">KG</span>
                                        </div>
                                    </div>
                                    <div className="col-span-3">
                                        <input
                                            type="number"
                                            value={set.reps}
                                            onChange={(e) => updateSet(exIdx, setIdx, 'reps', e.target.value)}
                                            className="w-full bg-black/60 text-white text-center rounded-lg sm:rounded-xl py-2 sm:py-3 border border-white/10 focus:border-indigo-500 outline-none transition-all font-mono font-bold text-xs sm:text-base"
                                        />
                                    </div>
                                    <div className="col-span-3 flex justify-center">
                                        <button
                                            onClick={() => toggleComplete(exIdx, setIdx)}
                                            className={`p-2 sm:p-3 rounded-lg sm:rounded-xl transition-all ${set.completed ? 'bg-emerald-500 text-black shadow-[0_0_20px_rgba(16,185,129,0.4)]' : 'bg-zinc-800 text-zinc-500'}`}
                                        >
                                            <CheckCircle size={18} className="sm:w-5 sm:h-5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* RPE Selector */}
                        <div className="mt-8 pt-6 border-t border-white/5">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-xs font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                                    <Info size={14} className="text-indigo-400" /> Esfuerzo Percibido (RPE: {ex.rpe})
                                </span>
                                <span className={`text-xs font-black px-4 py-2 rounded-full uppercase ${ex.rpe > 8 ? 'bg-red-500/20 text-red-400' : 'bg-indigo-500/20 text-indigo-400'}`}>
                                    {ex.rpe <= 4 ? 'Ligero' : ex.rpe <= 7 ? 'Óptimo' : 'Cerca del Fallo'}
                                </span>
                            </div>
                            <input
                                type="range"
                                min="1"
                                max="10"
                                value={ex.rpe}
                                onChange={(e) => updateRPE(exIdx, e.target.value)}
                                className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                            />
                            <div className="flex justify-between mt-2 text-xs font-bold text-zinc-700 font-mono">
                                <span>1 - RECALENTAMIENTO</span>
                                <span>10 - LÍMITE TOTAL</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="fixed bottom-10 left-1/2 -translate-x-1/2 w-[90%] max-w-md bg-indigo-600 p-1.5 rounded-[2rem] shadow-[0_20px_50px_rgba(79,70,229,0.4)] z-50 animate-in slide-in-from-bottom-10 backdrop-blur-xl">
                <button
                    onClick={() => setShowSummary(true)}
                    className="w-full bg-indigo-600 text-white py-5 rounded-[1.8rem] font-black uppercase tracking-[0.2em] text-sm flex items-center justify-center gap-4 hover:bg-indigo-500 transition-all active:scale-95 border border-white/10"
                >
                    <Save size={22} /> GUARDAR ENTRENAMIENTO
                </button>
            </div>
            {/* Modal de Resumen de Misión */}
            <WorkoutSummaryModal
                isOpen={showSummary}
                onClose={() => setShowSummary(false)}
                onConfirm={handleFinalSave}
                initialDuration={Math.ceil(elapsedTime / 60)}
                routineName={routine.name}
            />
        </div>
    )
}
