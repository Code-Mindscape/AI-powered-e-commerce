import dotenv from 'dotenv';
import { ConfigParams } from 'express-openid-connect';
import { upsertUser } from '../middlewares/auth.middleware.js';
import jwt from 'jsonwebtoken';

dotenv.config();

export const authConfig: ConfigParams = {
  issuerBaseURL: process.env.AUTH_ISSUER_BASEURL!, // e.g., https://codemindscape.us.auth0.com
  baseURL: process.env.AUTH_BASEURL!, // e.g., http://localhost:3000
  clientID: process.env.AUTH_CLIENTID!,
  clientSecret: process.env.AUTH_CLIENT_SECRET!,
  secret: process.env.AUTH_SECRET!,
  authRequired: false,
  auth0Logout: true,
  authorizationParams: {
    response_type: 'code',
    scope: 'openid profile email',
  },
  afterCallback: async (_req, _res, session) => {
    if (!session.user) {
      const userData = session.id_token ? jwt.decode(session.id_token) : null;
      if (!userData) {
        throw new Error('No user data found in session or id_token.');
      }
      session.user = userData;
    }
    return await upsertUser(session);
  },
};