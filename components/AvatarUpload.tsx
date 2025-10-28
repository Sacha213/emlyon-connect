import { useState, useRef, ChangeEvent } from 'react';
import Cropper from 'react-easy-crop';
import type { Area } from 'react-easy-crop';
import { supabase } from '../services/supabaseClient';
import { updateUserProfile } from '../services/api';

interface AvatarUploadProps {
    currentAvatar?: string;
    onUploadSuccess: (newAvatarUrl: string) => void;
}

export const AvatarUpload = ({ currentAvatar, onUploadSuccess }: AvatarUploadProps) => {
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);
    const [isCropping, setIsCropping] = useState(false);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            // Vérifier le type de fichier
            if (!file.type.startsWith('image/')) {
                alert('Veuillez sélectionner une image');
                return;
            }

            // Vérifier la taille (5MB max)
            if (file.size > 5 * 1024 * 1024) {
                alert('L\'image ne doit pas dépasser 5MB');
                return;
            }

            setSelectedFile(file);

            // Créer une prévisualisation
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result as string);
                setIsCropping(true);
                setCrop({ x: 0, y: 0 });
                setZoom(1);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUpload = async (file: File) => {
        setUploading(true);

        try {
            // Récupérer l'utilisateur connecté
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            if (!user.id) {
                alert('Vous devez être connecté pour uploader une photo. Veuillez vous reconnecter.');
                setPreview(null);
                setUploading(false);
                return;
            }

            // Générer un nom de fichier unique
            const fileExt = file.name.split('.').pop();
            const fileName = `${user.id}-${Date.now()}.${fileExt}`;
            const filePath = `avatars/${fileName}`;

            // Upload vers Supabase Storage
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (uploadError) {
                throw uploadError;
            }

            // Obtenir l'URL publique
            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

            // Mettre à jour le profil dans la base de données
            await updateUserProfile(user.id, { avatarUrl: publicUrl });

            // Mettre à jour l'avatar
            onUploadSuccess(publicUrl);
            setPreview(null);

            // Mettre à jour le localStorage
            user.avatarUrl = publicUrl;
            localStorage.setItem('user', JSON.stringify(user));

            alert('Photo de profil mise à jour !');
        } catch (error) {
            console.error('Erreur upload:', error);
            const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
            alert(`Erreur lors de l'upload de la photo: ${errorMessage}`);
            setPreview(null);
        } finally {
            setUploading(false);
        }
    };

    const setCroppingDefaults = () => {
        setCrop({ x: 0, y: 0 });
        setZoom(1);
        setCroppedAreaPixels(null);
    };

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    const handleCancelCrop = () => {
        setIsCropping(false);
        setPreview(null);
        setSelectedFile(null);
        setCroppingDefaults();
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const getCroppedBlob = async (imageSrc: string, cropArea: Area, mimeType: string) => {
        const image = await createImage(imageSrc);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
            throw new Error('Canvas non supporté par ce navigateur');
        }

        const width = Math.round(cropArea.width);
        const height = Math.round(cropArea.height);

        canvas.width = width;
        canvas.height = height;

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        ctx.drawImage(
            image,
            cropArea.x,
            cropArea.y,
            cropArea.width,
            cropArea.height,
            0,
            0,
            width,
            height
        );

        return new Promise<Blob>((resolve, reject) => {
            canvas.toBlob((blob) => {
                if (blob) {
                    resolve(blob);
                } else {
                    reject(new Error('Impossible de générer l’image recadrée'));
                }
            }, mimeType || 'image/jpeg', 0.92);
        });
    };

    const handleConfirmCrop = async () => {
        if (!preview || !croppedAreaPixels || !selectedFile) return;

        try {
            const croppedBlob = await getCroppedBlob(preview, croppedAreaPixels, selectedFile.type);
            const ext = selectedFile.name.includes('.') ? selectedFile.name.split('.').pop() ?? 'jpeg' : (selectedFile.type.split('/')[1] || 'jpeg');
            const croppedFile = new File([croppedBlob], `avatar-${Date.now()}.${ext}`, { type: selectedFile.type || croppedBlob.type });
            await handleUpload(croppedFile);
            setIsCropping(false);
            setSelectedFile(null);
            setCroppingDefaults();
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        } catch (error) {
            console.error('Erreur lors du recadrage:', error);
            const message = error instanceof Error ? error.message : 'Erreur inconnue';
            alert(`Impossible de recadrer la photo : ${message}`);
        }
    };

    const getAvatarSrc = () => {
        if (preview) return preview;
        if (currentAvatar && currentAvatar.startsWith('http')) return currentAvatar;
        if (currentAvatar && currentAvatar.startsWith('/uploads/')) {
            return `http://localhost:3001${currentAvatar}`;
        }
        return currentAvatar;
    };

    return (
        <div className="flex flex-col items-center gap-4">
            <div className="relative group">
                <img
                    key={getAvatarSrc()} // Force le re-render quand l'URL change
                    src={getAvatarSrc()}
                    alt="Avatar"
                    className="w-32 h-32 rounded-full object-cover border-4 border-purple-500"
                />

                {/* Overlay au survol */}
                <div
                    onClick={handleClick}
                    className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                    <span className="text-white text-sm font-medium">
                        {uploading ? 'Upload...' : 'Changer'}
                    </span>
                </div>
            </div>

            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                disabled={uploading}
            />

            <button
                onClick={handleClick}
                disabled={uploading}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {uploading ? 'Upload en cours...' : 'Choisir une photo'}
            </button>

            <p className="text-sm text-gray-400 text-center">
                JPG, PNG, GIF ou WEBP - Max 5MB
            </p>

            {isCropping && preview && (
                <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/80 px-4">
                    <div className="w-full max-w-xl rounded-2xl bg-white p-4 shadow-2xl">
                        <h2 className="text-lg font-semibold text-brand-dark mb-4 text-center">Ajustez votre photo</h2>
                        <div className="relative h-80 w-full overflow-hidden rounded-xl bg-black">
                            <Cropper
                                image={preview}
                                crop={crop}
                                zoom={zoom}
                                aspect={1}
                                cropShape="round"
                                onCropChange={setCrop}
                                onZoomChange={setZoom}
                                onCropComplete={(_, croppedPixels) => setCroppedAreaPixels(croppedPixels)}
                            />
                        </div>
                        <div className="mt-6 flex flex-col gap-4">
                            <label className="flex items-center gap-3 text-sm text-brand-dark">
                                Zoom
                                <input
                                    type="range"
                                    min={1}
                                    max={3}
                                    step={0.1}
                                    value={zoom}
                                    onChange={(event) => setZoom(Number(event.target.value))}
                                    className="flex-1"
                                />
                            </label>
                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={handleCancelCrop}
                                    disabled={uploading}
                                    className="rounded-lg border border-brand-secondary px-4 py-2 text-sm font-semibold text-brand-subtle hover:text-brand-dark disabled:opacity-50"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="button"
                                    onClick={handleConfirmCrop}
                                    disabled={uploading}
                                    className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700 disabled:opacity-50"
                                >
                                    {uploading ? 'Upload...' : 'Valider'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const createImage = (url: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.addEventListener('load', () => resolve(image));
        image.addEventListener('error', (error) => reject(error));
        image.setAttribute('crossOrigin', 'anonymous');
        image.src = url;
    });
};
