import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Routines from '../pages/Routines'
import { api } from '../lib/api'

// Mock api
vi.mock('../lib/api', () => ({
    api: {
        get: vi.fn(),
        delete: vi.fn(),
    },
}))

const renderWithRouter = (component) => {
    return render(
        <MemoryRouter>
            {component}
        </MemoryRouter>
    )
}

describe('Routines Component', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('debe renderizar la lista completa con días de descanso y puntuaciones', async () => {
        const mockRoutines = [
            {
                id: 1,
                name: 'Plan Elite',
                days_per_week: 3,
                goal: 'Hipertrofia',
                updated_at: new Date().toISOString(),
                routine_days: [
                    { day_number: 1, name: 'Empuje' },
                    { day_number: 3, name: 'Tracción' },
                    { day_number: 5, name: 'Pierna' }
                ]
            }
        ]
        const mockSessions = [
            { id: 101, routine_id: 1, day_number: 1, rating: 5, started_at: new Date().toISOString() }
        ]

        api.get.mockImplementation((url) => {
            if (url === '/api/rutinas') return Promise.resolve(mockRoutines)
            if (url === '/api/sesiones') return Promise.resolve(mockSessions)
            return Promise.resolve([])
        })

        renderWithRouter(<Routines />)

        await screen.findByText(/Plan Elite/i)

        // Verificar días activos y descanso
        expect(screen.getByText(/Empuje/i)).toBeInTheDocument()
        expect(screen.getByText(/Tracción/i)).toBeInTheDocument()
        expect(screen.getByText(/Pierna/i)).toBeInTheDocument()
        expect(screen.getAllByText(/Descanso/i).length).toBeGreaterThan(0)

        // Verificar estrellas (rating)
        const stars = document.querySelectorAll('.fill-yellow-400')
        expect(stars.length).toBe(5) // Rating 5 = 5 estrellas
    })

    it('debe manejar errores en la eliminación con alerta', async () => {
        const mockRoutines = [{ id: 1, name: 'Rutina Test', days_per_week: 3 }]
        api.get.mockResolvedValueOnce(mockRoutines).mockResolvedValue([])
        api.delete.mockRejectedValue(new Error('No autorizado'))
        window.alert = vi.fn()

        const { container } = renderWithRouter(<Routines />)
        await screen.findByText(/Rutina Test/i)

        const deleteBtn = container.querySelector('.lucide-trash2').closest('button')
        fireEvent.click(deleteBtn)

        const confirmBtn = screen.getByText(/SÍ, ELIMINAR/i)
        fireEvent.click(confirmBtn)

        await waitFor(() => {
            expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('No autorizado'))
        })
    })

    it('debe mostrar mensaje de error si la carga falla', async () => {
        api.get.mockRejectedValue(new Error('Network error'))
        vi.spyOn(console, 'error').mockImplementation(() => { })

        renderWithRouter(<Routines />)

        await screen.findByText(/No pudimos cargar tus rutinas/i)
    })
})
