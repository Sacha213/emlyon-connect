import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🧹 Nettoyage de la base de données...');

  // Supprimer toutes les données existantes (dans le bon ordre pour respecter les relations)
  await prisma.eventAttendee.deleteMany({});
  await prisma.event.deleteMany({});
  await prisma.checkIn.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('✅ Base de données nettoyée');

  // Créer uniquement votre compte admin dans la promo Dev
  const hashedPassword = await bcrypt.hash('password123', 12);

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@emlyon.com',
      password: hashedPassword,
      name: 'Admin Dev',
      promotion: 'Dev',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin'
    }
  });

  console.log('✅ Compte admin créé:', {
    email: 'admin@emlyon.com',
    password: 'password123',
    promotion: 'Dev'
  });

  console.log('\n📊 Résumé de la base de données:');
  console.log('- Promotions disponibles: EMI, Dev');
  console.log('- Utilisateurs promo EMI: 0');
  console.log('- Utilisateurs promo Dev: 1 (admin@emlyon.com)');
  console.log('- Check-ins: 0');
  console.log('- Événements: 0');

  console.log('\n🚀 Base de données prête pour la production !');
  console.log('\nPour tester, connectez-vous avec:');
  console.log('  Email: admin@emlyon.com');
  console.log('  Mot de passe: password123');
}

main()
  .catch((e) => {
    console.error('❌ Erreur:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
