import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import Login from '../pages/Login'
import { AuthContext } from '../context/AuthContext'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom')
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    }
})

const mockAuthContext = {
    user: null,
    signIn: vi.fn(),
    signOut: vi.fn(),
    signUp: vi.fn(),
}

const renderWithRouter = (component) => {
    return render(
        <BrowserRouter>
            <AuthContext.Provider value={mockAuthContext}>
                {component}
            </AuthContext.Provider>
        </BrowserRouter>
    )
}

describe('Login Component', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('debe renderizar el formulario de login', () => {
        renderWithRouter(<Login />)

        // Buscar h1 en lugar de texto complejo
        const heading = screen.getByRole('heading', { level: 1 })
        expect(heading).toHaveTextContent(/GYM/i)

        expect(screen.getByPlaceholderText('usuario@sistema.com')).toBeInTheDocument()
        expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /Acceder al Sistema/i })).toBeInTheDocument()
    })

    it('debe permitir escribir en los campos de email y password', async () => {
        const user = userEvent.setup()
        renderWithRouter(<Login />)

        const emailInput = screen.getByPlaceholderText('usuario@sistema.com')
        const passwordInput = screen.getByPlaceholderText('••••••••')

        await user.type(emailInput, 'test@test.com')
        await user.type(passwordInput, 'password123')

        expect(emailInput).toHaveValue('test@test.com')
        expect(passwordInput).toHaveValue('password123')
    })

    it('debe llamar a signIn cuando se envía el formulario', async () => {
        const user = userEvent.setup()
        mockAuthContext.signIn.mockResolvedValue({ error: null })

        renderWithRouter(<Login />)

        const emailInput = screen.getByPlaceholderText('usuario@sistema.com')
        const passwordInput = screen.getByPlaceholderText('••••••••')
        const submitButton = screen.getByRole('button', { name: /Acceder al Sistema/i })

        await user.type(emailInput, 'test@test.com')
        await user.type(passwordInput, 'password123')
        await user.click(submitButton)

        await waitFor(() => {
            expect(mockAuthContext.signIn).toHaveBeenCalledWith('test@test.com', 'password123')
        })
    })

    it('debe mostrar error cuando el login falla', async () => {
        const user = userEvent.setup()
        mockAuthContext.signIn.mockResolvedValue({
            error: { message: 'Invalid login credentials' }
        })

        renderWithRouter(<Login />)

        const emailInput = screen.getByPlaceholderText('usuario@sistema.com')
        const passwordInput = screen.getByPlaceholderText('••••••••')
        const submitButton = screen.getByRole('button', { name: /Acceder al Sistema/i })

        await user.type(emailInput, 'wrong@test.com')
        await user.type(passwordInput, 'wrongpass')
        await user.click(submitButton)

        await waitFor(() => {
            expect(screen.getByText(/Credenciales incorrectas/i)).toBeInTheDocument()
        })
    })

    it('debe tener un enlace a la página de registro', () => {
        renderWithRouter(<Login />)

        const registerLink = screen.getByRole('link', { name: /REGISTRARSE/i })
        expect(registerLink).toBeInTheDocument()
        expect(registerLink).toHaveAttribute('href', '/register')
    })

    it('debe tener un enlace para recuperar contraseña', () => {
        renderWithRouter(<Login />)

        const forgotLink = screen.getByRole('link', { name: /OLVIDASTE TU CLAVE/i })
        expect(forgotLink).toBeInTheDocument()
        expect(forgotLink).toHaveAttribute('href', '/forgot-password')
    })
})
