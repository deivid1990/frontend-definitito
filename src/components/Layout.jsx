import React, { useState, useEffect } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { LayoutDashboard, Dumbbell, Calendar, History, BrainCircuit, LogOut, User, Activity, Menu, X, Camera } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Layout() {
    const { signOut } = useAuth()
    const location = useLocation()
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    const navItems = [
        { path: '/dashboard', label: 'Centro de Mando', icon: LayoutDashboard },
        { path: '/rutinas', label: 'Rutina semanal', icon: Calendar },
        { path: '/biblioteca', label: 'Tutorial de ejercicios', icon: Dumbbell },
        { path: '/historial', label: 'Registros', icon: History },
        { path: '/progreso', label: 'Mis Progresos', icon: Camera },
        { path: '/coach', label: 'IA Coach', icon: BrainCircuit },
        { path: '/perfil', label: 'Mis biometrías', icon: User },
    ]

    return (
        <div className="flex h-screen bg-deep-space text-white overflow-hidden font-sans selection:bg-neon-blue selection:text-black">
            {/* Sidebar / Menú Lateral Premium */}
            <aside className="w-64 lg:w-80 bg-black/40 border-r border-white/5 p-4 lg:p-8 flex flex-col hidden md:flex backdrop-blur-2xl relative z-20">
                {/* Decorative Laser Line */}
                <div className="absolute top-0 right-0 w-[1px] h-full bg-gradient-to-b from-transparent via-indigo-500/50 to-transparent"></div>

                <Link to="/dashboard" className="mb-8 lg:mb-14 flex items-center gap-3 lg:gap-5 px-2 group/logo hover:opacity-80 transition-opacity">
                    <div className="relative">
                        <div className="absolute -inset-1 bg-indigo-500 rounded-lg blur opacity-30 animate-pulse-slow"></div>
                        <div className="relative p-2.5 lg:p-3.5 bg-black rounded-xl border border-indigo-500/30 shadow-[inset_0_0_10px_rgba(79,70,229,0.2)]">
                            <Activity size={24} className="lg:w-8 lg:h-8 text-indigo-400" />
                        </div>
                    </div>
                    <div>
                        <h1 className="text-xl lg:text-3xl font-black italic tracking-tighter text-white uppercase leading-none">
                            GYM<span className="text-indigo-500">AI</span> COACH
                        </h1>
                        <p className="text-[8px] lg:text-[10px] text-zinc-500 font-mono tracking-[0.2em] uppercase mt-1 hidden lg:block">EL ENTRENAMIENTO DEL FUTURO</p>
                    </div>
                </Link>

                <nav className="flex-1 space-y-2">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-3 lg:gap-4 px-3 lg:px-5 py-3 lg:py-4.5 rounded-xl transition-all duration-500 group relative overflow-hidden ${isActive
                                    ? 'bg-indigo-600/10 text-white border border-indigo-500/20 text-shadow-neon'
                                    : 'text-zinc-500 hover:text-zinc-200 hover:bg-white/5'
                                    }`}
                            >
                                {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 h-10 w-[3px] bg-indigo-500 shadow-[0_0_15px_#6366f1]"></div>}
                                <item.icon size={20} className={`lg:w-[26px] lg:h-[26px] transition-all duration-500 ${isActive ? 'text-indigo-400 scale-110' : 'group-hover:text-indigo-400'}`} />
                                <span className={`text-sm lg:text-lg tracking-wide transition-all ${isActive ? 'font-black uppercase italic' : 'font-medium'}`}>{item.label}</span>
                            </Link>
                        )
                    })}
                </nav>

                <button
                    onClick={signOut}
                    className="flex items-center gap-4 px-5 py-5 rounded-xl text-zinc-600 hover:text-red-400 hover:bg-red-500/5 transition-all mt-auto group font-mono text-sm tracking-widest uppercase border border-transparent hover:border-red-500/10"
                >
                    <LogOut size={24} className="group-hover:-translate-x-1 transition-transform" />
                    <span>Desconectar</span>
                </button>
            </aside>

            {/* Mobile Header */}
            <div className="md:hidden fixed top-0 left-0 w-full bg-black/80 backdrop-blur-lg border-b border-white/5 p-4 flex justify-between items-center z-50">
                <Link to="/dashboard" className="flex items-center gap-2">
                    <Activity className="text-indigo-400" size={20} />
                    <span className="font-black italic text-sm">GYMAI COACH</span>
                </Link>
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="p-2 text-zinc-400 hover:text-white"
                >
                    {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Sidebar Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-black/90 z-40 backdrop-blur-sm animate-in fade-in"
                    onClick={() => setIsMobileMenuOpen(false)}
                >
                    <div
                        className="w-72 bg-zinc-950 h-full p-8 border-r border-white/10 flex flex-col gap-8 animate-in slide-in-from-left"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Logo Mobile */}
                        <Link to="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3">
                            <Activity className="text-indigo-400" size={28} />
                            <h1 className="text-xl font-black italic text-white uppercase tracking-tighter">
                                GYM<span className="text-indigo-500">AI</span> COACH
                            </h1>
                        </Link>

                        <nav className="flex-1 space-y-2">
                            {navItems.map((item) => {
                                const isActive = location.pathname === item.path
                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className={`flex items-center gap-3 px-4 py-4 rounded-xl transition-all ${isActive ? 'bg-indigo-600/10 text-indigo-400' : 'text-zinc-500'}`}
                                    >
                                        <item.icon size={20} />
                                        <span className="font-bold uppercase text-xs tracking-widest">{item.label}</span>
                                    </Link>
                                )
                            })}
                        </nav>

                        <button onClick={signOut} className="flex items-center gap-3 text-red-400/70 p-4 font-black uppercase text-[10px] tracking-[0.2em]">
                            <LogOut size={16} /> Salir del Sistema
                        </button>
                    </div>
                </div>
            )}

            {/* Contenido Principal con Iluminación Ambiental */}
            <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 pt-20 md:pt-8 overflow-y-auto relative bg-[#050510]">
                {/* Background Tech Overlays */}
                <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none z-0"></div>
                <div className="fixed inset-0 bg-cyber-grid opacity-[0.05] pointer-events-none z-0"></div>

                {/* Status Bar Top */}
                <div className="fixed top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50 z-50"></div>

                {/* Cyber Glows */}
                <div className="fixed top-[-10%] right-[-5%] w-[600px] h-[600px] bg-indigo-600/5 rounded-full blur-[120px] pointer-events-none z-0"></div>
                <div className="fixed bottom-0 left-0 w-[400px] h-[400px] bg-purple-600/5 rounded-full blur-[100px] pointer-events-none z-0 animate-pulse-slow"></div>

                <div className="relative z-10">
                    <Outlet />
                </div>
            </main>
        </div>
    )
}