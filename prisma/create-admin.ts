import { db } from '../src/lib/db';
import { hashPassword } from '../src/lib/auth';
import { v4 as uuidv4 } from 'uuid';

async function createAdminUser() {
  console.log('🌱 Creating admin user...');

  try {
    const admin = await db.admin.create({
      data: {
        id: uuidv4(),
        email: 'admin@com1111.edu',
        password: hashPassword('admin123'),
        name: 'COM1111 Admin',
        role: 'admin',
        isActive: true
      }
    });

    console.log('✅ Admin user created successfully:');
    console.log('   Email:', admin.email);
    console.log('   Password: admin123');
    console.log('   Name:', admin.name);
    console.log('');
    console.log('🔑 You can now login at /admin/login');

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    await db.$disconnect();
  }
}

createAdminUser();