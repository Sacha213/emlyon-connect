/**
 * Transforme un chemin d'avatar relatif en URL complète
 * @param avatarUrl - Le chemin de l'avatar (peut être relatif ou une URL complète)
 * @returns L'URL complète de l'avatar
 */
export const formatAvatarUrl = (avatarUrl: string | null | undefined): string => {
    if (!avatarUrl) {
        return '';
    }

    // Si c'est déjà une URL complète (http/https), on la retourne telle quelle
    if (avatarUrl.startsWith('http://') || avatarUrl.startsWith('https://')) {
        return avatarUrl;
    }

    // Si c'est un chemin relatif commençant par /uploads/, on ajoute le domaine
    if (avatarUrl.startsWith('/uploads/')) {
        return `http://localhost:3001${avatarUrl}`;
    }

    // Sinon, on retourne tel quel
    return avatarUrl;
};
