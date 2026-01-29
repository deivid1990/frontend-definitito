import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Layout from '../components/Layout'
import { AuthContext } from '../context/AuthContext'

const mockAuthContext = {
    user: { id: 'test-user-id', email: 'test@test.com' },
    signOut: vi.fn(),
}

const renderWithRouter = (path = '/dashboard') => {
    return render(
        <MemoryRouter initialEntries={[path]}>
            <AuthContext.Provider value={mockAuthContext}>
                <Layout><div>Content</div></Layout>
            </AuthContext.Provider>
        </MemoryRouter>
    )
}

describe('Layout Component', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('debe renderizar el sidebar en desktop', () => {
        renderWithRouter()
        expect(screen.getByText(/Centro de Mando/i)).toBeInTheDocument()
        expect(screen.getByText(/Desconectar/i)).toBeInTheDocument()
    })

    it('debe abrir y cerrar el menú móvil', () => {
        renderWithRouter()

        // No debería verse el sidebar móvil inicialmente
        // El logo móvil siempre está pero el sidebar overlay solo si isMobileMenuOpen
        expect(screen.queryByText(/Tutorial de ejercicios/i, { selector: '.md:hidden nav span' })).not.toBeInTheDocument()

        // El botón del menú móvil es el único botón que no es "Desconectar"
        const menuBtn = screen.getByRole('button', { name: '' }) // El botón de hamburguesa no tiene texto
        fireEvent.click(menuBtn)

        // Ahora el menú móvil debería estar abierto
        // Buscamos un enlace dentro del nav móvil
        const mobileNav = document.querySelectorAll('nav')[1] // El segundo nav es el móvil
        expect(within(mobileNav).getByText(/Tutorial de ejercicios/i)).toBeInTheDocument()

        // Cerrar haciendo click en el overlay
        const overlay = document.querySelector('.bg-black\\/90')
        fireEvent.click(overlay)

        expect(screen.queryByText(/Tutorial de ejercicios/i, { selector: '.md:hidden nav span' })).not.toBeInTheDocument()
    })

    it('debe cerrar el menú móvil al hacer click en un enlace', () => {
        renderWithRouter()

        const menuBtn = screen.getByRole('button', { name: '' })
        fireEvent.click(menuBtn)

        const mobileNav = document.querySelectorAll('nav')[1]
        const link = within(mobileNav).getByText(/Rutina semanal/i)

        fireEvent.click(link)

        // El menú debería cerrarse
        expect(screen.queryByText(/Tutorial de ejercicios/i, { selector: '.md:hidden nav span' })).not.toBeInTheDocument()
    })
})
