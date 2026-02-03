import React, { useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import {
    LayoutDashboard,
    Dumbbell,
    Calendar,
    History,
    BrainCircuit,
    LogOut,
    User,
    Activity,
    Menu,
    X,
    Camera
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Layout() {
    const { signOut } = useAuth()
    const location = useLocation()
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    // ===== MENÚ PRINCIPAL (con testids para Cypress) =====
    const navItems = [
        { path: '/dashboard', label: 'Centro de Mando', icon: LayoutDashboard, testId: 'nav-dashboard' },
        { path: '/rutinas', label: 'Rutina semanal', icon: Calendar, testId: 'nav-routines' },
        { path: '/biblioteca', label: 'Tutorial de ejercicios', icon: Dumbbell, testId: 'nav-exercises' },
        { path: '/historial', label: 'Registros', icon: History, testId: 'nav-history' },
        { path: '/progreso', label: 'Mis Progresos', icon: Camera, testId: 'nav-progress' },

        // ✅ RF-06 ESTADÍSTICAS
        { path: '/estadisticas', label: 'Estadísticas', icon: Activity, testId: 'nav-stats' },

        { path: '/coach', label: 'IA Coach', icon: BrainCircuit, testId: 'nav-ai-coach' },
        { path: '/perfil', label: 'Mis biometrías', icon: User, testId: 'nav-profile' },
    ]

    return (
        <div className="flex h-screen bg-deep-space text-white overflow-hidden font-sans">

            {/* ===== SIDEBAR DESKTOP ===== */}
            <aside className="w-64 lg:w-80 bg-black/40 border-r border-white/5 p-4 lg:p-8 hidden md:flex flex-col backdrop-blur-2xl relative z-20">
                <div className="absolute top-0 right-0 w-[1px] h-full bg-gradient-to-b from-transparent via-indigo-500/50 to-transparent"></div>

                {/* LOGO */}
                <Link to="/dashboard" className="mb-10 flex items-center gap-4 px-2">
                    <Activity size={28} className="text-indigo-400" />
                    <h1 className="text-2xl font-black italic tracking-tighter uppercase">
                        GYM<span className="text-indigo-500">AI</span> COACH
                    </h1>
                </Link>

                {/* NAV */}
                <nav className="flex-1 space-y-2 overflow-y-auto pr-2">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                data-testid={item.testId}
                                className={`flex items-center gap-4 px-5 py-4 rounded-xl transition-all ${isActive
                                        ? 'bg-indigo-600/10 text-white border border-indigo-500/20'
                                        : 'text-zinc-500 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                <item.icon size={20} className={isActive ? 'text-indigo-400' : ''} />
                                <span className="text-sm font-medium">{item.label}</span>
                            </Link>
                        )
                    })}
                </nav>

                {/* LOGOUT */}
                <button
                    onClick={signOut}
                    className="flex items-center gap-4 px-5 py-5 mt-auto rounded-xl text-zinc-500 hover:text-red-400 hover:bg-red-500/5 transition-all uppercase text-sm"
                >
                    <LogOut size={20} />
                    Salir
                </button>
            </aside>

            {/* ===== HEADER MOBILE ===== */}
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

            {/* ===== SIDEBAR MOBILE ===== */}
            {isMobileMenuOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-black/90 z-40"
                    onClick={() => setIsMobileMenuOpen(false)}
                >
                    <div
                        className="w-72 bg-zinc-950 h-full p-8 border-r border-white/10 flex flex-col gap-8"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <nav className="space-y-2">
                            {navItems.map((item) => (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    data-testid={item.testId}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="flex items-center gap-3 px-4 py-4 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5"
                                >
                                    <item.icon size={18} />
                                    <span className="uppercase text-xs font-bold tracking-widest">
                                        {item.label}
                                    </span>
                                </Link>
                            ))}
                        </nav>

                        <button
                            onClick={signOut}
                            className="flex items-center gap-3 text-red-400 p-4 font-black uppercase text-xs tracking-widest"
                        >
                            <LogOut size={16} /> Salir
                        </button>
                    </div>
                </div>
            )}

            {/* ===== CONTENIDO ===== */}
            <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 pt-20 md:pt-8 overflow-y-auto bg-[#050510]">
                <Outlet />
            </main>
        </div>
    )
}
