import { PrismaClient } from '../generated/prisma/client.js';
import type { Session } from 'express-openid-connect'

const prisma = new PrismaClient();
;

export async function upsertUser(session: Session) {
  const { sub: auth0Id, name, email } = session.user!;
  await prisma.customer.upsert({
    where: { auth0Id },
    update: { name, email, updatedAt: new Date() },
    create: { auth0Id, name, email }
  });
  return session;
}
