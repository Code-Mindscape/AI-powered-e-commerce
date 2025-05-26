import jwt from 'jsonwebtoken';

export const generateAdminToken = (payload: string | object) => {
  const secret = process.env.ADMIN_JWT_SECRET;
  const expiresIn = process.env.ADMIN_JWT_EXPIRES_IN || '8h';

  if (!secret) {
    throw new Error('Missing ADMIN_JWT_SECRET environment variable');
  }

  return jwt.sign(payload, secret, { expiresIn:'8h' });
};

export const verifyAdminToken = (token: string) => {
  const secret = process.env.ADMIN_JWT_SECRET;
  if (!secret) return null;

  try {
    return jwt.verify(token, secret);
  } catch (e) {
    return null;
  }
};