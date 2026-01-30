import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import ExerciseVideo from '../components/ExerciseVideo'
import ManualWorkoutModal from '../components/ManualWorkoutModal'
import ConfirmModal from '../components/ConfirmModal'
import WorkoutSummaryModal from '../components/WorkoutSummaryModal'
import ProtectedRoute from '../components/ProtectedRoute'
import { AuthContext } from '../context/AuthContext'

describe('Componentes UI de Soporte', () => {

    describe('ConfirmModal', () => {
        it('debe renderizar título y mensaje por defecto cuando está abierto', () => {
            render(<ConfirmModal isOpen={true} onClose={vi.fn()} onConfirm={vi.fn()} />)
            expect(screen.getByText(/¿Confirmar Acción?/i)).toBeInTheDocument()
            expect(screen.getByText(/¿Estás seguro de que deseas eliminar este registro?/i)).toBeInTheDocument()
        })

        it('debe renderizar título y mensaje personalizados', () => {
            render(
                <ConfirmModal
                    isOpen={true}
                    onClose={vi.fn()}
                    onConfirm={vi.fn()}
                    title="Eliminar ejercicio"
                    message="Se borrará permanentemente."
                />
            )
            expect(screen.getByText(/Eliminar ejercicio/i)).toBeInTheDocument()
            expect(screen.getByText(/Se borrará permanentemente./i)).toBeInTheDocument()
        })

        it('debe llamar onClose al hacer click en Cancelar o en X', () => {
            const onClose = vi.fn()
            render(<ConfirmModal isOpen={true} onClose={onClose} onConfirm={vi.fn()} cancelText="Cancelar" confirmText="Eliminar" />)
            fireEvent.click(screen.getByText(/Cancelar/i))
            expect(onClose).toHaveBeenCalledTimes(1)
        })

        it('debe llamar onConfirm al hacer click en el botón de confirmar', () => {
            const onConfirm = vi.fn()
            render(<ConfirmModal isOpen={true} onClose={vi.fn()} onConfirm={onConfirm} confirmText="Eliminar" />)
            const confirmBtn = screen.getByRole('button', { name: /Eliminar/i })
            fireEvent.click(confirmBtn)
            expect(onConfirm).toHaveBeenCalledTimes(1)
        })

        it('debe retornar null cuando isOpen es false', () => {
            const { container } = render(<ConfirmModal isOpen={false} onClose={vi.fn()} onConfirm={vi.fn()} />)
            expect(container.firstChild).toBeNull()
        })
    })

    describe('ExerciseVideo', () => {
        it('debe renderizar correctamente con URL de YouTube', () => {
            render(
                <ExerciseVideo
                    isOpen={true}
                    onClose={vi.fn()}
                    videoUrl="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                    exerciseName="Press de Banca"
                />
            )
            expect(screen.getByTitle(/Press de Banca/i)).toBeInTheDocument()
            expect(screen.getByTitle(/Press de Banca/i).src).toContain('embed/dQw4w9WgXcQ')
        })

        it('debe mostrar buscador si no hay URL', () => {
            render(<ExerciseVideo isOpen={true} onClose={vi.fn()} videoUrl={null} exerciseName="Sentadilla" />)
            expect(screen.getByText(/Sin video directo disponible/i)).toBeInTheDocument()
            expect(screen.getByText(/Buscar en YouTube Externo/i)).toBeInTheDocument()
        })

        it('debe retornar null si no está abierto', () => {
            const { container } = render(<ExerciseVideo isOpen={false} />)
            expect(container.firstChild).toBeNull()
        })
    })

    describe('ManualWorkoutModal', () => {
        it('debe manejar el flujo de guardado manual', async () => {
            const onSave = vi.fn()
            render(<ManualWorkoutModal isOpen={true} onClose={vi.fn()} onSave={onSave} />)

            fireEvent.change(screen.getByPlaceholderText(/Ej: Pecho y Tríceps/i), { target: { value: 'Entreno Pro' } })

            // Cambiar duración
            const inputs = screen.getAllByRole('spinbutton')
            fireEvent.change(inputs[0], { target: { value: '1' } }) // 1 hora
            fireEvent.change(inputs[1], { target: { value: '30' } }) // 30 minutos

            fireEvent.click(screen.getByText(/GUARDAR EN HISTORIAL/i))

            await waitFor(() => {
                expect(onSave).toHaveBeenCalledWith(expect.objectContaining({
                    name: 'Entreno Pro',
                    duration_minutes: 90
                }))
            })
        })

        it('debe cargar datos iniciales en modo edición', () => {
            const initialData = { name: 'Edit Me', duration_minutes: 60, rating: 4, started_at: new Date().toISOString() }
            render(<ManualWorkoutModal isOpen={true} onClose={vi.fn()} onSave={vi.fn()} initialData={initialData} />)

            expect(screen.getByDisplayValue(/Edit Me/i)).toBeInTheDocument()
            const inputs = screen.getAllByRole('spinbutton')
            expect(inputs[0].value).toBe('1') // 60 min = 1h
            expect(inputs[1].value).toBe('0')
        })
    })

    describe('WorkoutSummaryModal', () => {
        it('debe permitir calificar y confirmar', () => {
            const onConfirm = vi.fn()
            render(<WorkoutSummaryModal isOpen={true} onClose={vi.fn()} onConfirm={onConfirm} routineName="Test Routine" initialDuration={45} />)

            fireEvent.click(screen.getByText(/GUARDAR EN EL NÚCLEO/i))
            expect(onConfirm).toHaveBeenCalledWith({ rating: 5, duration: 45 })
        })

        it('debe retornar null cuando isOpen es false', () => {
            const { container } = render(<WorkoutSummaryModal isOpen={false} onConfirm={vi.fn()} routineName="Test" />)
            expect(container.firstChild).toBeNull()
        })
    })

    describe('ProtectedRoute', () => {
        it('debe mostrar cargando cuando loading es true', () => {
            render(
                <AuthContext.Provider value={{ session: null, loading: true }}>
                    <MemoryRouter>
                        <ProtectedRoute />
                    </MemoryRouter>
                </AuthContext.Provider>
            )
            expect(screen.getByText(/Verificando Credenciales/i)).toBeInTheDocument()
        })

        it('debe redirigir a /login cuando no hay sesión', () => {
            render(
                <AuthContext.Provider value={{ session: null, loading: false }}>
                    <MemoryRouter initialEntries={['/dashboard']}>
                        <Routes>
                            <Route path="/" element={<ProtectedRoute />}>
                                <Route path="dashboard" element={<div>Dashboard</div>} />
                            </Route>
                            <Route path="/login" element={<div>Login</div>} />
                        </Routes>
                    </MemoryRouter>
                </AuthContext.Provider>
            )
            expect(screen.getByText(/Login/i)).toBeInTheDocument()
        })

        it('debe renderizar Outlet cuando hay sesión', () => {
            render(
                <AuthContext.Provider value={{ session: { user: { id: '1' } }, loading: false }}>
                    <MemoryRouter initialEntries={['/dashboard']}>
                        <Routes>
                            <Route path="/" element={<ProtectedRoute />}>
                                <Route path="dashboard" element={<div>Contenido protegido</div>} />
                            </Route>
                        </Routes>
                    </MemoryRouter>
                </AuthContext.Provider>
            )
            expect(screen.getByText(/Contenido protegido/i)).toBeInTheDocument()
        })
    })
})
