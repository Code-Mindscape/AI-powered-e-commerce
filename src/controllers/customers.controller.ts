// src/controllers/customer.controller.ts
import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '../generated/prisma/client.js';
import { catchAsync } from '../utils/CatchAsync.js';

const prisma = new PrismaClient();

export const getProfile = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
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
});