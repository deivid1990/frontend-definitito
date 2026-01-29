import { useAuth } from '../context/AuthContext'
import { PlusCircle, Activity, TrendingUp, User, Weight, Zap, Loader2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { AreaChart, Area, Tooltip, ResponsiveContainer } from 'recharts'

export default function Dashboard() {
    const { user } = useAuth()
    const [stats, setStats] = useState({
        totalSessions: 0,
        weeklySessions: 0,
        constancyScore: [],
        loading: true
    })

    useEffect(() => {
        if (user) fetchStats()
    }, [user])

    const fetchStats = async () => {
        try {
            const { data: sessions, error } = await supabase
                .from('workout_sessions')
                .select('id, started_at')
                .eq('user_id', user.id)
                .order('started_at', { ascending: true })

            if (error) throw error

            const now = new Date()

            // Lógica para obtener el inicio de la semana actual (Lunes)
            const tempDate = new Date()
            const dayOfWeek = tempDate.getDay() // 0 (Dom) a 6 (Sab)
            const diffToMonday = tempDate.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)
            const startOfWeek = new Date(tempDate.setDate(diffToMonday))
            startOfWeek.setHours(0, 0, 0, 0)

            // Filtrar sesiones únicas por día en la semana actual
            const currentWeekSessions = sessions.filter(s => new Date(s.started_at) >= startOfWeek)
            const uniqueDaysThisWeek = new Set(currentWeekSessions.map(s => new Date(s.started_at).toDateString())).size

            setStats({
                totalSessions: sessions.length,
                weeklySessions: uniqueDaysThisWeek, // Máximo 7, se reinicia cada Lunes
                constancyScore: calculateConstancyTrend(sessions),
                loading: false
            })
        } catch (e) {
            console.error("Error cargando estadísticas:", e.message)
            setStats(prev => ({ ...prev, loading: false }))
        }
    }

    // Algoritmo de Constancia: Sube al entrenar, baja al no entrenar
    const calculateConstancyTrend = (sessions) => {
        const days = 7
        const trend = []
        let currentScore = 50 // Empezamos en un punto medio equilibrado

        for (let i = days; i >= 0; i--) {
            const dayToCheck = new Date()
            dayToCheck.setDate(dayToCheck.getDate() - i)
            const dayString = dayToCheck.toDateString()

            const trainedThisDay = sessions.some(s => new Date(s.started_at).toDateString() === dayString)

            if (trainedThisDay) {
                currentScore = Math.min(100, currentScore + 15) // Entrenar sube el score
            } else {
                currentScore = Math.max(10, currentScore - 8) // No entrenar lo baja (decay)
            }

            trend.push({
                name: dayToCheck.toLocaleDateString('es-ES', { weekday: 'short' }),
                score: currentScore
            })
        }
        return trend
    }

    if (stats.loading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-indigo-400 gap-4">
                <Loader2 className="animate-spin" size={40} />
                <p className="font-mono text-xs tracking-[0.2em]">INICIALIZANDO SISTEMA...</p>
            </div>
        )
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8 lg:space-y-10 p-4 sm:p-6 pb-12 sm:pb-20 animate-fade-up">
            {/* Hero Section Premium */}
            <div className="relative h-48 sm:h-64 md:h-80 lg:h-96 rounded-2xl sm:rounded-[3rem] overflow-hidden mb-6 sm:mb-12 border border-white/10 group shadow-2xl">
                <img
                    src="/bg-gym.png"
                    alt="Futuristic Gym"
                    className="w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent flex flex-col justify-end p-4 sm:p-6 lg:p-10">
                    <h1 className="text-xl sm:text-3xl md:text-4xl lg:text-6xl font-black text-white tracking-tighter uppercase italic drop-shadow-[0_0_30px_rgba(0,0,0,0.9)] leading-tight">
                        EL ENTRENAMIENTO <br className="hidden sm:block" /> <span className="text-indigo-500">DEL FUTURO</span>
                    </h1>
                    <p className="text-indigo-200 text-[10px] sm:text-base lg:text-xl flex items-center gap-2 sm:gap-3 font-medium drop-shadow-md mt-2 opacity-80 group-hover:opacity-100 transition-opacity">
                        <Zap size={14} className="sm:w-[22px] sm:h-[22px] text-yellow-400 fill-yellow-400 animate-pulse" />
                        Bienvenido a encontrar tu mejor versión
                    </p>
                </div>
                <div className="absolute top-4 right-4 sm:top-6 sm:right-6 lg:top-10 lg:right-10">
                    <Link to="/perfil" className="flex glass-heavy px-3 py-2 sm:px-6 sm:py-3 lg:px-8 lg:py-4 rounded-xl sm:rounded-[1.5rem] items-center gap-2 sm:gap-4 text-slate-300 hover:border-indigo-500/50 transition-all group active:scale-95 shadow-2xl">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-xl sm:rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-[0_0_20px_rgba(79,70,229,0.5)] group-hover:rotate-12 transition-transform">
                            <User size={16} className="sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
                        </div>
                        <div className="text-left hidden lg:block">
                            <p className="text-[10px] text-zinc-500 font-black tracking-[0.3em] leading-none mb-1">BIOMETRÍA</p>
                            <span className="text-sm font-black text-white tracking-widest uppercase font-mono">ESTADO: ONLINE</span>
                        </div>
                    </Link>
                </div>
            </div>

            {/* Grid Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                {/* Sesiones Semanales (X de 7) */}
                <div className="bg-zinc-900/50 border border-zinc-800 p-6 sm:p-8 rounded-2xl sm:rounded-[2.5rem] relative overflow-hidden group">
                    <Activity className="absolute -right-4 -bottom-4 text-indigo-500/5 group-hover:text-indigo-500/10 transition-colors" size={120} />
                    <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-8">
                        <div className="p-2 sm:p-3 bg-indigo-500/10 rounded-xl sm:rounded-2xl text-indigo-400">
                            <Activity size={20} className="sm:w-6 sm:h-6" />
                        </div>
                        <h3 className="text-zinc-500 font-black uppercase tracking-widest text-[9px] sm:text-[10px]">Progreso Semanal</h3>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <p className="text-4xl sm:text-5xl lg:text-7xl font-black text-white tracking-tighter">{stats.weeklySessions}</p>
                        <p className="text-base sm:text-xl lg:text-2xl font-black text-zinc-700 tracking-tighter italic whitespace-nowrap uppercase">DE 7 REALES</p>
                    </div>
                    <div className="mt-3 sm:mt-4 flex items-center gap-2 text-indigo-400 text-[10px] sm:text-xs font-mono uppercase tracking-widest">
                        <TrendingUp size={12} className="sm:w-[14px] sm:h-[14px]" /> Histórico total: {stats.totalSessions}
                    </div>
                </div>

                {/* Gráfico de Constancia (Score Disciplina) */}
                <div className="md:col-span-2 bg-zinc-900/50 border border-zinc-800 p-6 sm:p-8 rounded-2xl sm:rounded-[2.5rem] relative group">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3">
                        <div className="flex items-center gap-3 sm:gap-4">
                            <div className="p-2 sm:p-3 bg-emerald-500/10 rounded-xl sm:rounded-2xl text-emerald-400">
                                <TrendingUp size={20} className="sm:w-6 sm:h-6" />
                            </div>
                            <h3 className="text-zinc-500 font-black uppercase tracking-widest text-[9px] sm:text-[10px]">Constancia de Entrenamiento</h3>
                        </div>
                        <div className="flex items-center gap-2 bg-zinc-950/40 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full border border-white/5">
                            <span className="text-[8px] sm:text-[9px] font-black text-zinc-500 uppercase tracking-tighter">Tendencia Neural</span>
                        </div>
                    </div>
                    <div className="mt-4 bg-zinc-950/20 rounded-2xl sm:rounded-3xl p-2 sm:p-6" style={{ height: '300px' }}>
                        {stats.constancyScore?.length > 0 && (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={stats.constancyScore} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorConstancy" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}
                                        itemStyle={{ color: '#10b981', fontSize: '10px', fontWeight: 'black', textTransform: 'uppercase' }}
                                        labelStyle={{ color: '#52525b', fontSize: '9px', fontWeight: 'bold' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="score"
                                        stroke="#10b981"
                                        strokeWidth={4}
                                        fillOpacity={1}
                                        fill="url(#colorConstancy)"
                                        animationDuration={1500}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>
            </div>
        </div>

            {/* Action Section */ }
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        {/* CTA Principal */}
        <div className="bg-indigo-600 rounded-2xl sm:rounded-[2.5rem] p-6 sm:p-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-48 sm:w-64 h-48 sm:h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 group-hover:bg-white/20 transition-all duration-700"></div>
            <div className="relative z-10">
                <h3 className="text-2xl sm:text-3xl font-black text-white mb-2 sm:mb-3 uppercase italic tracking-tighter">Coach IA</h3>
                <p className="text-indigo-100 mb-6 sm:mb-8 max-w-xs leading-relaxed text-sm sm:text-base">
                    Analizando tus datos... Tu fuerza ha subido un 5%. ¿Listo para una rutina de potencia?
                </p>
                <Link to="/coach" className="bg-white text-indigo-600 px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm uppercase tracking-widest hover:bg-indigo-50 transition-all flex items-center justify-center gap-2 sm:gap-3 w-fit">
                    <PlusCircle size={18} className="sm:w-5 sm:h-5" /> Generar Entrenamiento
                </Link>
            </div>
        </div>

        {/* Accesos Rápidos */}
        <div className="grid grid-cols-2 gap-4 sm:gap-6">
            <Link to="/rutinas" className="bg-zinc-900/40 border border-zinc-800 p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-[2.5rem] hover:border-emerald-500/40 hover:bg-zinc-900/60 transition-all duration-500 group flex flex-col items-center text-center justify-center gap-3 sm:gap-5 shadow-xl hover:shadow-emerald-500/5">
                <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-xl sm:rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg shadow-emerald-500/10">
                    <Weight size={24} className="sm:w-7 sm:h-7 lg:w-8 lg:h-8" />
                </div>
                <div>
                    <h4 className="font-black text-white uppercase tracking-tighter text-base sm:text-lg italic">Entrenar</h4>
                    <p className="text-[8px] sm:text-[9px] text-zinc-500 font-mono tracking-[0.2em] mt-1 bg-white/5 py-1 px-2 sm:px-3 rounded-full">EJECUTAR SESIÓN</p>
                </div>
            </Link>

            <Link to="/historial" className="bg-zinc-900/40 border border-zinc-800 p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-[2.5rem] hover:border-indigo-500/40 hover:bg-zinc-900/60 transition-all duration-500 group flex flex-col items-center text-center justify-center gap-3 sm:gap-5 shadow-xl hover:shadow-indigo-500/5">
                <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-xl sm:rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:scale-110 group-hover:-rotate-6 transition-all duration-500 shadow-lg shadow-indigo-500/10">
                    <Activity size={24} className="sm:w-7 sm:h-7 lg:w-8 lg:h-8" />
                </div>
                <div>
                    <h4 className="font-black text-white uppercase tracking-tighter text-base sm:text-lg italic">Historial</h4>
                    <p className="text-[8px] sm:text-[9px] text-zinc-500 font-mono tracking-[0.2em] mt-1 bg-white/5 py-1 px-2 sm:px-3 rounded-full">LOG DE DATOS</p>
                </div>
            </Link>
        </div>
    </div>
        </div >
    )
}