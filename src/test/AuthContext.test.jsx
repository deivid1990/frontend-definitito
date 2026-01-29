import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, act } from '@testing-library/react'
import { AuthProvider, useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabaseClient'

// Mock de Supabase completo para Auth
vi.mock('../lib/supabaseClient', () => ({
    supabase: {
        auth: {
            getSession: vi.fn(),
            onAuthStateChange: vi.fn(),
            signUp: vi.fn(),
            signInWithPassword: vi.fn(),
            signOut: vi.fn(),
            resetPasswordForEmail: vi.fn(),
            updateUser: vi.fn(),
        },
        from: vi.fn(() => ({
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data: { id: '123' }, error: null }),
            insert: vi.fn().mockResolvedValue({ error: null })
        }))
    },
}))

// Componente de prueba para consumir el contexto
const TestComponent = () => {
    const { user, signIn, signOut } = useAuth()
    return (
        <div>
            <div data-testid="user-email">{user ? user.email : 'No User'}</div>
            <button onClick={() => signIn('test@test.com', '123456')}>Login</button>
            <button onClick={() => signOut()}>Logout</button>
        </div>
    )
}

describe('AuthContext', () => {
    const mockUser = { id: '123', email: 'test@example.com' }
    const mockSession = { user: mockUser, access_token: 'token' }

    const mockSubscription = {
        unsubscribe: vi.fn(),
    }

    beforeEach(() => {
        vi.clearAllMocks()

        // Configuración por defecto de mocks
        supabase.auth.getSession.mockResolvedValue({ data: { session: null } })
        supabase.auth.onAuthStateChange.mockReturnValue({
            data: { subscription: mockSubscription }
        })
    })

    it('debe inicializar con usuario nulo si no hay sesión', async () => {
        await act(async () => {
            render(
                <AuthProvider>
                    <TestComponent />
                </AuthProvider>
            )
        })

        expect(screen.getByTestId('user-email')).toHaveTextContent('No User')
        expect(supabase.auth.getSession).toHaveBeenCalled()
    })

    it('debe cargar el usuario si hay sesión existente', async () => {
        supabase.auth.getSession.mockResolvedValue({ data: { session: mockSession } })

        await act(async () => {
            render(
                <AuthProvider>
                    <TestComponent />
                </AuthProvider>
            )
        })

        expect(screen.getByTestId('user-email')).toHaveTextContent(mockUser.email)
    })

    it('debe actualizar el estado cuando cambia la autenticación (onAuthStateChange)', async () => {
        // Simulamos que obtenemos la función de callback suscrita
        let authCallback
        supabase.auth.onAuthStateChange.mockImplementation((cb) => {
            authCallback = cb
            return { data: { subscription: mockSubscription } }
        })

        await act(async () => {
            render(
                <AuthProvider>
                    <TestComponent />
                </AuthProvider>
            )
        })

        expect(screen.getByTestId('user-email')).toHaveTextContent('No User')

        // Disparamos el cambio de estado simulado login
        act(() => {
            authCallback('SIGNED_IN', mockSession)
        })

        expect(screen.getByTestId('user-email')).toHaveTextContent(mockUser.email)

        // Disparamos logout
        act(() => {
            authCallback('SIGNED_OUT', null)
        })

        expect(screen.getByTestId('user-email')).toHaveTextContent('No User')
    })

    it('debe llamar a supabase.auth.signInWithPassword', async () => {
        await act(async () => {
            render(
                <AuthProvider>
                    <TestComponent />
                </AuthProvider>
            )
        })

        const loginButton = screen.getByText('Login')
        await act(async () => {
            loginButton.click()
        })

        expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
            email: 'test@test.com',
            password: '123456',
        })
    })
})
