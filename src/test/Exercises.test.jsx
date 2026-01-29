import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Exercises from '../pages/Exercises'
import { AuthContext } from '../context/AuthContext'
import { supabase } from '../lib/supabaseClient'

// Mock Supabase
vi.mock('../lib/supabaseClient', () => ({
    supabase: {
        from: vi.fn(),
    },
}))

const mockAuthContext = { user: { id: 'test-user-id' } }

const renderExercises = () => render(
    <MemoryRouter>
        <AuthContext.Provider value={mockAuthContext}>
            <Exercises />
        </AuthContext.Provider>
    </MemoryRouter>
)

describe('Exercises Component', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('debe permitir editar un ejercicio existente', async () => {
        const mockExercises = [{ id: 1, name: 'Press', muscle_group: 'Pecho', user_id: 'test-user-id' }]

        supabase.from.mockImplementation((table) => ({
            select: () => ({ eq: () => ({ order: () => Promise.resolve({ data: mockExercises, error: null }) }) }),
            update: () => ({ eq: () => ({ eq: () => Promise.resolve({ error: null }) }) })
        }))

        renderExercises()
        await screen.findByText('Press')

        const editBtn = screen.getByTitle(/Editar ejercicio/i)
        fireEvent.click(editBtn)

        // Buscamos el título del modal usando un matcher más específico para evitar ambigüedad con el texto del botón o descripción
        expect(screen.getByRole('heading', { name: /Editar Protocolo/i })).toBeInTheDocument()

        const nameInput = screen.getByDisplayValue('Press')
        fireEvent.change(nameInput, { target: { value: 'Press Pro' } })

        fireEvent.click(screen.getByText(/ACTUALIZAR EJERCICIO/i))

        await waitFor(() => {
            expect(screen.queryByText(/ACTUALIZAR EJERCICIO/i)).not.toBeInTheDocument()
        })
    })

    it('debe permitir eliminar un ejercicio', async () => {
        const mockExercises = [{ id: 1, name: 'Bicep', muscle_group: 'Brazo', user_id: 'test-user-id' }]
        const deleteMock = vi.fn().mockReturnValue({ eq: () => Promise.resolve({ error: null }) })

        supabase.from.mockImplementation((table) => {
            if (table === 'exercises') return {
                select: () => ({ eq: () => ({ order: () => Promise.resolve({ data: mockExercises, error: null }) }) }),
                delete: deleteMock
            }
        })

        renderExercises()
        await screen.findByText('Bicep')

        const deleteBtn = screen.getByTitle(/Eliminar ejercicio/i)
        fireEvent.click(deleteBtn)

        fireEvent.click(screen.getByText(/SÍ, ELIMINAR/i))

        await waitFor(() => {
            expect(deleteMock).toHaveBeenCalled()
            expect(screen.queryByText('Bicep')).not.toBeInTheDocument()
        })
    })

    it('debe mostrar resultados globales cuando no hay locales', async () => {
        supabase.from.mockReturnValue({
            select: () => ({ eq: () => ({ order: () => Promise.resolve({ data: [], error: null }) }) })
        })

        renderExercises()

        const searchInput = screen.getByPlaceholderText(/Buscar por nombre/i)
        fireEvent.change(searchInput, { target: { value: 'Press' } })

        await screen.findByText(/Inteligencia Artifical: Tutoriales Encontrados/i)
    })
})
