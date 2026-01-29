import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import ProgressAnalysis from '../pages/ProgressAnalysis'
import { AuthContext } from '../context/AuthContext'
import { api } from '../lib/api'

// Mock API
vi.mock('../lib/api', () => ({
    api: {
        post: vi.fn(),
    },
}))

// Mock components
vi.mock('../components/ExerciseVideo', () => ({
    default: ({ isOpen, exerciseName }) => isOpen ? <div data-testid="video-modal">{exerciseName}</div> : null
}))

const mockAuthContext = {
    user: { id: 'test-user-id' },
    loading: false,
}

const renderWithRouter = (component) => {
    return render(
        <MemoryRouter>
            <AuthContext.Provider value={mockAuthContext}>
                {component}
            </AuthContext.Provider>
        </MemoryRouter>
    )
}

describe('ProgressAnalysis Component', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('debe manejar diferentes estados de análisis (stalled, progress)', async () => {
        api.post.mockResolvedValueOnce({
            status: 'stalled',
            suggestion: 'Cambia el rango de repeticiones',
            analysis: 'Sin mejoras en 3 semanas.',
            recommended_changes: []
        })

        renderWithRouter(<ProgressAnalysis />)
        fireEvent.click(screen.getByText(/Realizar Análisis IA/i))

        await waitFor(() => {
            expect(screen.getByText(/MESETA DETECTADA/i)).toBeInTheDocument()
            expect(screen.getByText(/Cambia el rango de repeticiones/i)).toBeInTheDocument()
        })
    })

    it('debe mostrar advertencias de seguridad y cambios recomendados', async () => {
        api.post.mockResolvedValue({
            status: 'progressing',
            suggestion: 'Mantén el ritmo',
            analysis: 'Todo perfecto.',
            safety_warning: 'Cuidado con la espalda baja',
            recommended_changes: [
                { exercise: 'Peso Muerto', reason: 'Fatiga acumulada', value: '-10kg' }
            ]
        })

        renderWithRouter(<ProgressAnalysis />)
        fireEvent.click(screen.getByText(/Realizar Análisis IA/i))

        await waitFor(() => {
            expect(screen.getByText(/Cuidado con la espalda baja/i)).toBeInTheDocument()
            expect(screen.getByText(/Peso Muerto/i)).toBeInTheDocument()
            expect(screen.getByText(/-10kg/i)).toBeInTheDocument()
        })
    })

    it('debe abrir el modal de video desde los resultados de búsqueda', async () => {
        renderWithRouter(<ProgressAnalysis />)

        // Buscar
        const searchInput = screen.getByPlaceholderText(/Buscar ejecución técnica/i)
        fireEvent.change(searchInput, { target: { value: 'Press' } })

        await waitFor(() => {
            const playIcons = document.querySelectorAll('.lucide-play-circle')
            expect(playIcons.length).toBeGreaterThan(0)
        })

        const playIcons = document.querySelectorAll('.lucide-play-circle')
        fireEvent.click(playIcons[0].closest('button'))

        expect(screen.getByTestId('video-modal')).toBeInTheDocument()
    })
})
