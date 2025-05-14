import dotenv from 'dotenv';
dotenv.config();

export default {
  auth0: {
    authRequired: false,
    auth0Logout: true,
    secret: process.env.AUTH_SECRET!,
    baseURL: process.env.AUTH_BASEURL!,
    clientID: process.env.AUTH_CLIENTID!,
    issuerBaseURL: process.env.AUTH_ISSUER_BASEURL!,
  }
};
