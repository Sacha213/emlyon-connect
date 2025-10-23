import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const USERS = [
  {
    email: 'alice@emlyon.com',
    password: 'password123',
    name: 'Alice Martin',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alice',
    promotion: 'EMI 2025'
  },
  {
    email: 'bob@emlyon.com',
    password: 'password123',
    name: 'Bob Dupont',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=bob',
    promotion: 'EMI 2025'
  },
  {
    email: 'charlie@emlyon.com',
    password: 'password123',
    name: 'Charlie Dubois',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=charlie',
    promotion: 'EMI 2024'
  },
  {
    email: 'diana@emlyon.com',
    password: 'password123',
    name: 'Diana Lambert',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=diana',
    promotion: 'EMI 2026'
  },
  {
    email: 'ethan@emlyon.com',
    password: 'password123',
    name: 'Ethan Rousseau',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ethan',
    promotion: 'EMI Test'
  }
];

const CHECK_INS = [
  {
    locationName: 'Le Comptoir des Brasseurs',
    latitude: 45.7640,
    longitude: 4.8357,
    statusEmoji: '🍻'
  },
  {
    locationName: 'Bibliothèque Part-Dieu',
    latitude: 45.7609,
    longitude: 4.8552,
    statusEmoji: '📚'
  },
  {
    locationName: 'Parc de la Tête d\'Or',
    latitude: 45.7772,
    longitude: 4.8546,
    statusEmoji: '🌳'
  },
  {
    locationName: 'Le Sucre',
    latitude: 45.7489,
    longitude: 4.8181,
    statusEmoji: '🎵'
  }
];

const EVENTS = [
  {
    title: 'Soirée Afterwork',
    description: 'Rejoignez-nous pour un afterwork convivial au Comptoir des Brasseurs !',
    date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) // Dans 2 jours
  },
  {
    title: 'Session Révisions',
    description: 'Groupe de révision pour les examens de fin de semestre. Bibliothèque Part-Dieu, salle 3.',
    date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) // Dans 5 jours
  },
  {
    title: 'Match de Football',
    description: 'Match amical entre promos. Parc de la Tête d\'Or, terrain principal.',
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Dans 7 jours
  },
  {
    title: 'Soirée Le Sucre',
    description: 'Grande soirée étudiante au club Le Sucre. Entrée à tarif réduit pour les étudiants emlyon !',
    date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000) // Dans 10 jours
  }
];

async function main() {
  console.log('🌱 Début du seeding...');

  // Nettoyer la base de données
  console.log('🧹 Nettoyage de la base de données...');
  await prisma.eventAttendee.deleteMany();
  await prisma.event.deleteMany();
  await prisma.checkIn.deleteMany();
  await prisma.user.deleteMany();

  // Créer les utilisateurs
  console.log('👥 Création des utilisateurs...');
  const createdUsers = [];
  for (const userData of USERS) {
    const hashedPassword = await bcrypt.hash(userData.password, 12);
    const user = await prisma.user.create({
      data: {
        ...userData,
        password: hashedPassword
      }
    });
    createdUsers.push(user);
    console.log(`  ✓ ${user.name} créé`);
  }

  // Créer les check-ins
  console.log('📍 Création des check-ins...');
  for (let i = 0; i < Math.min(CHECK_INS.length, createdUsers.length); i++) {
    const checkIn = await prisma.checkIn.create({
      data: {
        ...CHECK_INS[i],
        userId: createdUsers[i].id
      }
    });
    console.log(`  ✓ Check-in créé pour ${createdUsers[i].name} à ${checkIn.locationName}`);
  }

  // Créer les événements
  console.log('📅 Création des événements...');
  for (let i = 0; i < EVENTS.length; i++) {
    const creator = createdUsers[i % createdUsers.length];
    const event = await prisma.event.create({
      data: {
        ...EVENTS[i],
        creatorId: creator.id
      }
    });

    // Le créateur participe automatiquement
    await prisma.eventAttendee.create({
      data: {
        eventId: event.id,
        userId: creator.id
      }
    });

    // Ajouter quelques participants aléatoires
    const numAttendees = Math.floor(Math.random() * 3) + 1;
    for (let j = 0; j < numAttendees; j++) {
      const randomUser = createdUsers[Math.floor(Math.random() * createdUsers.length)];

      // Vérifier si l'utilisateur ne participe pas déjà
      const existing = await prisma.eventAttendee.findUnique({
        where: {
          eventId_userId: {
            eventId: event.id,
            userId: randomUser.id
          }
        }
      });

      if (!existing) {
        await prisma.eventAttendee.create({
          data: {
            eventId: event.id,
            userId: randomUser.id
          }
        });
      }
    }

    console.log(`  ✓ Événement "${event.title}" créé par ${creator.name}`);
  }

  console.log('\n✅ Seeding terminé avec succès !');
  console.log('\n📊 Résumé:');
  console.log(`  - ${createdUsers.length} utilisateurs créés`);
  console.log(`  - ${CHECK_INS.length} check-ins créés`);
  console.log(`  - ${EVENTS.length} événements créés`);
  console.log('\n🔐 Identifiants de test:');
  console.log('  Email: alice@emlyon.com');
  console.log('  Mot de passe: password123');
  console.log('\n  (Tous les utilisateurs ont le même mot de passe: password123)');
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
