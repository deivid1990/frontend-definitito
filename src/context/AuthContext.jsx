import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export const AuthContext = createContext({})

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [session, setSession] = useState(null)
    const [loading, setLoading] = useState(true)

    const ensureProfileExists = async (user) => {
        const { data, error } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', user.id)
            .single()

        if (error && error.code === 'PGRST116') { // No se encontró el perfil
            await supabase.from('profiles').insert([{
                id: user.id,
                full_name: user.user_metadata?.full_name || user.email.split('@')[0],
                fitness_level: 'Principiante',
                goal: 'Salud'
            }])
        }
    }

    useEffect(() => {
        // 1. Revisar sesión al cargar
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session)
            setUser(session?.user ?? null)
            if (session?.user) ensureProfileExists(session.user)
            setLoading(false)
        })

        // 2. Escuchar cambios (Login, Logout)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session)
            setUser(session?.user ?? null)
            if (session?.user) ensureProfileExists(session.user)
            setLoading(false)
        })

        return () => subscription.unsubscribe()
    }, [])

    const value = {
        signUp: (email, password, metadata = {}) => supabase.auth.signUp({
            email,
            password,
            options: { data: metadata }
        }),
        signIn: (email, password) => supabase.auth.signInWithPassword({ email, password }),
        signOut: () => supabase.auth.signOut(),
        resetPassword: (email) => supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/update-password`,
        }),
        updatePassword: (new_password) => supabase.auth.updateUser({ password: new_password }),
        user,
        session,
        loading
    }

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    )
}
