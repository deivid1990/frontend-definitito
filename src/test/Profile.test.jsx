import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Profile from '../pages/Profile'
import { AuthContext } from '../context/AuthContext'
import { supabase } from '../lib/supabaseClient'

// Mock Supabase
vi.mock('../lib/supabaseClient', () => ({
    supabase: {
        from: vi.fn(),
    },
}))

const mockAuthContext = { user: { id: 'test-user-id' } }

const renderProfile = () => render(
    <MemoryRouter>
        <AuthContext.Provider value={mockAuthContext}>
            <Profile />
        </AuthContext.Provider>
    </MemoryRouter>
)

describe('Profile Component Extended', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('debe manejar cambios en inputs y errores de guardado', async () => {
        window.alert = vi.fn()
        const mockProfile = { full_name: 'John', age: 20, weight: 70, height: 170, goal: 'salud' }

        supabase.from.mockImplementation((table) => {
            if (table === 'profiles') return {
                select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: mockProfile, error: null }) }) }),
                upsert: () => Promise.resolve({ error: { message: 'Upsert Fail' } })
            }
            return {
                select: () => ({ eq: () => ({ order: () => Promise.resolve({ data: [], error: null }) }) }),
                insert: () => Promise.resolve({ error: null })
            }
        })

        renderProfile()
        await screen.findByDisplayValue('John')

        // Cambiar goal select
        const goalSelect = screen.getByDisplayValue('Salud')
        fireEvent.change(goalSelect, { target: { value: 'fuerza' } })
        expect(goalSelect.value).toBe('fuerza')

        // Intentar guardar y fallar
        fireEvent.click(screen.getByText(/TRANSMITIR BIOMETRÍA/i))

        await waitFor(() => {
            expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('Upsert Fail'))
        })
    })

    it('debe mostrar mensaje cuando no hay historial', async () => {
        supabase.from.mockReturnValue({
            select: () => ({
                eq: () => ({
                    single: () => Promise.resolve({ data: null, error: null }),
                    order: () => Promise.resolve({ data: [], error: null })
                })
            })
        })

        renderProfile()
        await screen.findByText(/Sin registros detectados/i)
    })
})
