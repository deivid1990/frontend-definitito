import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import History from '../pages/History'
import { AuthContext } from '../context/AuthContext'
import { api } from '../lib/api'

vi.mock('../lib/api', () => ({
    api: {
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
        delete: vi.fn(),
    },
}))

const mockAuthContext = { user: { id: 'test-user-id' } }

const renderHistory = () => render(
    <MemoryRouter>
        <AuthContext.Provider value={mockAuthContext}>
            <History />
        </AuthContext.Provider>
    </MemoryRouter>
)

describe('History Component', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        api.get.mockResolvedValue([])
    })

    it('debe permitir editar un entrenamiento existente', async () => {
        const mockSessions = [{ id: 1, name: 'Old Name', started_at: new Date().toISOString(), duration_minutes: 30 }]
        api.get.mockResolvedValue(mockSessions)
        api.put.mockResolvedValue({ success: true })

        const { container } = renderHistory()
        await screen.findByText('Old Name')

        const editBtn = container.querySelector('.lucide-pen-line').closest('button')
        fireEvent.click(editBtn)

        await screen.findByText(/Editar Entrenamiento/i)

        fireEvent.change(screen.getByDisplayValue('Old Name'), { target: { value: 'New Name' } })
        fireEvent.click(screen.getByText(/ACTUALIZAR REGISTRO/i))

        await waitFor(() => {
            expect(api.put).toHaveBeenCalledWith('/api/sesiones/1', expect.objectContaining({ name: 'New Name' }))
        })
    })

    it('debe manejar errores en la API al cargar', async () => {
        vi.spyOn(console, 'error').mockImplementation(() => { })
        api.get.mockRejectedValue(new Error('Fail'))

        renderHistory()

        await waitFor(() => {
            expect(screen.getByText(/Sistema de registros vacío/i)).toBeInTheDocument()
        })
    })
})
