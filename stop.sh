#!/bin/bash

# Script d'arrêt pour emlyon connect

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}🛑 Arrêt de emlyon connect...${NC}"
echo ""

# Lire les PIDs sauvegardés
if [ -f .backend.pid ]; then
    BACKEND_PID=$(cat .backend.pid)
    if ps -p $BACKEND_PID > /dev/null 2>&1; then
        echo -e "${YELLOW}   Arrêt du backend (PID: $BACKEND_PID)...${NC}"
        kill $BACKEND_PID 2>/dev/null
        echo -e "${GREEN}   ✅ Backend arrêté${NC}"
    fi
    rm -f .backend.pid
fi

if [ -f .frontend.pid ]; then
    FRONTEND_PID=$(cat .frontend.pid)
    if ps -p $FRONTEND_PID > /dev/null 2>&1; then
        echo -e "${YELLOW}   Arrêt du frontend (PID: $FRONTEND_PID)...${NC}"
        kill $FRONTEND_PID 2>/dev/null
        echo -e "${GREEN}   ✅ Frontend arrêté${NC}"
    fi
    rm -f .frontend.pid
fi

# Tuer tous les processus sur les ports 3000 et 3001 au cas où
if lsof -ti:3001 > /dev/null 2>&1; then
    echo -e "${YELLOW}   Nettoyage du port 3001...${NC}"
    kill -9 $(lsof -ti:3001) 2>/dev/null
fi

if lsof -ti:3000 > /dev/null 2>&1; then
    echo -e "${YELLOW}   Nettoyage du port 3000...${NC}"
    kill -9 $(lsof -ti:3000) 2>/dev/null
fi

echo ""
echo -e "${GREEN}✅ Tous les serveurs sont arrêtés${NC}"
echo ""
