# 🔧 Guide de Dépannage - Upload d'Avatar

## Problèmes courants et solutions

### ❌ Erreur : "Erreur lors de l'upload de la photo"

#### 1. **Vérifier que vous êtes connecté**

Ouvrez la console du navigateur (F12) et tapez :
```javascript
console.log(localStorage.getItem('token'));
```

Si le résultat est `null`, vous n'êtes pas connecté. Connectez-vous à nouveau.

#### 2. **Vérifier que le backend tourne**

```bash
curl http://localhost:3001/api/health
```

Devrait retourner : `{"status":"ok","timestamp":"..."}`

Si ça ne fonctionne pas, relancez le backend :
```bash
cd backend
npm run dev
```

#### 3. **Vérifier les CORS**

Ouvrez la console du navigateur et cherchez des erreurs CORS rouges.

Si vous voyez une erreur CORS, vérifiez `backend/src/server.ts` :
```typescript
app.use(cors({
    origin: 'http://localhost:3000',  // Doit correspondre à votre frontend
    credentials: true
}));
```

#### 4. **Vérifier que le dossier uploads existe**

```bash
ls -la backend/uploads/avatars/
```

Si le dossier n'existe pas :
```bash
mkdir -p backend/uploads/avatars
```

#### 5. **Vérifier les permissions**

```bash
chmod 755 backend/uploads
chmod 755 backend/uploads/avatars
```

### ❌ Erreur : "Type de fichier non autorisé"

**Cause** : Votre fichier n'est pas une image ou a une extension non supportée.

**Formats acceptés** : JPG, JPEG, PNG, GIF, WEBP

**Solution** : Convertissez votre image dans un format supporté.

### ❌ Erreur : "Payload Too Large" ou "File too large"

**Cause** : Votre image dépasse 5 MB.

**Solution** : 
1. Réduisez la taille de l'image avec un outil en ligne
2. Ou augmentez la limite dans `backend/src/config/multer.ts` :
```typescript
limits: { fileSize: 10 * 1024 * 1024 } // 10MB au lieu de 5MB
```

### ❌ Image uploadée mais ne s'affiche pas

#### 1. **Vérifier que le fichier statique est servi**

Testez l'accès direct à l'image :
```bash
# Récupérez l'URL de l'avatar depuis le profil
curl http://localhost:3001/uploads/avatars/avatar-XXXXX.png -I
```

Devrait retourner `200 OK`.

Si `404 Not Found`, vérifiez `backend/src/server.ts` :
```typescript
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
```

#### 2. **Vérifier le chemin dans la base de données**

```bash
cd backend
npx prisma studio
```

Allez dans Users et vérifiez que `avatarUrl` commence par `/uploads/avatars/`.

### ❌ Erreur : "ENOENT: no such file or directory"

**Cause** : Le dossier uploads n'existe pas ou le chemin est incorrect.

**Solution** : Le code a été mis à jour pour créer automatiquement le dossier. Redémarrez le backend :
```bash
pkill -f "ts-node-dev"
cd backend
npm run dev
```

### 🔍 Débogage avancé

#### Activer les logs détaillés

Ajoutez ceci dans `backend/src/config/multer.ts` :
```typescript
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        console.log('📁 Upload destination:', uploadDir);
        console.log('📁 Dossier existe:', fs.existsSync(uploadDir));
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const filename = 'avatar-' + uniqueSuffix + path.extname(file.originalname);
        console.log('📝 Nom du fichier:', filename);
        cb(null, filename);
    }
});
```

#### Tester avec curl

```bash
# 1. Se connecter et récupérer le token
TOKEN=$(curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@emlyon.com","password":"password123"}' \
  | jq -r '.data.token')

echo $TOKEN

# 2. Créer une image de test
curl -s "https://ui-avatars.com/api/?name=Test&size=200" -o /tmp/test.png

# 3. Uploader l'avatar
curl -X POST http://localhost:3001/api/users/me/avatar \
  -H "Authorization: Bearer $TOKEN" \
  -F "avatar=@/tmp/test.png" \
  | jq

# 4. Vérifier le profil
curl -X GET http://localhost:3001/api/users/me \
  -H "Authorization: Bearer $TOKEN" \
  | jq '.data.avatarUrl'
```

#### Vérifier les logs du navigateur

Ouvrez la console du navigateur (F12) et regardez :
1. **Onglet Console** : Messages d'erreur JavaScript
2. **Onglet Network** : Requêtes HTTP vers `/api/users/me/avatar`
   - Status code (devrait être 200)
   - Response body
   - Request headers (Authorization présent ?)
   - Request body (FormData avec avatar)

### 📝 Checklist complète

- [ ] Backend tourne sur port 3001
- [ ] Frontend tourne sur port 3000
- [ ] PostgreSQL est démarré
- [ ] Dossier `backend/uploads/avatars/` existe
- [ ] Utilisateur est connecté (token dans localStorage)
- [ ] Image fait moins de 5 MB
- [ ] Image est au format JPG/PNG/GIF/WEBP
- [ ] CORS configuré correctement
- [ ] Fichiers statiques configurés dans server.ts
- [ ] Aucune erreur dans les logs backend
- [ ] Aucune erreur dans la console du navigateur

### 🆘 Toujours bloqué ?

1. **Redémarrez tout** :
```bash
./stop.sh
./start.sh
```

2. **Vérifiez les versions** :
```bash
node --version  # Devrait être 18+
npm --version
pg_config --version  # PostgreSQL 14+
```

3. **Consultez les logs** :
```bash
# Logs backend
tail -f logs/backend.log

# Logs frontend
tail -f logs/frontend.log
```

4. **Testez avec un autre navigateur** (Chrome, Firefox, Safari)

5. **Désactivez les extensions de navigateur** (bloqueurs de pub, etc.)

### 📚 Ressources

- [Documentation Multer](https://github.com/expressjs/multer)
- [MDN FormData](https://developer.mozilla.org/fr/docs/Web/API/FormData)
- [CORS Express](https://expressjs.com/en/resources/middleware/cors.html)
