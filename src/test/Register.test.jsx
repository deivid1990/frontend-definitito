import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Register from '../pages/Register'
import { AuthContext } from '../context/AuthContext'
import { supabase } from '../lib/supabaseClient'

// Mock de Supabase
vi.mock('../lib/supabaseClient', () => ({
    supabase: {
        from: vi.fn(() => ({
            insert: vi.fn().mockResolvedValue({ error: null })
        }))
    }
}))

// Mock de AuthContext
const mockSignUp = vi.fn()
const mockAuthValue = {
    signUp: mockSignUp,
    user: null
}

const renderRegister = () => {
    return render(
        <MemoryRouter>
            <AuthContext.Provider value={mockAuthValue}>
                <Register />
            </AuthContext.Provider>
        </MemoryRouter>
    )
}

describe('Register Component', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('debe renderizar el formulario de registro correctamente', () => {
        renderRegister()
        expect(screen.getByRole('heading', { name: /Crear Cuenta/i })).toBeInTheDocument()
        expect(screen.getByPlaceholderText(/Juan Pérez/i)).toBeInTheDocument()
        expect(screen.getByPlaceholderText(/usuario@futuro.com/i)).toBeInTheDocument()
        expect(screen.getByPlaceholderText(/••••••••/i)).toBeInTheDocument()
    })

    it('debe permitir el flujo de registro exitoso', async () => {
        mockSignUp.mockResolvedValue({ data: { user: { id: 'test-user-id' } }, error: null })

        renderRegister()

        fireEvent.change(screen.getByPlaceholderText(/Juan Pérez/i), { target: { value: 'Test User' } })
        fireEvent.change(screen.getByPlaceholderText(/usuario@futuro.com/i), { target: { value: 'test@example.com' } })
        fireEvent.change(screen.getByPlaceholderText(/••••••••/i), { target: { value: 'password123' } })

        fireEvent.click(screen.getByText(/Iniciar Sistema/i))

        await waitFor(() => {
            expect(mockSignUp).toHaveBeenCalledWith('test@example.com', 'password123')
            expect(screen.getByText(/¡Sistema Inicializado!/i)).toBeInTheDocument()
        })
    })

    it('debe mostrar error cuando el registro falla', async () => {
        mockSignUp.mockResolvedValue({ data: null, error: { message: 'Email already in use' } })

        renderRegister()

        fireEvent.change(screen.getByPlaceholderText(/Juan Pérez/i), { target: { value: 'Test User' } })
        fireEvent.change(screen.getByPlaceholderText(/usuario@futuro.com/i), { target: { value: 'test@example.com' } })
        fireEvent.change(screen.getByPlaceholderText(/••••••••/i), { target: { value: 'password123' } })

        fireEvent.click(screen.getByText(/Iniciar Sistema/i))

        await waitFor(() => {
            expect(screen.getByText(/Email already in use/i)).toBeInTheDocument()
        })
    })
})
