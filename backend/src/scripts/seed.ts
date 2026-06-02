import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

dotenv.config();

async function seed() {
  const ds = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST ?? 'localhost',
    port: parseInt(process.env.DB_PORT ?? '5432', 10),
    username: process.env.DB_USERNAME ?? 'iot_admin',
    password: process.env.DB_PASSWORD ?? 'iot_secret_2024',
    database: process.env.DB_NAME ?? 'iot_platform',
    synchronize: true,
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  });

  await ds.initialize();
  console.log('Database connected');

  const userRepo = ds.getRepository('users');

  // Check if admin exists
  const existing = await userRepo.findOne({ where: { email:'admin@iot.com' } });
  if (existing) {
    console.log('Admin user already exists');
    await ds.destroy();
    return;
  }

  const hashedPassword = await bcrypt.hash('admin123', 10);
  await userRepo.save({
    name: 'Administrador',
    email: 'admin@iot.com',
    password: hashedPassword,
    role: 'admin',
  });

  console.log('✅ Admin user created:');
  console.log('   Email: admin@iot.com');
  console.log('   Password: admin123');

  await ds.destroy();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
