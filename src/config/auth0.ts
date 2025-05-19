import { ConfigParams } from 'express-openid-connect';
import { upsertUser } from '../middlewares/auth.middleware.js';

export const authConfig: ConfigParams = {
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL!,
  baseURL:       process.env.BASE_URL!,
  clientID:      process.env.AUTH0_CLIENT_ID!,
  secret:        process.env.AUTH0_CLIENT_SECRET!,
  authRequired:  false,
  auth0Logout:   true,
  afterCallback: async (_req, _res, session) => upsertUser(session)
};