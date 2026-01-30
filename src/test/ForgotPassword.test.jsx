import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import ForgotPassword from '../pages/ForgotPassword'
import { AuthContext } from '../context/AuthContext'

// Mock de AuthContext
const mockResetPassword = vi.fn()
const mockAuthValue = {
    resetPassword: mockResetPassword,
}

const renderForgotPassword = () => {
    return render(
        <MemoryRouter>
            <AuthContext.Provider value={mockAuthValue}>
                <ForgotPassword />
            </AuthContext.Provider>
        </MemoryRouter>
    )
}

describe('ForgotPassword Component', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('debe renderizar el formulario correctamente', () => {
        renderForgotPassword()
        expect(screen.getByRole('heading', { name: /Recuperar Acceso/i })).toBeInTheDocument()
        expect(screen.getByPlaceholderText(/usuario@sistema.com/i)).toBeInTheDocument()
    })

    it('debe enviar el correo de recuperación con éxito', async () => {
        mockResetPassword.mockResolvedValue({ error: null })

        renderForgotPassword()

        fireEvent.change(screen.getByPlaceholderText(/usuario@sistema.com/i), { target: { value: 'test@example.com' } })
        fireEvent.click(screen.getByText(/Solicitar Reseteo/i))

        await waitFor(() => {
            expect(mockResetPassword).toHaveBeenCalledWith('test@example.com')
            expect(screen.getByText(/Transmisión Exitosa/i)).toBeInTheDocument()
        })
    })

    it('debe mostrar error si el envío falla', async () => {
        mockResetPassword.mockResolvedValue({ error: { message: 'Error de servidor' } })

        renderForgotPassword()

        fireEvent.change(screen.getByPlaceholderText(/usuario@sistema.com/i), { target: { value: 'test@example.com' } })
        fireEvent.click(screen.getByText(/Solicitar Reseteo/i))

        await waitFor(() => {
            expect(screen.getByText(/Error de servidor/i)).toBeInTheDocument()
        })
    })
})
