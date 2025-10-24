import { useState, useRef, ChangeEvent } from 'react';
import { supabase } from '../services/supabaseClient';
import { updateUserProfile } from '../services/api';

interface AvatarUploadProps {
    currentAvatar?: string;
    onUploadSuccess: (newAvatarUrl: string) => void;
}

export const AvatarUpload = ({ currentAvatar, onUploadSuccess }: AvatarUploadProps) => {
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);
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

            // Créer une prévisualisation
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result as string);
            };
            reader.readAsDataURL(file);

            // Upload automatique
            handleUpload(file);
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

    const handleClick = () => {
        fileInputRef.current?.click();
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
        </div>
    );
};
