import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

// Silenciar console en tests para salida limpia (errores esperados de páginas/mocks)
const noop = () => {}
const origError = console.error
const origLog = console.log
const origWarn = console.warn
console.error = (...args) => {
    const msg = args[0] && typeof args[0] === 'string' ? args[0] : ''
    if (msg.includes('Supabase URL or Anon Key') || msg.includes('Error fetching') || msg.includes('Error de ') || msg.includes('CRASH PREVENTED') || msg.includes('Error al ') || msg.includes('Error de login') || msg.includes('Error de Storage') || msg.includes('Error de Base de Datos') || msg.includes('Error crítico')) return
    origError.apply(console, args)
}
console.log = (...args) => {
    const msg = args[0] && typeof args[0] === 'string' ? args[0] : ''
    if (msg.includes('Iniciando ') || msg.includes('Respuesta de registro') || msg.includes('URL de imagen')) return
    origLog.apply(console, args)
}
console.warn = (...args) => {
    const msg = args[0] && typeof args[0] === 'string' ? args[0] : ''
    if (msg.includes('React Router Future Flag') || msg.includes('No routes matched')) return
    origWarn.apply(console, args)
}

// Mock global de Supabase para que tests que importan Layout/AuthContext no fallen por .env
vi.mock('../lib/supabaseClient', () => ({
    supabase: {
        auth: {
            getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
            onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
            signOut: vi.fn().mockResolvedValue({ error: null }),
            signInWithPassword: vi.fn(),
            signUp: vi.fn(),
        },
        storage: {
            from: vi.fn(() => ({
                upload: vi.fn(),
                getPublicUrl: vi.fn(() => ({ data: { publicUrl: 'http://test.com/img.png' } })),
                remove: vi.fn().mockResolvedValue({ error: null }),
            })),
        },
    },
}))

// Cleanup después de cada test
afterEach(() => {
    cleanup()
})

// Mock de window.matchMedia
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
    })),
})

// Mock de IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
    constructor() { }
    disconnect() { }
    observe() { }
    takeRecords() {
        return []
    }
    unobserve() { }
}

// Mock de ResizeObserver
global.ResizeObserver = class ResizeObserver {
    constructor() { }
    disconnect() { }
    observe() { }
    unobserve() { }
}
