/**
 * MQTT Simulator - Publica dados simulados de consumo energético industrial
 * Uso: node mqtt-simulator.js
 */

const mqtt = require('mqtt');

// Configuração
const MQTT_URL = 'mqtt://localhost:1883';
const client = mqtt.connect(MQTT_URL);

// Dados de máquinas simuladas
const machines = [
  {
    deviceKey: 'e431ba3b6bf54bebaaaed6c99c80e358',
    machineName: 'Máquina 01',
    sector: 'Produção',
  },
  {
    deviceKey: '58af7bf3e3304336bce750f6aa732d07',
    machineName: 'Máquina 02',
    sector: 'Corte',
  },
  {
    deviceKey: '2b95a6a90c8c4aa6913b38c2e58bf687',
    machineName: 'Máquina 03',
    sector: 'Embalagem',
  },
  {
    deviceKey: 'd80698baba2941fa8c8bbb2224fe6209',
    machineName: 'Máquina 04',
    sector: 'Pintura',
  },
];

// Função para gerar consumo simulado
function generateTelemetry(machine) {
  const consumptionKwh = Math.random() * 100; // 0-100 kWh
  let status = 'NORMAL';
  if (consumptionKwh >= 70 && consumptionKwh <= 90) {
    status = 'ATENCAO';
  } else if (consumptionKwh > 90) {
    status = 'CRITICO';
  }

  return {
    deviceId: machine.deviceKey,
    deviceKey: machine.deviceKey,
    machineName: machine.machineName,
    sector: machine.sector,
    consumptionKwh: parseFloat(consumptionKwh.toFixed(2)),
    voltage: 220 + Math.random() * 10,
    current: 5 + Math.random() * 20,
    status,
    timestamp: new Date().toISOString(),
  };
}

client.on('connect', () => {
  console.log('✅ Conectado ao MQTT broker');
  console.log(`📨 Publicando dados a cada 2 segundos...\n`);

  // Publicar dados continuamente
  let counter = 0;
  const interval = setInterval(() => {
    machines.forEach((machine) => {
      const telemetry = generateTelemetry(machine);
      const topic = `industrial/machines/${machine.deviceKey}/energy`;

      client.publish(topic, JSON.stringify(telemetry), { qos: 1 }, (err) => {
        if (err) {
          console.error(`❌ Erro ao publicar em ${topic}:`, err);
        } else {
          console.log(
            `[${new Date().toLocaleTimeString()}] 📤 ${machine.machineName} (${machine.sector}) - ${telemetry.consumptionKwh} kWh [${telemetry.status}]`,
          );
        }
      });
    });

    counter++;
    if (counter > 100) {
      console.log('\n✅ Simulação concluída (100 ciclos)');
      clearInterval(interval);
      client.end();
      process.exit(0);
    }
  }, 2000);
});

client.on('error', (err) => {
  console.error('❌ Erro ao conectar ao MQTT:', err);
  process.exit(1);
});

process.on('SIGINT', () => {
  console.log('\n\n🛑 Simulador interrompido');
  client.end();
  process.exit(0);
});
