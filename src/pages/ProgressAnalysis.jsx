import { useState } from 'react'
import { api } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import { TrendingUp, Activity, AlertCircle, ArrowRight, Search, PlayCircle } from 'lucide-react'
import ExerciseVideo from '../components/ExerciseVideo'
import { searchGlobalExercises, getYoutubeUrl } from '../services/videoService'

export default function ProgressAnalysis() {
    const { user, loading: authLoading } = useAuth()
    const [loading, setLoading] = useState(false)
    const [analysis, setAnalysis] = useState(null)
    const [error, setError] = useState(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [videoModal, setVideoModal] = useState({ isOpen: false, url: '', name: '' })

    const handleOptimize = async () => {
        setLoading(true)
        setError(null)
        setAnalysis(null)
        try {
            const analysisData = await api.post('/api/ai/adjust', {})
            setAnalysis(analysisData)
        } catch (err) {
            console.error(err)
            setError(err.message || 'Error al conectar con el Coach IA')
        } finally {
            setLoading(false)
        }
    }

    if (authLoading) return <div className="p-8 text-center text-slate-500">Cargando usuario...</div>

    return (
        <div data-testid="progress-page" className="max-w-4xl mx-auto space-y-10 pb-20">
            <ExerciseVideo
                isOpen={videoModal.isOpen}
                onClose={() => setVideoModal({ ...videoModal, isOpen: false })}
                videoUrl={videoModal.url}
                exerciseName={videoModal.name}
            />

            <div className="flex items-center gap-4">
                <TrendingUp className="text-[#00ff88]" size={28} />
                <h1
                    data-testid="progress-title"
                    className="text-4xl font-black text-white uppercase italic tracking-tighter"
                >
                    Análisis de Progreso
                </h1>
            </div>
            <p className="text-zinc-500 font-medium -mt-6 ml-11">Deja que la IA analice tu historial y optimice tu plan.</p>

            {/* ACTION CARD */}
            <div className="bg-[#0f0f12] border border-white/5 rounded-[2.5rem] p-12 text-center shadow-2xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent"></div>

                <Activity className="h-24 w-24 text-indigo-500/40 mx-auto mb-6" />
                <h2 className="text-3xl font-black text-white mb-4 uppercase italic tracking-tight">Optimizar mi Entrenamiento</h2>
                <p className="text-zinc-500 max-w-lg mx-auto mb-10 font-medium italic">
                    Nuestra IA revisará tus últimas 5 sesiones para detectar estancamientos,
                    calcular tu sobrecarga progresiva y sugerir cambios.
                </p>

                <button
                    onClick={handleOptimize}
                    disabled={loading}
                    className="flex items-center gap-4 px-10 py-5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black uppercase italic tracking-widest text-xs rounded-2xl shadow-xl shadow-indigo-600/20 transition-all active:scale-95 disabled:opacity-50 mx-auto relative z-10"
                >
                    {loading ? 'ANALIZANDO INTERFAZ...' : 'Realizar Análisis IA'}
                    {!loading && <ArrowRight size={20} />}
                </button>
            </div>

            {/* ERROR STATE */}
            {error && (
                <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-[2rem] text-red-400 font-bold flex items-center gap-4 uppercase tracking-tighter italic">
                    <AlertCircle size={24} /> {error}
                </div>
            )}

            {/* RESULTS SECTION */}
            {analysis && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
                    {/* Tarjeta de Estado */}
                    <div className="bg-gradient-to-r from-[#1a1a2e] to-[#0f0f12] p-6 rounded-[3rem] border border-indigo-500/20 flex items-center gap-8 shadow-2xl relative overflow-hidden">
                        <div className="w-12 h-12 bg-indigo-500 rounded-full flex-shrink-0 shadow-[0_0_20px_rgba(79,70,229,0.4)]"></div>
                        <div>
                            <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-1">
                                {analysis.status === 'progressing' ? 'ASCENSO CONFIRMADO' :
                                    analysis.status === 'stalled' ? 'MESETA DETECTADA' : 'DATOS INSUFICIENTES'}
                            </h3>
                            <p className="text-zinc-400 font-bold text-sm tracking-tight">{analysis.suggestion}</p>
                        </div>
                    </div>

                    {/* Tarjeta de Seguridad */}
                    <div className="bg-[#1a0f0f] p-6 rounded-[2.5rem] border border-red-500/20 flex items-center gap-8 shadow-2xl">
                        <div className="w-12 h-12 bg-red-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-[0_0_20px_rgba(239,68,68,0.4)]">
                            <AlertCircle className="text-white" size={24} />
                        </div>
                        <div>
                            <h4 className="text-red-500 font-black uppercase text-[10px] tracking-[0.3em] mb-1">PROTOCOLO DE SEGURIDAD ACTIVADO</h4>
                            <p className="text-red-200/60 font-black italic text-sm">
                                "{analysis.safety_warning || 'Analizando integridad técnica del protocolo...'}"
                            </p>
                        </div>
                    </div>

                    {/* Log de Sistema */}
                    <div className="bg-[#09090b] p-8 rounded-[2rem] border border-white/5 relative overflow-hidden">
                        <div className="flex items-center gap-3 mb-6">
                            <Activity className="text-indigo-500" size={16} />
                            <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em]">LOG DE SISTEMA</h4>
                        </div>
                        <p className="text-zinc-400 font-mono text-[11px] uppercase tracking-widest leading-loose">
                            {analysis.analysis}
                        </p>
                    </div>

                    {/* Cambios Sugeridos */}
                    {analysis.recommended_changes && analysis.recommended_changes.length > 0 && (
                        <div className="space-y-4 pt-4">
                            <h4 className="text-[10px] font-black text-amber-500 uppercase tracking-[0.4em] ml-2">AJUSTES DINÁMICOS</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {analysis.recommended_changes.map((change, idx) => (
                                    <div key={idx} className="bg-zinc-900/40 border border-white/5 p-6 rounded-[2rem] flex justify-between items-center group hover:border-amber-500/30 transition-all">
                                        <div>
                                            <p className="text-white font-black uppercase italic text-sm tracking-tight">{change.exercise}</p>
                                            <p className="text-amber-500 font-mono text-[9px] mt-1 font-bold">{change.reason}</p>
                                        </div>
                                        <div className="bg-amber-500/10 text-amber-500 px-4 py-2 rounded-xl text-[10px] font-black border border-amber-500/20">
                                            {change.value}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* SECCIÓN DE BIBLIOTECA */}
            <div className="pt-16 border-t border-white/5">
                <div className="mb-8 pl-2">
                    <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">
                        Motor de <span className="text-indigo-500">Videos</span>
                    </h2>
                    <p className="text-zinc-600 font-bold text-xs mt-1 italic">Consulta técnica instantánea en español.</p>
                </div>

                <div className="bg-[#0f0f12] border border-white/5 rounded-3xl flex items-center p-2 mb-10 group focus-within:border-indigo-500/40 transition-all">
                    <div className="p-3">
                        <Search className="text-zinc-700 group-focus-within:text-indigo-500 transition-colors" size={24} />
                    </div>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Buscar ejecución técnica..."
                        className="flex-1 bg-transparent text-white px-4 py-4 outline-none font-bold placeholder:text-zinc-800"
                    />
                </div>

                {searchTerm.length > 2 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-500">
                        {searchGlobalExercises(searchTerm).map((gEx, idx) => (
                            <div key={idx} className="bg-zinc-900/50 border border-white/5 p-6 rounded-3xl flex justify-between items-center">
                                <h3 className="text-lg font-black text-white uppercase italic tracking-tighter">{gEx.name}</h3>
                                <button
                                    onClick={() => setVideoModal({
                                        isOpen: true,
                                        url: getYoutubeUrl(gEx.videoId),
                                        name: gEx.name
                                    })}
                                    className="p-3 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-500 transition-all active:scale-90"
                                >
                                    <PlayCircle size={20} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

