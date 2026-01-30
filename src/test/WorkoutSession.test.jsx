import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import WorkoutSession from '../pages/WorkoutSession'
import { AuthContext } from '../context/AuthContext'
import { api } from '../lib/api'

// Mock API
vi.mock('../lib/api', () => ({
    api: {
        get: vi.fn(),
        post: vi.fn(),
    },
}))

// Mock components
vi.mock('../components/ExerciseVideo', () => ({
    default: ({ isOpen, onClose }) => isOpen ? (
        <div data-testid="exercise-video">
            <button onClick={onClose}>Cerrar Video</button>
        </div>
    ) : null
}))

const mockAuthContext = { user: { id: 'test-user-id' } }

const renderWithRouter = (routineId = '1', dayNumber = '1') => {
    return render(
        <MemoryRouter initialEntries={[`/entrenar/${routineId}/${dayNumber}`]}>
            <AuthContext.Provider value={mockAuthContext}>
                <Routes>
                    <Route path="/entrenar/:routineId/:dayNumber" element={<WorkoutSession />} />
                    <Route path="/rutinas" element={<div>Rutinas</div>} />
                </Routes>
            </AuthContext.Provider>
        </MemoryRouter>
    )
}

describe('WorkoutSession Component', () => {
    const mockRoutine = {
        id: '1',
        name: 'Rutina Power',
        routine_days: [
            {
                day_number: 1,
                name: 'Pecho-Triceps',
                routine_exercises: [
                    {
                        exercise_id: 10,
                        sets: 1,
                        reps: 10,
                        target_weight: 80,
                        exercise: { name: 'Press Superior', id: 10 }
                    }
                ]
            }
        ]
    }

    beforeEach(() => {
        vi.clearAllMocks()
        api.get.mockResolvedValue(mockRoutine)
    })

    it('debe completar sets y guardar entrenamiento', async () => {
        api.post.mockResolvedValue({ success: true })
        const { container } = renderWithRouter()

        await screen.findByText(/Rutina Power/i)

        // Completar el set
        const checkBtn = container.querySelector('.lucide-check-circle').closest('button')
        fireEvent.click(checkBtn)

        // Guardar entrenamiento
        const saveBtn = screen.getByText(/GUARDAR ENTRENAMIENTO/i)
        fireEvent.click(saveBtn)

        // Esperar al modal de resumen
        const confirmFinalBtn = await screen.findByText(/GUARDAR EN EL NÚCLEO/i)
        fireEvent.click(confirmFinalBtn)

        await waitFor(() => {
            expect(api.post).toHaveBeenCalledWith('/api/sesiones', expect.any(Object))
        })
    })

    it('debe permitir abrir y cerrar el video del ejercicio', async () => {
        renderWithRouter()
        await screen.findByText(/Press Superior/i)

        const tutorialBtn = screen.getByText(/Tutorial/i)
        fireEvent.click(tutorialBtn)

        expect(screen.getByTestId('exercise-video')).toBeInTheDocument()

        fireEvent.click(screen.getByText(/Cerrar Video/i))
        expect(screen.queryByTestId('exercise-video')).not.toBeInTheDocument()
    })

    it('debe mostrar error si la rutina no existe', async () => {
        api.get.mockResolvedValue(null)
        renderWithRouter('999', '1')

        await screen.findByText(/Rutina no encontrada/i)
    })

    it('debe permitir ajustar peso y repeticiones', async () => {
        renderWithRouter()
        await screen.findByText(/Press Superior/i)

        const inputs = screen.getAllByRole('spinbutton')
        // Index 0: weight, Index 1: reps (for the first set)
        fireEvent.change(inputs[0], { target: { value: '90' } })
        fireEvent.change(inputs[1], { target: { value: '12' } })

        expect(inputs[0].value).toBe('90')
        expect(inputs[1].value).toBe('12')
    })
})
