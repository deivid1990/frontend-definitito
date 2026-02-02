import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import { Camera, History, Loader2, Trash2, CheckCircle, X } from 'lucide-react'
import ConfirmModal from '../components/ConfirmModal'

export default function TrainingSelfies() {
    const { user } = useAuth()

    const [loading, setLoading] = useState(true)
    const [uploading, setUploading] = useState(false)
    const [selfies, setSelfies] = useState([])

    const [showUploadModal, setShowUploadModal] = useState(false)
    const [newSelfie, setNewSelfie] = useState({ description: '', file: null, preview: null })

    const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null, imageUrl: null })

    useEffect(() => {
        if (user) fetchSelfies()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user])

    // Evitar scroll del body si modal abierto
    useEffect(() => {
        if (showUploadModal) document.body.style.overflow = 'hidden'
        else document.body.style.overflow = 'unset'
        return () => {
            document.body.style.overflow = 'unset'
        }
    }, [showUploadModal])

    const fetchSelfies = async () => {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('entrenamiento_selfies')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })

            if (error) throw error
            setSelfies(data || [])
        } catch (error) {
            console.error('Error fetching selfies:', error)
        } finally {
            setLoading(false)
        }
    }

    const compressImage = (file) => {
        return new Promise((resolve) => {
            const reader = new FileReader()
            reader.readAsDataURL(file)
            reader.onload = (event) => {
                const img = new Image()
                img.src = event.target.result
                img.onload = () => {
                    const canvas = document.createElement('canvas')
                    const MAX_WIDTH = 1200
                    const MAX_HEIGHT = 1200
                    let width = img.width
                    let height = img.height

                    if (width > height) {
                        if (width > MAX_WIDTH) {
                            height *= MAX_WIDTH / width
                            width = MAX_WIDTH
                        }
                    } else {
                        if (height > MAX_HEIGHT) {
                            width *= MAX_HEIGHT / height
                            height = MAX_HEIGHT
                        }
                    }

                    canvas.width = width
                    canvas.height = height
                    const ctx = canvas.getContext('2d')
                    ctx.drawImage(img, 0, 0, width, height)

                    canvas.toBlob(
                        (blob) => {
                            resolve(
                                new File([blob], file.name || 'selfie.jpg', {
                                    type: 'image/jpeg',
                                    lastModified: Date.now(),
                                })
                            )
                        },
                        'image/jpeg',
                        0.8
                    )
                }
            }
        })
    }

    const handleFileChange = async (e) => {
        const file = e.target.files?.[0]
        if (!file) return

        try {
            // preview rápido
            const tempPreview = URL.createObjectURL(file)
            setNewSelfie((prev) => ({ ...prev, preview: tempPreview }))

            // comprimir
            const compressed = await compressImage(file)

            // limpiar preview temp y setear el comprimido
            URL.revokeObjectURL(tempPreview)
            const finalPreview = URL.createObjectURL(compressed)

            setNewSelfie((prev) => ({
                ...prev,
                file: compressed,
                preview: finalPreview,
            }))
        } catch (err) {
            console.error('Error al procesar selección:', err)
        }
    }

    const uploadSelfie = async (e) => {
        if (e?.preventDefault) e.preventDefault()
        if (!newSelfie.file || uploading) return

        let uploadedFilePath = null

        try {
            setUploading(true)

            const fileToUpload = newSelfie.file
            const originalName = fileToUpload.name || 'selfie.jpg'
            const fileExt = originalName.split('.').pop() || 'jpg'

            const fileName = `${user.id}/${Date.now()}.${fileExt}`
            uploadedFilePath = `selfies/${fileName}`

            // 1) subir a storage (bucket: gym-assets)
            const { error: uploadError } = await supabase.storage
                .from('gym-assets')
                .upload(uploadedFilePath, fileToUpload)

            if (uploadError) throw new Error(`Error al subir imagen: ${uploadError.message}`)

            // 2) url pública
            const { data } = supabase.storage.from('gym-assets').getPublicUrl(uploadedFilePath)
            const publicUrl = data?.publicUrl
            if (!publicUrl) throw new Error('No se pudo generar la URL pública de la imagen')

            // 3) insert tabla
            const { error: dbError } = await supabase
                .from('entrenamiento_selfies')
                .insert([
                    {
                        user_id: user.id,
                        image_url: publicUrl,
                        description: (newSelfie.description || '').trim(),
                    },
                ])

            if (dbError) throw new Error(`Error al registrar en DB: ${dbError.message}`)

            // limpiar preview
            if (newSelfie.preview) URL.revokeObjectURL(newSelfie.preview)

            setShowUploadModal(false)
            setNewSelfie({ description: '', file: null, preview: null })

            // refrescar galería
            setTimeout(() => {
                fetchSelfies().catch(console.error)
            }, 500)
        } catch (error) {
            console.error('CRASH PREVENTED en TrainingSelfies:', error)
            alert('⚠️ Error en la subida:\n' + (error.message || 'Error desconocido'))

            // cleanup storage si ya subió algo
            if (uploadedFilePath) {
                await supabase.storage.from('gym-assets').remove([uploadedFilePath]).catch((e2) => console.error('Cleanup error:', e2))
            }
        } finally {
            setUploading(false)
        }
    }

    const handleDelete = async () => {
        if (!deleteModal.id) return
        try {
            const { error } = await supabase.from('entrenamiento_selfies').delete().eq('id', deleteModal.id)
            if (error) throw error
            setSelfies(selfies.filter((s) => s.id !== deleteModal.id))
            setDeleteModal({ isOpen: false, id: null, imageUrl: null })
        } catch (error) {
            alert('Error eliminando: ' + (error.message || 'Error desconocido'))
        }
    }

    return (
        <div
            data-testid="progress-page"
            className="max-w-6xl mx-auto px-4 sm:px-6 pb-16 animate-fade-up space-y-8 sm:space-y-10"
        >
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 sm:gap-6">
                <div>
                    <h1
                        data-testid="progress-title"
                        className="text-3xl sm:text-4xl lg:text-5xl font-black text-white italic tracking-tighter uppercase mb-2"
                    >
                        MIS <span className="text-indigo-500">PROGRESOS</span>
                    </h1>

                    {/* Flag para Cypress */}
                    <div data-testid="progress-loaded" className="text-xs text-zinc-600 font-bold">
                        {loading ? 'CARGANDO...' : 'OK'}
                    </div>
                </div>

                {/* Abrir modal */}
                <button
                    data-testid="progress-open-modal"
                    onClick={() => setShowUploadModal(true)}
                    className="group relative flex items-center gap-2 sm:gap-3 bg-white text-black px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-black uppercase text-xs sm:text-sm tracking-widest hover:bg-indigo-500 hover:text-white transition-all shadow-[0_0_30px_rgba(255,255,255,0.1)] active:scale-95"
                >
                    <Camera size={16} className="sm:w-[18px] sm:h-[18px] group-hover:rotate-12 transition-transform" />
                    <span className="hidden sm:inline">Capturar Progreso</span>
                    <span className="sm:hidden">Nueva Foto</span>
                </button>
            </div>

            {/* Galería */}
            <div
                data-testid="progress-gallery"
                className={loading ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6' : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8'}
            >
                {loading ? (
                    <>
                        {[1, 2, 3].map((i) => (
                            <div
                                key={i}
                                className="aspect-[3/4] bg-zinc-900/40 rounded-2xl sm:rounded-[2.5rem] animate-pulse border border-white/5"
                            />
                        ))}
                    </>
                ) : (
                    <>
                        {selfies.length === 0 && (
                            <div className="col-span-full py-20 sm:py-32 text-center bg-zinc-950/40 rounded-2xl sm:rounded-[3rem] border border-dashed border-zinc-800">
                                <History size={40} className="sm:w-12 sm:h-12 mx-auto mb-4 sm:mb-6 text-zinc-700 opacity-20" />
                                <p className="text-zinc-500 font-mono text-[10px] sm:text-xs uppercase tracking-[0.3em] sm:tracking-[0.4em]">
                                    Sin registros visuales detectados
                                </p>
                            </div>
                        )}

                        {selfies.map((selfie) => (
                            <div
                                key={selfie.id}
                                data-testid="progress-photo-item"
                                className="group bg-zinc-900/40 rounded-2xl sm:rounded-[2.5rem] overflow-hidden border border-white/5 hover:border-indigo-500/40 transition-all duration-500 shadow-2xl flex flex-col"
                            >
                                <div className="relative aspect-[4/5] bg-black/40 flex items-center justify-center overflow-hidden">
                                    <button
                                        onClick={() => setDeleteModal({ isOpen: true, id: selfie.id, imageUrl: selfie.image_url })}
                                        className="absolute top-3 right-3 sm:top-5 sm:right-5 z-50 p-2 sm:p-3 bg-black/60 backdrop-blur-md text-zinc-500 hover:text-red-500 rounded-xl sm:rounded-2xl border border-white/10 opacity-0 group-hover:opacity-100 transition-all"
                                    >
                                        <Trash2 size={14} className="sm:w-4 sm:h-4" />
                                    </button>

                                    <img
                                        src={selfie.image_url}
                                        className="absolute inset-0 w-full h-full object-cover scale-110 blur-xl opacity-30"
                                        alt="Blur Background"
                                    />
                                    <img
                                        src={selfie.image_url}
                                        alt="Workout Selfie"
                                        className="relative z-10 w-full h-full object-contain transition-transform duration-500 group-hover:scale-[1.02]"
                                    />
                                </div>

                                <div className="p-4 sm:p-6 space-y-2">
                                    <p
                                        data-testid="progress-photo-date"
                                        className="text-[9px] sm:text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]"
                                    >
                                        {new Date(selfie.created_at).toLocaleDateString('es-ES', {
                                            day: '2-digit',
                                            month: 'long',
                                            year: 'numeric',
                                        })}
                                    </p>

                                    <p data-testid="progress-photo-description" className="text-zinc-200 font-medium text-xs sm:text-sm leading-relaxed">
                                        {selfie.description || 'Sin descripción'}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </>
                )}
            </div>

            {/* Modal de subida */}
            {showUploadModal && (
                <div
                    data-testid="progress-upload-modal"
                    className="fixed inset-0 z-[100] flex items-start sm:items-center justify-center p-0 sm:p-4 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300 overflow-y-auto"
                >
                    <div className="bg-zinc-900 border-0 sm:border border-white/10 rounded-none sm:rounded-[3rem] p-6 sm:p-8 w-full sm:max-w-lg relative overflow-hidden min-h-screen sm:min-h-0 my-0 sm:my-auto">
                        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />

                        <div className="flex justify-between items-center mb-6 sm:mb-8 sticky top-0 bg-zinc-900 z-10 py-4 sm:py-0 sm:static">
                            <h2 className="text-xl sm:text-2xl font-black text-white uppercase italic tracking-tighter">Nueva Captura</h2>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowUploadModal(false)
                                    setNewSelfie({ description: '', file: null, preview: null })
                                }}
                                className="text-zinc-500 hover:text-white p-2"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div className="relative aspect-video bg-black/40 rounded-2xl sm:rounded-3xl border border-white/5 overflow-hidden group cursor-pointer">
                                {newSelfie.preview ? (
                                    <img src={newSelfie.preview} className="w-full h-full object-contain" alt="Preview" />
                                ) : (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-zinc-600">
                                        <Camera size={32} />
                                        <p className="text-[10px] font-black uppercase tracking-widest text-center px-4">Tomar Foto o Seleccionar</p>
                                    </div>
                                )}

                                {/* ✅ ESTE ES EL INPUT QUE CYPEESS BUSCA */}
                                <input
                                    data-testid="progress-photo-input"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">
                                    ¿Cómo estuvo tu entrenamiento?
                                </label>

                                <textarea
                                    data-testid="progress-description"
                                    value={newSelfie.description}
                                    onChange={(e) => setNewSelfie({ ...newSelfie, description: e.target.value })}
                                    className="w-full bg-black/40 border border-white/5 text-white p-5 rounded-2xl outline-none focus:border-indigo-500 transition-all text-sm min-h-[100px]"
                                    placeholder="¿Cómo te sentiste hoy? (Ej: Nuevo PR en Press Militar)"
                                />
                            </div>

                            <button
                                data-testid="progress-upload-button"
                                type="button"
                                onClick={uploadSelfie}
                                disabled={uploading || !newSelfie.file}
                                className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase italic tracking-[0.2em] text-xs rounded-2xl transition-all shadow-xl active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
                            >
                                {uploading ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle size={18} />}
                                {uploading ? 'TRANSMITIENDO...' : 'SINCRONIZAR EVOLUCIÓN'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Confirm delete */}
            <ConfirmModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, id: null, imageUrl: null })}
                onConfirm={handleDelete}
                title="¿Eliminar Recuerdo?"
                message="¿Estás seguro de que deseas borrar este progreso visual? No podrás recuperar la foto."
                confirmText="SÍ, ELIMINAR"
                cancelText="NO, CANCELAR"
            />
        </div>
    )
}
