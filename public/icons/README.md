# Génération des icônes PWA

## Option 1 : Générateur en ligne (recommandé)
Utilise [PWA Asset Generator](https://www.pwabuilder.com/imageGenerator) :
1. Upload ton logo emlyon (idéalement 512x512px minimum)
2. Télécharge le pack d'icônes
3. Place-les dans ce dossier `/public/icons/`

## Option 2 : Avec ImageMagick (ligne de commande)
Si tu as ImageMagick installé :

```bash
# À partir d'une image source (ex: logo.png)
convert logo.png -resize 72x72 icon-72x72.png
convert logo.png -resize 96x96 icon-96x96.png
convert logo.png -resize 128x128 icon-128x128.png
convert logo.png -resize 144x144 icon-144x144.png
convert logo.png -resize 152x152 icon-152x152.png
convert logo.png -resize 192x192 icon-192x192.png
convert logo.png -resize 384x384 icon-384x384.png
convert logo.png -resize 512x512 icon-512x512.png
```

## Tailles requises
- 72x72 (Android)
- 96x96 (Android)
- 128x128 (Desktop)
- 144x144 (Android)
- 152x152 (iOS)
- 192x192 (Standard)
- 384x384 (Standard)
- 512x512 (Splash screen)

## Recommandations
- Format PNG
- Fond transparent ou rouge emlyon (#e30613)
- Logo simple et lisible en petit format
