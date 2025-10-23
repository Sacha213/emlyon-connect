#!/bin/bash

echo "🚀 Installation du backend emlyon connect"
echo "=========================================="
echo ""

# Couleurs pour les messages
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Vérifier si Docker est installé
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker n'est pas installé${NC}"
    echo "Veuillez installer Docker Desktop : https://www.docker.com/products/docker-desktop"
    exit 1
fi

# Vérifier si Node.js est installé
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js n'est pas installé${NC}"
    echo "Veuillez installer Node.js 18+ : https://nodejs.org"
    exit 1
fi

echo -e "${BLUE}📦 Installation des dépendances...${NC}"
npm install

echo ""
echo -e "${BLUE}🐘 Démarrage de PostgreSQL avec Docker...${NC}"
docker-compose up -d

echo ""
echo -e "${BLUE}⏳ Attente du démarrage de la base de données...${NC}"
sleep 5

echo ""
echo -e "${BLUE}🗄️ Configuration de la base de données...${NC}"

# Créer le fichier .env s'il n'existe pas
if [ ! -f .env ]; then
    echo -e "${YELLOW}📝 Création du fichier .env...${NC}"
    cat > .env << EOL
DATABASE_URL="postgresql://emlyon:emlyon2025@localhost:5432/emlyon_connect?schema=public"
JWT_SECRET="emlyon_connect_secret_key_change_me_in_production"
JWT_EXPIRES_IN="7d"
PORT=3001
NODE_ENV="development"
FRONTEND_URL="http://localhost:5173"
EOL
    echo -e "${GREEN}✓ Fichier .env créé${NC}"
else
    echo -e "${GREEN}✓ Fichier .env existe déjà${NC}"
fi

echo ""
echo -e "${BLUE}🔨 Génération du client Prisma...${NC}"
npm run prisma:generate

echo ""
echo -e "${BLUE}🔄 Exécution des migrations...${NC}"
npm run prisma:migrate

echo ""
echo -e "${BLUE}🌱 Ajout des données de test...${NC}"
npm run prisma:seed

echo ""
cat .installation-success.txt
