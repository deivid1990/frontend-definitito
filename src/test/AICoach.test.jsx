import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import AICoach from '../pages/AICoach'
import { AuthContext } from '../context/AuthContext'
import { api } from '../lib/api'

// Mock de API
vi.mock('../lib/api', () => ({
    api: {
        post: vi.fn(),
    },
}))

// Mock de AuthContext
const mockAuthContext = {
    user: { id: 'test-user-id' },
}

const renderWithRouter = () => {
    return render(
        <MemoryRouter>
            <AuthContext.Provider value={mockAuthContext}>
                <AICoach />
            </AuthContext.Provider>
        </MemoryRouter>
    )
}

describe('AICoach Component', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        window.HTMLElement.prototype.scrollIntoView = vi.fn()
    })

    it('debe renderizar inicialmente en modo chat', () => {
        renderWithRouter()
        expect(screen.getByText(/Soy tu coach digital/i)).toBeInTheDocument()
    })

    it('debe permitir enviar mensajes y recibir respuesta', async () => {
        api.post.mockResolvedValue({ role: 'assistant', content: 'IA Resp' })
        renderWithRouter()

        const input = screen.getByPlaceholderText(/Hablar con la IA/i)
        fireEvent.change(input, { target: { value: 'Hola' } })
        fireEvent.submit(input.closest('form'))

        await screen.findByText('IA Resp')
    })

    it('debe manejar errores en la generación de rutina', async () => {
        const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => { })
        api.post.mockRejectedValue(new Error('AI Error'))

        renderWithRouter()
        fireEvent.click(screen.getByText('Diseñar'))

        fireEvent.click(screen.getByText(/INICIAR DISEÑO/i))

        await waitFor(() => {
            expect(alertMock).toHaveBeenCalledWith(expect.stringContaining('AI Error'))
        })
        alertMock.mockRestore()
    })

    it('debe permitir descartar una rutina generada', async () => {
        api.post.mockResolvedValue({ name: 'Rutina Test', goal: 'X', days: [] })
        renderWithRouter()
        fireEvent.click(screen.getByText('Diseñar'))
        fireEvent.click(screen.getByText(/INICIAR DISEÑO/i))

        const discardBtn = await screen.findByText(/Descarta/i)
        fireEvent.click(discardBtn)

        expect(screen.getByPlaceholderText(/Hablar con la IA/i)).toBeInTheDocument()
    })

    it('debe manejar errores en el chat mostrando mensaje en pantalla', async () => {
        api.post.mockRejectedValue(new Error('Chat Fail'))
        renderWithRouter()

        const input = screen.getByPlaceholderText(/Hablar con la IA/i)
        fireEvent.change(input, { target: { value: 'Hi' } })
        fireEvent.submit(input.closest('form'))

        await screen.findByText(/Lo siento, hubo un error al conectar con mis circuitos neuronales./i)
    })
})
