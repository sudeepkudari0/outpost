import { PrismaClient } from '@prisma/client';
import { createHash, randomBytes } from 'crypto';

const prisma = new PrismaClient();

async function createTestUser() {
  const email = 'test@test.com';
  const name = 'Test User';
  const password = 'Test@#123';

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: { email },
    });

    if (existingUser) {
      console.log('Test user already exists!');
      return;
    }

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        role: 'USER',
        isVerified: true,
        status: 'ACTIVE',
        passwordSet: true,
      },
    });

    // Generate salt and hash password
    const salt = randomBytes(16).toString('hex');
    const saltedPassword = password + salt;
    const hashedPassword = createHash('sha256')
      .update(saltedPassword)
      .digest('hex');

    // Create account
    await prisma.account.create({
      data: {
        userId: user.id,
        type: 'EMAIL',
        provider: 'credentials',
        providerAccountId: email,
        password: hashedPassword,
        salt: salt,
      },
    });

    console.log('Test user created successfully!');
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
  } catch (error) {
    console.error('Error creating test user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();
