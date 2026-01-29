import { useState, useRef, useEffect } from 'react'
import { api } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import { BrainCircuit, Send, Sparkles, Loader2, Save, X, ChevronRight, Dumbbell, CheckCircle } from 'lucide-react'

export default function AICoach() {
    const { user } = useAuth()
    const [mode, setMode] = useState('chat') // 'chat' | 'generate' | 'preview'
    const [messages, setMessages] = useState([
        { role: 'assistant', content: '¡Hola! Soy tu coach digital. ¿Quieres que analice tu progreso o prefieres que diseñemos una nueva rutina desde cero?' }
    ])
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false)
    const [generatedRoutine, setGeneratedRoutine] = useState(null)
    const [savingRoutine, setSavingRoutine] = useState(false)
    const [showSuccess, setShowSuccess] = useState(false)
    const messagesEndRef = useRef(null)

    // Opciones para generación (simplificadas para el prompt)
    const [options, setOptions] = useState({
        goal: 'Hipertrofia',
        level: 'Intermedio',
        days: 3,
        equipment: 'Gimnasio completo'
    })

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(scrollToBottom, [messages])

    // --- MANEJO DE CHAT ---
    const handleSend = async (e) => {
        e.preventDefault()
        if (!input.trim() || loading) return

        const userMsg = { role: 'user', content: input }
        const newMessages = [...messages, userMsg]
        setMessages(newMessages)
        setInput('')
        setGeneratedRoutine(null) // Limpiamos sesión previa para evitar datos obsoletos
        setLoading(true)

        try {
            const response = await api.post('/api/ai/chat', { messages: newMessages })

            // Si la IA sugiere una rutina, la capturamos
            if (response.routine) {
                setGeneratedRoutine(response.routine)
            }

            setMessages(prev => [...prev, { role: response.role, content: response.content }])
        } catch (error) {
            setMessages(prev => [...prev, { role: 'assistant', content: 'Lo siento, hubo un error al conectar con mis circuitos neuronales.' }])
        } finally {
            setLoading(false)
        }
    }

    // --- GENERACIÓN DE RUTINA ---
    const handleGenerate = async () => {
        // Si ya tenemos una rutina capturada del chat, vamos directo al preview
        if (generatedRoutine) {
            setMode('preview')
            return
        }

        setLoading(true)
        try {
            const routine = await api.post('/api/ai/generar-rutina', options)
            setGeneratedRoutine(routine)
            setMode('preview')
        } catch (err) {
            alert('Error al generar la rutina: ' + err.message)
        } finally {
            setLoading(false)
        }
    }

    const saveRoutine = async () => {
        setSavingRoutine(true)
        try {
            await api.post('/api/rutinas', generatedRoutine)
            setShowSuccess(true)
            setTimeout(() => {
                setShowSuccess(false)
                setGeneratedRoutine(null)
                setMode('chat')
                setMessages(prev => [...prev, { role: 'assistant', content: `🎯 ¡Rutina "${generatedRoutine.name}" activada! Ya puedes verla en tu rutina semanal.` }])
            }, 3000)
        } catch (error) {
            alert('Error al guardar: ' + error.message)
        } finally {
            setSavingRoutine(false)
        }
    }

    return (
        <div className="min-h-[calc(100vh-180px)] flex flex-col max-w-4xl mx-auto w-full gap-6 px-4 sm:px-6 py-4">

            {/* Header / Selector */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-zinc-900/40 p-4 rounded-[2rem] border border-zinc-800 backdrop-blur-sm">
                <div className="flex items-center gap-4 px-2">
                    <div className="p-3 bg-indigo-500/20 rounded-2xl">
                        <BrainCircuit className="text-indigo-400" size={28} />
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-white uppercase tracking-tighter italic">AI <span className="text-indigo-500">COACH</span></h1>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                            <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">Neural Link Active</p>
                        </div>
                    </div>
                </div>

                {mode !== 'preview' && (
                    <div className="flex bg-black/40 p-1 rounded-2xl border border-white/5">
                        <button
                            onClick={() => setMode('chat')}
                            className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${mode === 'chat' ? 'bg-indigo-600 text-white shadow-lg' : 'text-zinc-500 hover:text-white'}`}
                        >
                            Asistente
                        </button>
                        <button
                            onClick={() => {
                                if (generatedRoutine) {
                                    setMode('preview')
                                } else {
                                    setMode('generate')
                                }
                            }}
                            className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all relative ${mode === 'generate' ? 'bg-indigo-600 text-white shadow-lg' : 'text-zinc-500 hover:text-white'}`}
                        >
                            {generatedRoutine && (
                                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-zinc-900 animate-bounce"></span>
                            )}
                            Diseñar
                        </button>
                    </div>
                )}
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-hidden relative">

                {/* CHAT MODE */}
                {mode === 'chat' && (
                    <div className="h-full flex flex-col bg-zinc-900/20 rounded-[2.5rem] border border-zinc-800 overflow-hidden backdrop-blur-sm">
                        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
                            {messages.map((msg, i) => (
                                <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-2`}>
                                    <div className={`max-w-[80%] p-4 rounded-3xl text-sm leading-relaxed ${msg.role === 'user'
                                        ? 'bg-indigo-600 text-white rounded-tr-none'
                                        : 'bg-zinc-800/80 text-zinc-200 rounded-tl-none border border-zinc-700'
                                        }`}>
                                        {msg.content}
                                    </div>
                                </div>
                            ))}
                            {loading && (
                                <div className="flex justify-start">
                                    <div className="bg-zinc-800/80 p-4 rounded-3xl rounded-tl-none border border-zinc-700">
                                        <Loader2 className="animate-spin text-indigo-400" size={18} />
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        <form onSubmit={handleSend} className="p-4 bg-black/20 border-t border-white/5 flex gap-2">
                            <input
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                placeholder="Hablar con la IA..."
                                className="flex-1 bg-zinc-900 border border-zinc-800 rounded-2xl px-6 py-4 text-white outline-none focus:border-indigo-500 transition-all text-sm"
                            />
                            <button type="submit" disabled={loading} className="bg-indigo-600 p-4 rounded-2xl text-white hover:bg-indigo-500 transition-all active:scale-95 disabled:opacity-50">
                                <Send size={20} />
                            </button>
                        </form>
                    </div>
                )}

                {/* GENERATE MODE */}
                {mode === 'generate' && (
                    <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-zinc-900/20 rounded-[2.5rem] border border-zinc-800 border-dashed relative group">
                        <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                        <div className="w-20 h-20 bg-indigo-600/10 rounded-full flex items-center justify-center mb-6 border border-indigo-500/20">
                            <Sparkles className="text-indigo-400" size={40} />
                        </div>
                        <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-4">Arquitecto de Rutinas</h2>
                        <p className="text-zinc-500 max-w-sm mb-10 text-sm">Crearé un plan basado en tu nivel actual, equipo disponible y frecuencia semanal de entrenamiento.</p>
                        <button
                            onClick={handleGenerate}
                            disabled={loading}
                            className="bg-white text-black px-10 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-400 hover:text-white transition-all flex items-center gap-3 active:scale-95"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : <ChevronRight size={20} />}
                            {loading ? 'CALCULANDO...' : 'INICIAR DISEÑO'}
                        </button>
                    </div>
                )}

                {/* PREVIEW MODE */}
                {mode === 'preview' && (
                    <div className="h-full flex flex-col bg-zinc-900 rounded-[2.5rem] border border-zinc-800 overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-8 border-b border-white/5 bg-indigo-600">
                            <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">{generatedRoutine.name}</h2>
                            <p className="text-indigo-100 text-xs font-mono tracking-widest mt-1">OBJETIVO: {generatedRoutine.goal}</p>
                        </div>
                        <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide">
                            <div className="grid grid-cols-1 gap-6">
                                {[1, 2, 3, 4, 5, 6, 7].map(dayNum => {
                                    const dayNames = { 1: 'Lunes', 2: 'Martes', 3: 'Miércoles', 4: 'Jueves', 5: 'Viernes', 6: 'Sábado', 7: 'Domingo' };
                                    const day = generatedRoutine.days.find(d => d.day_number === dayNum);

                                    return day ? (
                                        <div key={dayNum} className="space-y-4 animate-in fade-in slide-in-from-left duration-500">
                                            <div className="flex items-center gap-3">
                                                <span className="text-[10px] font-black bg-indigo-600 text-white px-3 py-1 rounded-full uppercase tracking-tighter">
                                                    {dayNames[dayNum]}
                                                </span>
                                                <h3 className="text-white font-bold uppercase tracking-tight italic">{day.name}</h3>
                                            </div>
                                            <div className="grid gap-3">
                                                {day.exercises.map((ex, idx) => (
                                                    <div key={idx} className="bg-white/5 p-5 rounded-[2rem] border border-white/5 group hover:border-indigo-500/30 transition-all">
                                                        <div className="flex items-center justify-between mb-3">
                                                            <div className="flex items-center gap-4">
                                                                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                                                                    <Dumbbell size={16} />
                                                                </div>
                                                                <span className="text-sm font-black text-white italic tracking-tighter uppercase">{ex.name}</span>
                                                            </div>
                                                            <div className="text-right">
                                                                <span className="block text-[8px] font-black text-indigo-400 uppercase tracking-widest">{ex.sets} SETS • {ex.reps} REPS</span>
                                                                <span className="block text-[8px] font-black text-emerald-400 uppercase tracking-widest font-mono">{ex.target_weight || '??'} KG</span>
                                                            </div>
                                                        </div>
                                                        {ex.notes && (
                                                            <p className="text-[9px] text-zinc-500 italic leading-relaxed pt-2 border-t border-white/5">
                                                                "{ex.notes}"
                                                            </p>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <div key={dayNum} className="opacity-30 border border-dashed border-white/10 p-6 rounded-[2rem] flex items-center justify-between group grayscale hover:grayscale-0 transition-all">
                                            <div className="flex items-center gap-4">
                                                <span className="text-[10px] font-black bg-zinc-800 text-zinc-500 px-3 py-1 rounded-full uppercase tracking-tighter">
                                                    {dayNames[dayNum]}
                                                </span>
                                                <span className="text-xs text-zinc-600 font-black uppercase italic tracking-widest">Día de Descanso / Recuperación</span>
                                            </div>
                                            <Sparkles size={20} className="text-zinc-800" />
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                        <div className="p-6 bg-black/40 border-t border-white/5 flex gap-4 relative">
                            {showSuccess && (
                                <div className="absolute inset-0 bg-emerald-600 flex items-center justify-center z-50 animate-in fade-in duration-300">
                                    <div className="flex items-center gap-3 text-white font-black uppercase italic tracking-tighter text-sm">
                                        <CheckCircle className="animate-bounce" />
                                        Rutina diseñada con éxito, está disponible en tu rutina semanal
                                    </div>
                                </div>
                            )}
                            <button
                                onClick={() => {
                                    setGeneratedRoutine(null)
                                    setMode('chat')
                                }}
                                className="flex-1 py-4 text-zinc-500 font-bold uppercase tracking-widest text-[10px] hover:text-white transition-colors"
                            >
                                Descarta
                            </button>
                            <button
                                onClick={saveRoutine}
                                disabled={savingRoutine}
                                className="flex-[2] bg-emerald-500 text-black py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 hover:bg-emerald-400 transition-all"
                            >
                                {savingRoutine ? <Loader2 className="animate-spin" /> : <Save size={16} />}
                                {savingRoutine ? 'Sincronizando...' : 'Aceptar Protocolo'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}