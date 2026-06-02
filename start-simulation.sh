#!/bin/bash

# Script para setup completo e iniciar a simulação
# Execute: bash start-simulation.sh

set -e

echo "🏭 Industrial Energy Monitoring - Setup Completo"
echo "================================================"
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar se Docker está rodando
echo -e "${YELLOW}1. Verificando se Docker está rodando...${NC}"
if ! docker ps > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker não está rodando${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Docker está rodando${NC}"

# Verificar se serviços estão UP
echo -e "\n${YELLOW}2. Verificando serviços Docker...${NC}"
docker-compose ps | grep -E "iot_postgres|iot_mosquitto"
echo -e "${GREEN}✅ PostgreSQL e Mosquitto estão rodando${NC}"

# Instalar dependências se necessário
echo -e "\n${YELLOW}3. Instalando dependências...${NC}"
if ! npm list mqtt > /dev/null 2>&1; then
    echo "Instalando mqtt..."
    npm install mqtt
fi
echo -e "${GREEN}✅ Dependências prontas${NC}"

# Opções
echo ""
echo -e "${YELLOW}4. Selecione como rodar a simulação:${NC}"
echo ""
echo "  1) Simulador Node.js simples (recomendado para testes rápidos)"
echo "  2) Node-RED (mais flexível, precisa estar instalado)"
echo "  3) Apenas setup - não iniciar simulação"
echo ""

read -p "Escolha (1-3): " choice

case $choice in
  1)
    echo ""
    echo -e "${YELLOW}Iniciando simulador MQTT...${NC}"
    echo "Pressione CTRL+C para parar"
    sleep 2
    node mqtt-simulator.js
    ;;
  2)
    echo ""
    echo -e "${YELLOW}Iniciando Node-RED...${NC}"
    echo "Acesse: http://localhost:1880"
    echo "Importe o arquivo: node-red-flow.json"
    echo ""
    node-red
    ;;
  3)
    echo ""
    echo -e "${GREEN}✅ Setup concluído!${NC}"
    echo ""
    echo "Próximas etapas (execute em terminais diferentes):"
    echo ""
    echo "Terminal 1 - Backend:"
    echo "  cd backend && npm run start:dev"
    echo ""
    echo "Terminal 2 - Frontend:"
    echo "  cd frontend && npm run dev"
    echo ""
    echo "Terminal 3 - Simulador:"
    echo "  node mqtt-simulator.js"
    echo ""
    ;;
  *)
    echo -e "${RED}❌ Opção inválida${NC}"
    exit 1
    ;;
esac
