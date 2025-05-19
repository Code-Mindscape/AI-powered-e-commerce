// src/controllers/customer.controller.ts

import { Request, Response } from 'express';
import { PrismaClient } from '../generated/prisma/client.js';

const prisma = new PrismaClient();

export async function getProfile(req: Request, res: Response) {
  const auth0Id = req.oidc.user?.sub;
  if (!auth0Id) {
    return res.sendStatus(401);
  }

  const customer = await prisma.customer.findUnique({
    where: { auth0Id }
  });

  if (!customer) {
    return res.sendStatus(404); // Not Found
  }
  return res.json(customer);
}
