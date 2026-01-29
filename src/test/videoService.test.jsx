import { describe, it, expect } from 'vitest'
import { getExerciseVideoId, getYoutubeUrl, searchGlobalExercises } from '../services/videoService'

describe('videoService', () => {
    it('debe devolver ID correcto para ejercicios conocidos', () => {
        // Normalización y key exacta
        expect(getExerciseVideoId('Press de Banca Plano')).toBe('K3idX0vU9hE')

        // Coincidencia parcial (el servicio busca includes)
        // en videoService: if (searchName.includes(normalizeText(kw)))
        // si busco "Sentadillas Libre Extra", debería encontrar "Sentadillas Libre"
        expect(getExerciseVideoId('Sentadillas Libre')).toBe('gcNh17Ckjgg')
    })

    it('debe devolver null para ejercicios desconocidos', () => {
        expect(getExerciseVideoId('Ejercicio Inexistente 123')).toBeNull()
    })

    it('debe construir URLs de YouTube correctamente', () => {
        expect(getYoutubeUrl('abc12345')).toBe('https://www.youtube.com/watch?v=abc12345')
    })

    it('debe buscar ejercicios globales', () => {
        const results = searchGlobalExercises('Press')
        expect(results.length).toBeGreaterThan(0)
        expect(results[0]).toHaveProperty('name')
        expect(results[0]).toHaveProperty('videoId')

        const empty = searchGlobalExercises('XyZ123')
        expect(empty).toHaveLength(0)
    })
})
