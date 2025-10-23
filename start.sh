#!/bin/bash

# Script de démarrage pour emlyon connect
# Lance le backend (port 3001) et le frontend (port 3000)

# Couleurs pour l'affichage
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🎓 Démarrage de emlyon connect...${NC}"
echo ""

# Vérifier si PostgreSQL est démarré
echo -e "${BLUE}📦 Vérification de PostgreSQL...${NC}"
if ! pg_isready -q; then
    echo -e "${YELLOW}⚠️  PostgreSQL n'est pas démarré. Démarrage en cours...${NC}"
    brew services start postgresql@15
    sleep 3
else
    echo -e "${GREEN}✅ PostgreSQL est déjà actif${NC}"
fi

# Tuer les anciens processus sur les ports 3000 et 3001
echo -e "${BLUE}🧹 Nettoyage des anciens processus...${NC}"
if lsof -ti:3001 > /dev/null 2>&1; then
    echo -e "${YELLOW}   Arrêt du backend sur le port 3001...${NC}"
    kill -9 $(lsof -ti:3001) 2>/dev/null
fi

if lsof -ti:3000 > /dev/null 2>&1; then
    echo -e "${YELLOW}   Arrêt du frontend sur le port 3000...${NC}"
    kill -9 $(lsof -ti:3000) 2>/dev/null
fi

sleep 1

# Démarrer le backend
echo -e "${BLUE}🔧 Démarrage du backend (API + WebSocket)...${NC}"
cd backend
npm run dev > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
cd ..

# Attendre que le backend démarre
sleep 4

# Vérifier que le backend répond
if curl -s http://localhost:3001/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend démarré avec succès (PID: $BACKEND_PID)${NC}"
else
    echo -e "${RED}❌ Erreur au démarrage du backend${NC}"
    echo -e "${YELLOW}   Consultez logs/backend.log pour plus de détails${NC}"
    exit 1
fi

# Démarrer le frontend
echo -e "${BLUE}🎨 Démarrage du frontend (React + Vite)...${NC}"
npm run dev > logs/frontend.log 2>&1 &
FRONTEND_PID=$!

# Attendre que le frontend démarre
sleep 5

# Vérifier que le frontend répond
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 | grep -q "200"; then
    echo -e "${GREEN}✅ Frontend démarré avec succès (PID: $FRONTEND_PID)${NC}"
else
    echo -e "${YELLOW}⚠️  Frontend en cours de démarrage...${NC}"
fi

# Afficher les informations
echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✨ emlyon connect est prêt !${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${BLUE}🌐 URLs d'accès :${NC}"
echo -e "   Frontend : ${GREEN}http://localhost:3000${NC}"
echo -e "   Backend  : ${GREEN}http://localhost:3001${NC}"
echo ""
echo -e "${BLUE}📱 Accès depuis mobile (même WiFi) :${NC}"
echo -e "   Frontend : ${GREEN}http://$(ipconfig getifaddr en0):3000${NC}"
echo ""
echo -e "${BLUE}📋 Processus :${NC}"
echo -e "   Backend PID  : ${YELLOW}$BACKEND_PID${NC}"
echo -e "   Frontend PID : ${YELLOW}$FRONTEND_PID${NC}"
echo ""
echo -e "${BLUE}📊 Logs en temps réel :${NC}"
echo -e "   ${YELLOW}tail -f logs/backend.log${NC}"
echo -e "   ${YELLOW}tail -f logs/frontend.log${NC}"
echo ""
echo -e "${BLUE}🛑 Pour arrêter les serveurs :${NC}"
echo -e "   ${YELLOW}./stop.sh${NC}"
echo -e "   ou manuellement : ${YELLOW}kill $BACKEND_PID $FRONTEND_PID${NC}"
echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${BLUE}💡 Conseil :${NC} Ouvrez http://localhost:3000 dans votre navigateur"
echo ""

# Sauvegarder les PIDs pour le script stop
echo "$BACKEND_PID" > .backend.pid
echo "$FRONTEND_PID" > .frontend.pid

# Option: Ouvrir automatiquement le navigateur (décommentez si souhaité)
# sleep 2
# open http://localhost:3000

# Garder le script actif et afficher les logs
echo -e "${YELLOW}Appuyez sur Ctrl+C pour arrêter les serveurs${NC}"
echo ""

# Fonction pour nettoyer à l'arrêt
cleanup() {
    echo ""
    echo -e "${YELLOW}🛑 Arrêt des serveurs...${NC}"
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    rm -f .backend.pid .frontend.pid
    echo -e "${GREEN}✅ Serveurs arrêtés${NC}"
    exit 0
}

trap cleanup INT TERM

# Attendre que l'utilisateur arrête le script
wait
