import { useMemo } from "react";
import { TrendingUp, Activity } from "lucide-react";

export default function Stats() {
    const data = useMemo(
        () => [
            { day: "Lun", score: 6 },
            { day: "Mar", score: 7 },
            { day: "Mié", score: 5 },
            { day: "Jue", score: 8 },
            { day: "Vie", score: 9 },
            { day: "Sáb", score: 4 },
            { day: "Dom", score: 7 },
        ],
        []
    );

    const weeklySessions = 4;
    const target = 6;

    return (
        <div data-testid="stats-page" className="max-w-5xl mx-auto space-y-8 pb-20">
            <div className="flex items-center gap-4">
                <TrendingUp className="text-indigo-400" size={28} />
                <h1 data-testid="stats-title" className="text-4xl font-black text-white uppercase italic tracking-tighter">
                    Mis estadísticas
                </h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div data-testid="stats-weekly-sessions" className="bg-[#0f0f12] border border-white/5 rounded-[2rem] p-8">
                    <div className="text-zinc-500 font-bold text-xs uppercase tracking-[0.3em]">Sesiones esta semana</div>
                    <div className="text-5xl font-black text-white mt-3">{weeklySessions}</div>
                </div>

                <div data-testid="stats-chart-7d" className="bg-[#0f0f12] border border-white/5 rounded-[2rem] p-8 overflow-x-auto">
                    <div className="flex items-center gap-3 mb-6">
                        <Activity className="text-indigo-400" size={18} />
                        <h2 className="text-white font-black uppercase italic tracking-widest text-sm">
                            Constancia últimos 7 días
                        </h2>
                    </div>

                    <div className="flex gap-4 items-end min-w-[520px]">
                        {data.map((d) => {
                            const ok = d.score >= target;
                            return (
                                <div key={d.day} className="flex flex-col items-center gap-2">
                                    <div className="text-xs text-zinc-500 font-bold">{d.score}</div>
                                    <div
                                        data-testid={`stats-bar-${d.day}`}
                                        className={`w-10 rounded-xl ${ok ? "bg-green-500" : "bg-red-500"}`}
                                        style={{ height: `${d.score * 14}px` }}
                                    />
                                    <div className="text-xs text-zinc-500 font-bold">{d.day}</div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
