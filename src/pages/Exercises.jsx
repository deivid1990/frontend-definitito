import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import { Plus, Search, Dumbbell, Trash2, Play, X, Loader2, PlayCircle, Save, Sparkles, Edit3 } from 'lucide-react'
import ExerciseVideo from '../components/ExerciseVideo'
import ConfirmModal from '../components/ConfirmModal'
import { getExerciseVideoId, getYoutubeUrl, searchGlobalExercises } from '../services/videoService'

export default function Exercises() {
    const { user } = useAuth()
    const [exercises, setExercises] = useState([])
    const [searchTerm, setSearchTerm] = useState('')
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [editingExercise, setEditingExercise] = useState(null) // null = crear, objeto = editar

    // Estado para el modal de confirmación de borrado
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null })

    const [formData, setFormData] = useState({
        name: '',
        muscle_group: '',
        equipment: '',
        description: '',
        video_url: ''
    })

    // Actualizar video automáticamente al escribir el nombre
    useEffect(() => {
        if (formData.name.length > 3) {
            const videoId = getExerciseVideoId(formData.name);
            if (videoId && !formData.video_url) {
                setFormData(prev => ({ ...prev, video_url: getYoutubeUrl(videoId) }));
            }
        }
    }, [formData.name]);

    // Estado para el modal de video
    const [videoModal, setVideoModal] = useState({ isOpen: false, url: '', name: '' })

    // 1. Cargar ejercicios filtrados por el usuario
    const fetchExercises = async () => {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('exercises')
                .select('*')
                .eq('user_id', user.id)
                .order('name', { ascending: true })

            if (error) throw error
            setExercises(data || [])
        } catch (error) {
            console.error('Error fetching exercises:', error.message)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (user) fetchExercises()
    }, [user])

    // 2. Lógica de búsqueda local
    const filteredExercises = exercises.filter(ex =>
        ex.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ex.muscle_group.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (ex.equipment && ex.equipment.toLowerCase().includes(searchTerm.toLowerCase()))
    )

    // 3. Guardar nuevo ejercicio o actualizar existente
    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsSaving(true)

        try {
            if (editingExercise) {
                // Modo edición
                const { error } = await supabase
                    .from('exercises')
                    .update({ ...formData })
                    .eq('id', editingExercise.id)
                    .eq('user_id', user.id)

                if (error) throw error
            } else {
                // Modo creación
                const { error } = await supabase
                    .from('exercises')
                    .insert([{ ...formData, user_id: user.id }])

                if (error) throw error
            }

            setShowModal(false)
            setEditingExercise(null)
            setFormData({ name: '', muscle_group: '', equipment: '', description: '', video_url: '' })
            fetchExercises()
        } catch (error) {
            alert('Error guardando ejercicio: ' + error.message)
        } finally {
            setIsSaving(false)
        }
    }

    // Función para abrir modal en modo edición
    const handleEdit = (exercise) => {
        setEditingExercise(exercise)
        setFormData({
            name: exercise.name,
            muscle_group: exercise.muscle_group,
            equipment: exercise.equipment || '',
            description: exercise.description || '',
            video_url: exercise.video_url || ''
        })
        setShowModal(true)
    }

    const handleDelete = async () => {
        if (!deleteModal.id) return
        try {
            const { error } = await supabase.from('exercises').delete().eq('id', deleteModal.id)
            if (error) throw error
            setExercises(exercises.filter(ex => ex.id !== deleteModal.id))
            setDeleteModal({ isOpen: false, id: null })
        } catch (error) {
            alert('Error eliminando: ' + error.message)
        }
    }

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-10 pb-20">
            <ExerciseVideo
                isOpen={videoModal.isOpen}
                onClose={() => setVideoModal({ ...videoModal, isOpen: false })}
                videoUrl={videoModal.url}
                exerciseName={videoModal.name}
            />

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tight mb-2 uppercase italic">
                        Entrena <span className="text-indigo-500">Correcto</span> y obten mejores ganancias
                    </h1>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-4 px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase italic tracking-widest transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
                >
                    <Plus size={20} /> AGREGAR EJERCICIO MAS TUTORIAL
                </button>
            </div>

            {/* Buscador Ultra-Premium */}
            <div className="mb-12 group">
                <div className="relative max-w-3xl mx-auto">
                    <div className="absolute inset-0 bg-indigo-600/10 blur-xl group-focus-within:bg-indigo-600/20 transition-all rounded-3xl"></div>
                    <div className="relative bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-[2rem] flex items-center p-2 shadow-2xl group-focus-within:border-indigo-500/30 transition-all">
                        <div className="p-4">
                            <Search className="text-zinc-600 group-focus-within:text-indigo-400 transition-colors" size={24} />
                        </div>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Buscar por nombre, músculo o equipo..."
                            className="flex-1 bg-transparent text-white px-4 py-4 outline-none font-bold placeholder:text-zinc-700"
                        />
                    </div>
                </div>
            </div>

            {/* Listado */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-pulse">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="h-64 bg-zinc-900/40 rounded-[2.5rem] border border-white/5"></div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-6 sm:gap-10">
                    {filteredExercises.length === 0 && (
                        <div className="col-span-full text-center py-32 bg-zinc-950/40 rounded-[3rem] border border-dashed border-white/5">
                            <Dumbbell className="mx-auto text-zinc-900 mb-6 h-24 w-24" />
                            <p className="text-zinc-600 font-black uppercase tracking-[0.3em] text-xs">Frecuencia no encontrada en el sistema</p>
                        </div>
                    )}

                    {filteredExercises.map(ex => (
                        <div key={ex.id} className="group bg-zinc-900/40 backdrop-blur-md border border-white/5 p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] hover:border-indigo-500/30 transition-all relative overflow-hidden flex flex-col justify-between h-full shadow-xl">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>

                            <div>
                                <div className="flex justify-between items-start mb-6">
                                    <span className="text-[9px] font-black px-3 py-1.5 bg-indigo-500/10 text-indigo-400 rounded-full border border-indigo-500/20 uppercase tracking-widest">
                                        {ex.muscle_group}
                                    </span>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleEdit(ex)}
                                            className="relative z-20 p-2 text-zinc-700 hover:text-indigo-500 transition-all active:scale-90"
                                            title="Editar ejercicio"
                                        >
                                            <Edit3 size={18} />
                                        </button>
                                        <button
                                            onClick={() => setDeleteModal({ isOpen: true, id: ex.id })}
                                            className="relative z-20 p-2 text-zinc-700 hover:text-red-500 transition-all active:scale-90"
                                            title="Eliminar ejercicio"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>

                                <h3 className="text-lg sm:text-xl font-black text-white mb-3 uppercase tracking-tighter italic group-hover:text-indigo-400 transition-colors break-words">{ex.name}</h3>
                                <p className="text-xs text-zinc-500 leading-relaxed italic mb-8 line-clamp-3">
                                    "{ex.description || 'Sin protocolo de ejecución definido por el coach.'}"
                                </p>
                            </div>

                            <div className="flex items-center justify-between pt-6 border-t border-white/5 mt-auto">
                                <span className="text-[9px] text-zinc-600 font-black uppercase tracking-widest flex items-center gap-2">
                                    <Dumbbell size={14} className="text-indigo-500/40" /> {ex.equipment || 'Libre'}
                                </span>
                                <button
                                    onClick={() => {
                                        const finalUrl = ex.video_url || getYoutubeUrl(getExerciseVideoId(ex.name));
                                        setVideoModal({
                                            isOpen: true,
                                            url: finalUrl,
                                            name: ex.name
                                        });
                                    }}
                                    className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 transition-all active:scale-95"
                                >
                                    <PlayCircle size={16} /> Ver Tutorial
                                </button>
                            </div>
                        </div>
                    ))}

                    {/* SECCIÓN DE RESULTADOS GLOBALES (Sugerencias IA) */}
                    {searchTerm.length > 2 && (
                        <div className="col-span-full mt-12 mb-6 animate-in fade-in duration-700">
                            {searchGlobalExercises(searchTerm).length > 0 && (
                                <>
                                    <div className="flex items-center gap-4 mb-8">
                                        <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-indigo-500/30"></div>
                                        <h2 className="text-xs font-black text-indigo-400 uppercase tracking-[0.4em] italic flex items-center gap-3">
                                            <Sparkles size={14} className="animate-pulse" /> Inteligencia Artifical: Tutoriales Encontrados
                                        </h2>
                                        <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-indigo-500/30"></div>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-6 sm:gap-10">
                                        {searchGlobalExercises(searchTerm).map((gEx, idx) => (
                                            <div key={idx} className="group bg-indigo-600/5 backdrop-blur-md border border-indigo-500/20 p-5 sm:p-6 lg:p-8 rounded-[2rem] sm:rounded-[2.5rem] hover:bg-indigo-600/10 transition-all relative overflow-hidden flex flex-col justify-between border-dashed">
                                                <div>
                                                    <h3 className="text-xl font-black text-white mb-3 uppercase tracking-tighter italic">{gEx.name}</h3>
                                                    <p className="text-[10px] text-zinc-500 leading-relaxed uppercase font-black tracking-widest mb-8">
                                                        Tutorial técnico verificado en español disponible.
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => setVideoModal({
                                                        isOpen: true,
                                                        url: getYoutubeUrl(gEx.videoId),
                                                        name: gEx.name
                                                    })}
                                                    className="w-full flex items-center justify-center gap-3 bg-indigo-500 text-white px-5 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-indigo-400 transition-all active:scale-95"
                                                >
                                                    <PlayCircle size={18} /> Aprender Técnica
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Modal de Creación Premium */}
            {showModal && (
                <div className="fixed inset-0 bg-black/95 flex items-center justify-center p-4 z-50 backdrop-blur-xl animate-in fade-in">
                    <div className="bg-zinc-900 border border-white/5 p-10 rounded-[3rem] w-full max-w-xl shadow-[0_0_50px_rgba(0,0,0,0.5)] relative">
                        <button onClick={() => setShowModal(false)} className="absolute top-8 right-8 text-zinc-500 hover:text-white transition-colors">
                            <X size={28} />
                        </button>

                        <div className="mb-10">
                            <h2 className="text-3xl font-black text-white mb-2 uppercase italic tracking-tighter">
                                {editingExercise ? 'Editar' : 'Nuevo'} <span className="text-indigo-500">Protocolo</span>
                            </h2>
                            <p className="text-zinc-500 text-xs font-mono uppercase tracking-widest">
                                {editingExercise ? 'Modificando datos del ejercicio' : 'Integrando datos a la biblioteca central'}
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Identificador del Ejercicio</label>
                                        {getExerciseVideoId(formData.name) && (
                                            <span className="text-[9px] font-black text-emerald-500 uppercase tracking-tighter flex items-center gap-1 animate-pulse">
                                                <PlayCircle size={10} /> Video AI Detectado
                                            </span>
                                        )}
                                    </div>
                                    <input
                                        placeholder="Ej: Press de Banca Plano"
                                        className="w-full bg-black/40 border border-white/5 p-4 rounded-2xl text-white outline-none focus:border-indigo-500 transition-all font-bold shadow-inner"
                                        required
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Grupo Muscular</label>
                                        <input
                                            placeholder="Pecho"
                                            className="w-full bg-black/40 border border-white/5 p-4 rounded-2xl text-white outline-none focus:border-indigo-500 transition-all font-bold shadow-inner"
                                            required
                                            value={formData.muscle_group}
                                            onChange={e => setFormData({ ...formData, muscle_group: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Equipo Requerido</label>
                                        <input
                                            placeholder="Barra"
                                            className="w-full bg-black/40 border border-white/5 p-4 rounded-2xl text-white outline-none focus:border-indigo-500 transition-all font-bold shadow-inner"
                                            value={formData.equipment}
                                            onChange={e => setFormData({ ...formData, equipment: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">URL de Video Tutorial (YouTube/Vimeo)</label>
                                    <input
                                        placeholder="https://..."
                                        className="w-full bg-black/40 border border-white/5 p-4 rounded-2xl text-white outline-none focus:border-indigo-500 transition-all font-mono text-sm"
                                        value={formData.video_url}
                                        onChange={e => setFormData({ ...formData, video_url: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Instrucciones de Ejecución</label>
                                    <textarea
                                        placeholder="Consejos técnicos para evitar lesiones..."
                                        className="w-full bg-black/40 border border-white/5 p-4 rounded-2xl text-white outline-none focus:border-indigo-500 transition-all min-h-[120px] shadow-inner"
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isSaving}
                                className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase italic tracking-widest rounded-2xl transition-all flex items-center justify-center gap-4 shadow-xl shadow-indigo-600/20 active:scale-95"
                            >
                                {isSaving ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                                {isSaving ? 'SINCRONIZANDO...' : (editingExercise ? 'ACTUALIZAR EJERCICIO' : 'CONFIRMAR INGRESO')}
                            </button>
                        </form>
                    </div>
                </div>
            )}
            {/* Modal de Confirmación de Borrado */}
            <ConfirmModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, id: null })}
                onConfirm={handleDelete}
                title="¿Eliminar Ejercicio?"
                message="¿Estás seguro de que deseas borrar este ejercicio de tu biblioteca? No podrás recuperarlo."
                confirmText="SÍ, ELIMINAR"
                cancelText="NO, CANCELAR"
            />
        </div>
    )
}
