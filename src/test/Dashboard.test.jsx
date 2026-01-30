import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Dashboard from '../pages/Dashboard'
import { AuthContext } from '../context/AuthContext'
import { supabase } from '../lib/supabaseClient'

// Mock Supabase
vi.mock('../lib/supabaseClient', () => ({
    supabase: {
        from: vi.fn()
    }
}))

// Mock recharts (evitar renderizar SVG/defs que generan warnings en jsdom)
vi.mock('recharts', () => ({
    ResponsiveContainer: ({ children }) => <div data-testid="responsive-container">{children}</div>,
    AreaChart: () => <div data-testid="area-chart" />,
    Area: () => null,
    Tooltip: () => null,
}))

const mockAuthContext = {
    user: { id: 'test-user-id', email: 'test@test.com' },
}

const renderDashboard = () => render(
    <MemoryRouter>
        <AuthContext.Provider value={mockAuthContext}>
            <Dashboard />
        </AuthContext.Provider>
    </MemoryRouter>
)

describe('Dashboard Component', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('debe calcular correctamente las estadísticas de sesiones', async () => {
        const today = new Date().toISOString()
        const mockSessions = [
            { id: 1, started_at: today },
            { id: 2, started_at: today } // Dos sesiones hoy cuentan como 1 día único en la semana
        ]

        const mockEq = vi.fn().mockReturnThis()
        const mockOrder = vi.fn().mockResolvedValue({ data: mockSessions, error: null })
        const mockSelect = vi.fn().mockReturnThis()

        supabase.from.mockReturnValue({
            select: () => ({
                eq: () => ({
                    order: mockOrder
                })
            })
        })

        renderDashboard()

        await screen.findByText(/EL ENTRENAMIENTO/i)

        // Debe mostrar 1 sesión única esta semana (porque las dos son el mismo día)
        // Pero el total histórico es 2
        expect(screen.getByText('1')).toBeInTheDocument()
        expect(screen.getByText(/Histórico total: 2/i)).toBeInTheDocument()
    })

    it('debe manejar errores al cargar estadísticas', async () => {
        vi.spyOn(console, 'error').mockImplementation(() => { })
        supabase.from.mockReturnValue({
            select: () => ({
                eq: () => ({
                    order: vi.fn().mockRejectedValue(new Error('Auth fail'))
                })
            })
        })

        renderDashboard()

        // Aunque falle, debe terminar la carga y mostrar el contenido
        await screen.findByText(/EL ENTRENAMIENTO/i)
    })
})
