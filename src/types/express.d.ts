// Extend Express Request to include user property
import { User } from './auth.types.js';

declare global {
  namespace Express {
    interface Request {
      user?: { id: string };
    }
  }
}

export {};
