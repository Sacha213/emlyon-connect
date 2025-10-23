# 📸 Upload de Photo de Profil

## Vue d'ensemble

Cette fonctionnalité permet aux utilisateurs d'uploader et gérer leur photo de profil personnalisée.

## 🎯 Endpoints disponibles

### 1. Upload d'avatar

**POST** `/api/users/me/avatar`

Upload ou remplacement de la photo de profil de l'utilisateur connecté.

**Headers requis :**
```
Authorization: Bearer <token_jwt>
Content-Type: multipart/form-data
```

**Body (FormData) :**
```
avatar: <fichier_image>
```

**Contraintes :**
- Formats acceptés : JPEG, JPG, PNG, GIF, WEBP
- Taille maximale : 5 MB
- Un seul fichier à la fois

**Réponse (200 OK) :**
```json
{
  "success": true,
  "message": "Photo de profil mise à jour",
  "data": {
    "id": "eb5bc0fe-9d20-4ce4-9d9c-e5444f8e08a7",
    "email": "alice@emlyon.com",
    "name": "Alice Martin",
    "avatarUrl": "/uploads/avatars/avatar-1761128168218-27118061.png",
    "createdAt": "2025-10-22T10:03:35.642Z"
  }
}
```

**Erreurs possibles :**
- `400 Bad Request` : Aucun fichier fourni
- `400 Bad Request` : Type de fichier non autorisé
- `413 Payload Too Large` : Fichier trop volumineux
- `401 Unauthorized` : Token invalide ou manquant

### 2. Accès aux avatars

**GET** `/uploads/avatars/<filename>`

Récupère l'image d'avatar uploadée.

**Exemple :**
```
http://localhost:3001/uploads/avatars/avatar-1761128168218-27118061.png
```

**Réponse :**
- Image directement servie avec headers appropriés
- Cache-Control configuré
- Content-Type automatiquement détecté

## 🧪 Tests avec cURL

### 1. Connexion et récupération du token

```bash
TOKEN=$(curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@emlyon.com","password":"password123"}' \
  | jq -r '.data.token')
```

### 2. Upload d'une photo de profil

```bash
curl -X POST http://localhost:3001/api/users/me/avatar \
  -H "Authorization: Bearer $TOKEN" \
  -F "avatar=@/path/to/your/image.jpg"
```

### 3. Récupération du profil mis à jour

```bash
curl -X GET http://localhost:3001/api/users/me \
  -H "Authorization: Bearer $TOKEN"
```

## 💻 Utilisation Frontend (React)

### Composant d'upload

```tsx
import { useState } from 'react';

function AvatarUpload({ currentAvatar, onSuccess }) {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (file: File) => {
    setUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/users/me/avatar', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) throw new Error('Upload failed');
      
      const data = await response.json();
      onSuccess(data.data.avatarUrl);
    } catch (error) {
      console.error('Error uploading avatar:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <input
      type="file"
      accept="image/*"
      onChange={(e) => {
        const file = e.target.files?.[0];
        if (file) handleUpload(file);
      }}
      disabled={uploading}
    />
  );
}
```

## 🏗️ Architecture Backend

### 1. Configuration Multer (`src/config/multer.ts`)

```typescript
import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/avatars/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E8);
    cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req: any, file: Express.Multer.File, cb: any) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Type de fichier non autorisé'), false);
  }
};

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter
});
```

### 2. Controller (`src/controllers/user.controller.ts`)

Logique de gestion :
- ✅ Validation du fichier uploadé
- ✅ Suppression de l'ancien avatar si existant
- ✅ Mise à jour de la base de données
- ✅ Retour des informations utilisateur mises à jour

### 3. Routes (`src/routes/user.routes.ts`)

```typescript
import { upload } from '../config/multer';

router.post('/me/avatar', 
  authenticate, 
  upload.single('avatar'), 
  userController.updateAvatar
);
```

### 4. Fichiers statiques (`src/server.ts`)

```typescript
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
```

## 📁 Structure des fichiers

```
backend/
├── uploads/
│   └── avatars/
│       ├── .gitkeep
│       └── avatar-1761128168218-27118061.png
├── src/
│   ├── config/
│   │   └── multer.ts
│   ├── controllers/
│   │   └── user.controller.ts
│   ├── routes/
│   │   └── user.routes.ts
│   └── server.ts
└── .gitignore  # uploads/ est exclu
```

## 🔒 Sécurité

### Mesures implémentées :

1. **Authentification JWT** : Token obligatoire
2. **Validation des types** : Seules les images autorisées
3. **Limite de taille** : Maximum 5 MB
4. **Nom de fichier sécurisé** : Génération automatique unique
5. **Nettoyage** : Suppression de l'ancien avatar

### Bonnes pratiques :

- ✅ Ne jamais faire confiance au nom de fichier client
- ✅ Valider le type MIME
- ✅ Limiter la taille des uploads
- ✅ Stocker les fichiers hors de `/public` si possible
- ✅ Nettoyer les anciens fichiers

## 🐛 Dépannage

### Erreur "No file uploaded"

**Cause :** Le champ du formulaire n'est pas nommé `avatar`

**Solution :**
```javascript
formData.append('avatar', file); // Nom exact requis
```

### Erreur "Type de fichier non autorisé"

**Cause :** Format d'image non supporté

**Solution :** Utilisez JPG, PNG, GIF ou WEBP uniquement

### Erreur 413 "Payload Too Large"

**Cause :** Fichier supérieur à 5 MB

**Solution :** Réduire la taille de l'image avant upload

### Image non accessible via HTTP

**Cause :** Serveur statique non configuré

**Solution :** Vérifier que cette ligne existe dans `server.ts` :
```typescript
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
```

## 🎨 Améliorations futures

- [ ] Compression automatique des images (Sharp)
- [ ] Plusieurs tailles d'avatar (thumbnails)
- [ ] Stockage cloud (AWS S3, Cloudinary)
- [ ] Détection de contenu inapproprié
- [ ] Support de la webcam
- [ ] Recadrage côté client

## 📚 Ressources

- [Multer Documentation](https://github.com/expressjs/multer)
- [Express Static Files](https://expressjs.com/en/starter/static-files.html)
- [MDN FormData](https://developer.mozilla.org/fr/docs/Web/API/FormData)
