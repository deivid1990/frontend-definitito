import { describe, it, expect, vi, beforeEach } from 'vitest'
import { api } from '../lib/api'
import { supabase } from '../lib/supabaseClient'

vi.mock('../lib/supabaseClient', () => ({
    supabase: {
        auth: {
            getSession: vi.fn(),
        },
    },
}))

describe('API Module Extended', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        global.fetch = vi.fn()
    })

    const mockSession = { data: { session: { access_token: 'fake-token' } } }

    it('debe manejar errores en POST con respuesta JSON de error', async () => {
        supabase.auth.getSession.mockResolvedValue(mockSession)
        global.fetch.mockResolvedValue({
            ok: false,
            status: 400,
            json: async () => ({ error: 'Bad Request' }),
        })

        await expect(api.post('/test', {})).rejects.toThrow('Bad Request')
    })

    it('debe realizar peticiones PUT correctamente', async () => {
        supabase.auth.getSession.mockResolvedValue(mockSession)
        global.fetch.mockResolvedValue({
            ok: true,
            json: async () => ({ updated: true }),
        })

        const result = await api.put('/test/1', { name: 'New' })
        expect(global.fetch).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({ method: 'PUT' }))
        expect(result.updated).toBe(true)
    })

    it('debe manejar errores en PUT', async () => {
        supabase.auth.getSession.mockResolvedValue(mockSession)
        global.fetch.mockResolvedValue({ ok: false, status: 500 })
        await expect(api.put('/test/1', {})).rejects.toThrow('Error 500')
    })

    it('debe realizar peticiones DELETE correctamente', async () => {
        supabase.auth.getSession.mockResolvedValue(mockSession)
        global.fetch.mockResolvedValue({
            ok: true,
            json: async () => ({ deleted: true }),
        })

        const result = await api.delete('/test/1')
        expect(global.fetch).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({ method: 'DELETE' }))
        expect(result.deleted).toBe(true)
    })

    it('debe manejar errores en DELETE', async () => {
        supabase.auth.getSession.mockResolvedValue(mockSession)
        global.fetch.mockResolvedValue({ ok: false, status: 404 })
        await expect(api.delete('/test/1')).rejects.toThrow('Error 404')
    })
})
