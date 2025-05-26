import { Request, Response, NextFunction } from 'express';

interface Auth0User {
  role?: string; // or 'roles' if you store multiple
  [key: string]: any;
}

export function authorizeRoles(allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = (req as any).user as Auth0User;

    if (!user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    const userRole = user.role;

    if (!userRole || !allowedRoles.includes(userRole)) {
      res.status(403).json({ message: 'Forbidden: Access denied' });
      return;
    }

    next();
  };
}
