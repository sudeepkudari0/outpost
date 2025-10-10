import { PrismaClient } from '@prisma/client';
import { createHash, randomBytes } from 'crypto';

const prisma = new PrismaClient();

async function createAdmin() {
  const email = 'admin@thinkroman.com';
  const name = 'Dr Ashwani Dhar';
  const password = 'WeThink$$247';

  try {
    // Check if admin already exists
    const existingUser = await prisma.user.findFirst({
      where: { email },
    });

    if (existingUser) {
      console.log('Admin user already exists!');
      return;
    }

    // Create admin user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        role: 'ADMIN',
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

    console.log('Admin user created successfully!');
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    console.log('Please change the password after first login.');
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
