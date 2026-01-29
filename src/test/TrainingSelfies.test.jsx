import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import TrainingSelfies from '../pages/TrainingSelfies'
import { AuthContext } from '../context/AuthContext'
import { supabase } from '../lib/supabaseClient'

// Mock Supabase
vi.mock('../lib/supabaseClient', () => ({
    supabase: {
        from: vi.fn(),
        storage: {
            from: vi.fn(),
        },
    },
}))

const mockAuthContext = {
    user: { id: 'test-user-id' },
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

describe('TrainingSelfies Component', () => {
    beforeEach(() => {
        vi.clearAllMocks()

        // Default mock for select
        const mockSelect = {
            eq: vi.fn().mockReturnThis(),
            order: vi.fn().mockResolvedValue({ data: [], error: null })
        }
        supabase.from.mockReturnValue({ select: () => mockSelect })

        // Default mock for storage
        supabase.storage.from.mockReturnValue({
            upload: vi.fn().mockResolvedValue({ error: null }),
            getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: 'http://test.com/img.png' } })
        })
    })

    it('debe manejar la subida de una selfie completa', async () => {
        const { container } = renderWithRouter(<TrainingSelfies />)

        const addButton = screen.getByText(/Capturar/i)
        fireEvent.click(addButton)

        // Simular selección de archivo
        const file = new File(['hello'], 'hello.png', { type: 'image/png' })
        const fileInput = container.querySelector('input[type="file"]')

        const mockInsert = vi.fn().mockResolvedValue({ error: null })
        supabase.from.mockImplementation((table) => {
            if (table === 'entrenamiento_selfies') return {
                insert: mockInsert,
                select: () => ({ eq: () => ({ order: () => ({}) }) }),
                delete: () => ({ eq: () => ({}) })
            }
            return { select: () => ({ eq: () => ({ order: () => ({}) }) }) }
        })

        fireEvent.change(fileInput, { target: { files: [file] } })

        // Escribir descripción
        const textarea = screen.getByPlaceholderText(/¿Cómo te sentiste hoy?/i)
        fireEvent.change(textarea, { target: { value: 'Gran entreno' } })

        // Subir
        const submitBtn = screen.getByText(/SINCRONIZAR/i)
        fireEvent.click(submitBtn)

        await waitFor(() => {
            expect(mockInsert).toHaveBeenCalledWith([expect.objectContaining({
                description: 'Gran entreno',
                image_url: 'http://test.com/img.png'
            })])
        })
    })

    it('debe mostrar error si falla la subida', async () => {
        window.alert = vi.fn()
        const { container } = renderWithRouter(<TrainingSelfies />)

        fireEvent.click(screen.getByText(/Capturar/i))

        const file = new File(['hello'], 'hello.png', { type: 'image/png' })
        fireEvent.change(container.querySelector('input[type="file"]'), { target: { files: [file] } })

        supabase.storage.from.mockReturnValue({
            upload: vi.fn().mockResolvedValue({ error: new Error('Upload error') })
        })

        fireEvent.click(screen.getByText(/SINCRONIZAR/i))

        await waitFor(() => {
            expect(window.alert).toHaveBeenCalled()
        })
    })
})
