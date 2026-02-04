import { useState, useEffect, useMemo } from "react";
import { TrendingUp, Activity, Zap, Trophy, Timer, Loader2, Target } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { api } from "../lib/api";

export default function Stats() {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await api.get('/api/sesiones');
                setSessions(data || []);
            } catch (error) {
                console.error("Error al cargar estadísticas:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const stats = useMemo(() => {
        const now = new Date();
        const daysAbbr = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

        // Calcular el Lunes de la semana actual
        const monday = new Date(now);
        const dayOffset = now.getDay() === 0 ? -6 : 1 - now.getDay();
        monday.setDate(now.getDate() + dayOffset);
        monday.setHours(0, 0, 0, 0);

        const weekData = [];

        // Generar exactamente Lun, Mar, Mié, Jue, Vie, Sáb, Dom
        for (let i = 0; i < 7; i++) {
            const d = new Date(monday);
            d.setDate(monday.getDate() + i);

            const dayName = daysAbbr[d.getDay()];

            const sessionThatDay = sessions.find(s =>
                new Date(s.started_at).toLocaleDateString() === d.toLocaleDateString()
            );

            weekData.push({
                day: dayName,
                intensity: sessionThatDay ? (sessionThatDay.rating * 20 || 80) : 5,
                pulse: sessionThatDay ? (sessionThatDay.rating * 20) : null,
                isPast: d <= now,
                fullDate: d.toLocaleDateString()
            });
        }

        const totalMins = sessions.reduce((acc, s) => acc + (parseInt(s.duration_minutes || s.duration) || 0), 0);
        const weeklyCount = sessions.filter(s => new Date(s.started_at) >= monday).length;

        return { weeklyCount, totalMins, chartData: weekData };
    }, [sessions]);

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-20 gap-4">
            <Loader2 className="animate-spin text-cyan-400" size={40} />
            <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest">Sincronizando Sistemas...</p>
        </div>
    );

    return (
        <div data-testid="stats-page" className="max-w-6xl mx-auto space-y-8 pb-20 px-4">
            {/* Header Pro */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-white/5 pb-8 gap-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-8 bg-cyan-500 rounded-full shadow-[0_0_15px_cyan]"></div>
                        <h1 className="text-4xl md:text-6xl font-black text-white italic tracking-tighter uppercase">
                            Core <span className="text-zinc-500 text-3xl md:text-5xl">Metrics</span>
                        </h1>
                    </div>
                    <p className="text-zinc-500 font-mono text-[10px] uppercase tracking-[0.4em] ml-5">Status: Sistema Operativo & Sincronizado</p>
                </div>
                <div className="flex items-center gap-4 bg-zinc-900/50 p-2 rounded-2xl border border-white/5 backdrop-blur-md">
                    <div className="flex flex-col items-end px-4">
                        <span className="text-zinc-500 text-[9px] font-black uppercase tracking-widest">Global Rank</span>
                        <span className="text-white font-black italic">TOP 5%</span>
                    </div>
                    <div className="h-8 w-[1px] bg-white/10"></div>
                    <Trophy className="text-yellow-500 mx-2" size={24} />
                </div>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'Carga Semanal', val: stats.weeklyCount, unit: 'misiones', icon: Zap, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
                    { label: 'Tiempo Activo', val: stats.totalMins, unit: 'min', icon: Timer, color: 'text-purple-400', bg: 'bg-purple-400/10' },
                    { label: 'Puntaje IA', val: sessions.length > 0 ? (sessions.reduce((a, b) => a + (b.rating || 5), 0) / sessions.length).toFixed(1) : "0.0", unit: 'pts', icon: Activity, color: 'text-cyan-400', bg: 'bg-cyan-400/10' }
                ].map((kpi, idx) => (
                    <div key={idx} className="bg-[#09090b] border border-white/5 p-8 rounded-[2.5rem] relative overflow-hidden group">
                        <kpi.icon className={`absolute -right-4 -bottom-4 w-32 h-32 opacity-5 ${kpi.color} group-hover:scale-110 transition-transform`} />
                        <div className="relative z-10 space-y-4">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 ${kpi.bg} rounded-xl`}>
                                    <kpi.icon className={kpi.color} size={18} />
                                </div>
                                <span className="text-zinc-500 font-black text-[10px] uppercase tracking-widest">{kpi.label}</span>
                            </div>
                            <div className="flex items-baseline gap-2">
                                <span className="text-6xl font-black text-white tracking-tighter">{kpi.val}</span>
                                <span className="text-zinc-600 font-bold uppercase text-sm ml-1">{kpi.unit}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Monitor Graph */}
            <div className="bg-[#09090b] border border-white/5 rounded-[3rem] p-6 md:p-10 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(34,211,238,0.05),transparent)]"></div>

                <div className="relative z-10 flex flex-col md:flex-row justify-between mb-12 gap-6">
                    <div className="flex items-center gap-4">
                        <div className="p-4 bg-cyan-500/10 rounded-2xl border border-cyan-500/20">
                            <Activity className="text-cyan-400 animate-pulse" size={24} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Performance Monitor</h2>
                            <p className="text-zinc-500 text-[10px] font-mono uppercase tracking-[0.2em]">Live Data Stream • Últimos 7 Días</p>
                        </div>
                    </div>
                    <div className="hidden md:flex gap-4">
                        <div className="flex items-center gap-2 px-4 py-2 bg-black/40 rounded-xl border border-white/5">
                            <Target className="text-indigo-400" size={14} />
                            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Modo: Biométrico</span>
                        </div>
                    </div>
                </div>

                <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={stats.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorInt" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                            <XAxis
                                dataKey="day"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#52525b', fontSize: 12, fontWeight: '900' }}
                                dy={15}
                            />
                            <YAxis domain={[0, 100]} hide />
                            <Tooltip
                                cursor={{ stroke: '#22d3ee', strokeWidth: 1, strokeDasharray: '5 5' }}
                                contentStyle={{ backgroundColor: '#000', border: '1px solid #22d3ee33', borderRadius: '15px', color: '#fff' }}
                            />
                            <Area
                                type="monotone"
                                dataKey="intensity"
                                stroke="#22d3ee"
                                strokeWidth={4}
                                fillOpacity={1}
                                fill="url(#colorInt)"
                                animationDuration={2000}
                                dot={{ fill: '#000', stroke: '#22d3ee', strokeWidth: 2, r: 4, fillOpacity: 1 }}
                                activeDot={{ r: 8, fill: '#22d3ee', stroke: '#fff', strokeWidth: 2 }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                <div className="mt-8 grid grid-cols-7 gap-1 border-t border-white/5 pt-8">
                    {stats.chartData.map((d, i) => (
                        <div key={i} className="flex flex-col items-center gap-2">
                            <div className={`w-1.5 h-1.5 rounded-full ${d.intensity > 15 ? 'bg-cyan-500 shadow-[0_0_10px_cyan]' : 'bg-zinc-800'}`}></div>
                            <span className="text-[8px] font-black text-zinc-600 uppercase tracking-tighter">{d.day}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
