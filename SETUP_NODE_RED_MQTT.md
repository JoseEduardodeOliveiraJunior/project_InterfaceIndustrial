# 🏭 Setup - Node-RED → MQTT → Backend → Database → Frontend

## ✅ Status atual
- ✅ PostgreSQL rodando (porta 5432)
- ✅ Mosquitto/MQTT rodando (porta 1883)
- ✅ Backend pronto para receber dados
- ✅ Frontend pronto para exibir em tempo real

---

## 📋 Opção 1: Usar Script Node.js Simples (Rápido)

### Pré-requisitos
```bash
npm install mqtt
```

### Executar simulador
Na raiz do projeto (`/home/edujr/Área de trabalho/PJ_maquina`):

```bash
node mqtt-simulator.js
```

**O que ele faz:**
- Publica dados simulados de 4 máquinas
- Consome entre 0-100 kWh aleatoriamente
- Classifica como NORMAL, ATENCAO ou CRITICO
- Publica a cada 2 segundos no MQTT
- Continua por 100 ciclos (aproximadamente 3 minutos)

**Saída esperada:**
```
✅ Conectado ao MQTT broker
📨 Publicando dados a cada 2 segundos...

[14:35:22] 📤 Máquina 01 (Produção) - 55.42 kWh [NORMAL]
[14:35:22] 📤 Máquina 02 (Corte) - 82.15 kWh [ATENCAO]
[14:35:22] 📤 Máquina 03 (Embalagem) - 96.78 kWh [CRITICO]
[14:35:22] 📤 Máquina 04 (Pintura) - 68.90 kWh [NORMAL]
```

---

## 📋 Opção 2: Usar Node-RED (Mais flexível)

### Instalação do Node-RED
```bash
npm install -g node-red
```

### Iniciar Node-RED
```bash
node-red
```

Acesse: `http://localhost:1880`

### Importar fluxo pronto
1. Clique em **Menu** (três linhas) → **Import**
2. Cole o conteúdo do arquivo `node-red-flow.json`
3. Clique em **Import**
4. Clique em **Deploy**

O fluxo vai:
- Simular 4 máquinas publicando consumo energético
- Variar o consumo de forma aleatória
- Publicar no tópico: `industrial/machines/{deviceKey}/energy`
- Você consegue ajustar a frequência e valores na interface

---

## 🔌 Conectar Backend + Frontend

### 1. Iniciar Backend (novo terminal)
```bash
cd backend
npm run start:dev
```

Você deve ver:
```
[Nest] XXXX - 24/05/2026, 14:35:22     LOG [NestFactory] Starting Nest application...
...
🚀 Application running on http://localhost:3000/api
```

### 2. Iniciar Frontend (novo terminal)
```bash
cd frontend
npm run dev
```

Você deve ver:
```
  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

### 3. Acessar Dashboard
1. Abra: `http://localhost:5173`
2. Faça login com as credenciais padrão:
   - Email: `admin@iot.com`
   - Senha: `admin123`
3. Clique em **Painel de Energia Industrial** (Dashboard)

### 4. Iniciar publicação de dados
Execute **em outro terminal**:
```bash
node mqtt-simulator.js
```

---

## 📊 Fluxo de Dados Esperado

```
Node.js Script (mqtt-simulator.js)
    ↓
MQTT Broker (Mosquitto)
    ↓
Backend NestJS (recebe via MQTT)
    ↓
PostgreSQL (armazena telemetria)
    ↓
WebSocket (envia ao frontend)
    ↓
Dashboard (exibe em tempo real)
```

---

## 🧪 Testar Manualmente com MQTT CLI

### Instalar mqtt-cli (opcional)
```bash
npm install -g mqtt
```

### Publicar teste manual
```bash
mqtt pub -h localhost -t industrial/machines/test-machine-01/energy -m '{
  "deviceKey": "test-machine-01",
  "machineName": "Máquina Teste",
  "sector": "Produção",
  "consumptionKwh": 85,
  "voltage": 220,
  "current": 15.5,
  "status": "ATENCAO",
  "timestamp": "2026-05-24T14:35:00"
}'
```

---

## 🔍 Verificar Conexão MQTT

### Ver mensagens em tempo real
```bash
mqtt sub -h localhost -t 'industrial/machines/+/energy'
```

Você deve ver as mensagens sendo publicadas:
```
industrial/machines/123e4567e89b12d3a456426614174000/energy:
{"deviceKey":"123e4567e89b12d3a456426614174000",...}
```

---

## ⚠️ Troubleshooting

### Dashboard não mostra dados?
1. Verifique se está logado (email: `admin@iot.com`)
2. Verifique se backend está rodando: `curl http://localhost:3000/api/devices`
3. Verifique se MQTT está conectado: `mqtt sub -h localhost -t '#'`

### Backend não está recebendo MQTT?
1. Verifique Mosquitto: `sudo docker-compose logs iot_mosquitto`
2. Verifique se publicador está enviando: `mqtt sub -h localhost -t '#'`
3. Verifique logs do backend: Procure por "Connected to MQTT broker"

### Banco de dados vazio?
1. Rode o seed: `npm run seed` (na pasta backend)
2. Crie um dispositivo via API ou interface

---

## 📝 Próximos Passos

1. ✅ Rodar simulador para gerar dados
2. ✅ Verificar dashboard atualizando em tempo real
3. ✅ Tirar print para colocar no artigo
4. (Opcional) Personalizar valores no Node-RED ou mqtt-simulator.js
5. (Opcional) Conectar a sensores reais substituindo o simulador

---

## 🎯 Resumo Rápido (Execute nesta ordem)

**Terminal 1:**
```bash
cd backend && npm run start:dev
```

**Terminal 2:**
```bash
cd frontend && npm run dev
```

**Terminal 3:**
```bash
node mqtt-simulator.js
```

**Terminal 4 (Opcional - Monitorar MQTT):**
```bash
mqtt sub -h localhost -t 'industrial/machines/+/energy'
```

Acesse: `http://localhost:5173` e veja os dados chegando em tempo real! 🚀
