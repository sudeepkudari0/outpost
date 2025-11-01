import { PrismaClient } from '@prisma/client';
import { createHash, randomBytes } from 'crypto';

const prisma = new PrismaClient();

interface UserData {
  name: string;
  email: string;
  password: string;
  role: 'ADMIN' | 'USER';
}

async function createUser(userData: UserData) {
  const { name, email, password, role } = userData;

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: { email },
    });

    if (existingUser) {
      console.log(`User ${email} already exists! Skipping...`);
      return { created: false, email };
    }

    // Generate salt and hash password
    const salt = randomBytes(16).toString('hex');
    const saltedPassword = password + salt;
    const hashedPassword = createHash('sha256')
      .update(saltedPassword)
      .digest('hex');

    // Create user and account in transaction
    await prisma.$transaction(async tx => {
      const user = await tx.user.create({
        data: {
          name,
          email,
          role,
          isVerified: true,
          status: 'ACTIVE',
          passwordSet: true,
        },
      });

      await tx.account.create({
        data: {
          userId: user.id,
          type: 'EMAIL',
          provider: 'credentials',
          providerAccountId: email,
          password: hashedPassword,
          salt: salt,
        },
      });
    });

    console.log(`✅ ${role} created successfully!`);
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    return { created: true, email };
  } catch (error) {
    console.error(`❌ Error creating ${role} ${email}:`, error);
    return { created: false, email };
  }
}

async function createE2EUsers() {
  console.log('🚀 Creating E2E test users...\n');

  const users: UserData[] = [
    {
      name: 'Admin User',
      email: 'admin@outpost.com',
      password: 'Admin@#123',
      role: 'ADMIN',
    },
    {
      name: 'Test User',
      email: 'user@outpost.com',
      password: 'User@#123',
      role: 'USER',
    },
  ];

  const results = await Promise.all(users.map(user => createUser(user)));

  console.log('\n📊 Summary:');
  const created = results.filter(r => r.created);
  const skipped = results.filter(r => !r.created);

  console.log(`✅ Created: ${created.length}`);
  created.forEach(r => console.log(`   - ${r.email}`));

  if (skipped.length > 0) {
    console.log(`⏭️  Skipped (already exist): ${skipped.length}`);
    skipped.forEach(r => console.log(`   - ${r.email}`));
  }

  console.log('\n✨ Done!');
}

createE2EUsers()
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
