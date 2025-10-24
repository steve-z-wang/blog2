import { Request, Response, NextFunction } from 'express';
import { env } from '../../config/env';

export function requireApiKey(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.status(401).json({ error: 'Missing authorization header' });
    return;
  }

  const token = authHeader.replace('Bearer ', '');

  if (token === env.ADMIN_API_KEY) {
    next();
  } else {
    res.status(401).json({ error: 'Invalid API key' });
  }
}
