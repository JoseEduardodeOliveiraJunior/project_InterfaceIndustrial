/**
 * Script para criar devices (máquinas) no banco de dados
 * Uso: node setup-devices.js
 * 
 * Cria 4 máquinas no formato esperado pelo MQTT Simulator
 */

import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';
const ADMIN_EMAIL = 'admin@iot.com';
const ADMIN_PASSWORD = 'admin123';

const machines = [
  {
    deviceKey: 'e431ba3b6bf54bebaaaed6c99c80e358',
    name: 'Máquina 01',
    type: 'Industrial Machine',
  },
  {
    deviceKey: '58af7bf3e3304336bce750f6aa732d07',
    name: 'Máquina 02',
    type: 'Industrial Machine',
  },
  {
    deviceKey: '2b95a6a90c8c4aa6913b38c2e58bf687',
    name: 'Máquina 03',
    type: 'Industrial Machine',
  },
  {
    deviceKey: 'd80698baba2941fa8c8bbb2224fe6209',
    name: 'Máquina 04',
    type: 'Industrial Machine',
  },
];

async function setupDevices() {
  try {
    console.log('🔐 Autenticando...');

    // 1. Login
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    });

    const { access_token } = loginResponse.data;
    console.log('✅ Autenticado com sucesso!');

    const headers = {
      Authorization: `Bearer ${access_token}`,
      'Content-Type': 'application/json',
    };

    // 2. Buscar usuário admin para obter ID
    const usersResponse = await axios.get(`${API_BASE_URL}/users`, { headers });
    const adminUser = usersResponse.data.find(
      (u) => u.email === ADMIN_EMAIL,
    );

    if (!adminUser) {
      console.error('❌ Usuário admin não encontrado');
      process.exit(1);
    }

    console.log(`📧 Admin ID: ${adminUser.id}`);

    // 3. Criar devices
    for (const machine of machines) {
      try {
        const deviceResponse = await axios.post(
          `${API_BASE_URL}/devices`,
          {
            name: machine.name,
            type: machine.type,
            ownerId: adminUser.id,
          },
          { headers },
        );

        // Nota: O deviceKey é gerado automaticamente pelo backend
        // Se quiser usar os deviceKeys específicos, seria necessário
        // atualizar o banco manualmente ou adicionar um endpoint de update
        console.log(
          `✅ ${machine.name} criado (ID: ${deviceResponse.data.id})`,
        );
        console.log(
          `   Device Key gerado: ${deviceResponse.data.deviceKey}`,
        );
      } catch (error) {
        if (error.response?.status === 409) {
          console.log(`⚠️  ${machine.name} já existe`);
        } else {
          console.error(`❌ Erro ao criar ${machine.name}:`, error.message);
        }
      }
    }

    console.log('\n✅ Setup de devices concluído!');
    console.log(
      '\n⚠️  IMPORTANTE: Use os device keys acima no mqtt-simulator.js',
    );
  } catch (error) {
    console.error('❌ Erro durante setup:', error.message);
    if (error.response?.data) {
      console.error('Detalhes:', error.response.data);
    }
    process.exit(1);
  }
}

setupDevices();
