// src/controllers/admin.controller.ts
import { Request, Response, NextFunction } from 'express';
import {Auth0Service} from '../../services/auth.service.js';
import {PrismaClient} from '../../generated/prisma/client.js';         // ← your Prisma client
import { generateAdminToken } from '../../utils/AdminJwt.js';
import { catchAsync } from '../../utils/CatchAsync.js';


const prisma = new PrismaClient();

class AdminController {
  registerAdmin = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, email, username, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Missing name, email, or password' });
    }

    // 1) Create user in Auth0
    const auth0User = await Auth0Service.createUser(email, password, username);
    const auth0Id = auth0User.user_id; // ✅ Only extract the user_id

    // 2) Persist to your Admin table
    const admin = await prisma.admin.create({
      data: {
        name,
        email,
        auth0Id, // ✅ This should be a string, like "auth0|abc123"
      }
    });

    // 3) Issue your own JWT if desired
    const token = generateAdminToken({ auth0Id });

    res.status(201).json({
      message: 'Admin registered successfully',
      adminId: admin.id,
      token
    });
  }
);

}

export default new AdminController();
