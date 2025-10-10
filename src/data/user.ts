'use server';

import { prisma } from '@/lib/db';

export const getUserByEmail = async (email: string) => {
  try {
    const user = await prisma.user.findFirst({
      where: { email },
    });
    if (!user?.id) {
      return null;
    }

    return user;
  } catch (error) {
    console.error(error);
    return null;
  }
};
export const getUserByWhatsApp = async (whatsapp: string) => {
  try {
    const user = await prisma.user.findFirst({
      where: { whatsapp },
      select: {
        id: true,
        whatsapp: true,
        email: true,
        role: true,
        name: true,
        passwordSet: true,
      },
    });
    if (!user?.id) {
      return null;
    }

    return user;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const getUserById = async (id: string) => {
  try {
    return await prisma.user.findUnique({ where: { id } });
  } catch (error) {
    return null;
  }
};

export async function getAccountByUserId(userId: string) {
  try {
    return await prisma.account.findUnique({ where: { userId } });
  } catch (error) {
    console.error(error);
    return null;
  }
}
