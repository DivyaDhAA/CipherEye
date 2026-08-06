import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'ciphereye_enterprise_secure_token_secret_key_2026_jwt';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

// JWT Authentication Middleware
export const authenticateJWT = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Access token required' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Malformed authorization token' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string; role: string };
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired access token' });
  }
};

// Optional JWT Authentication Middleware (Permits anonymous / background notification scans)
export const optionalAuthenticateJWT = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string; role: string };
        req.user = decoded;
      } catch (error) {
        // Token invalid or expired, proceed unauthenticated without blocking background scan
      }
    }
  }
  next();
};

// Role Authorization Middleware
export const requireRole = (allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized: User authentication required' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: `Forbidden: Requires role: ${allowedRoles.join(', ')}` });
    }

    next();
  };
};

// Simple In-Memory Rate Limiting
const rateLimitWindowMs = 15 * 60 * 1000; // 15 minutes
const maxRequestsPerWindow = 10000;
interface RateLimitData {
  count: number;
  resetTime: number;
}
const rateLimitStore: Record<string, RateLimitData> = {};

export const rateLimiter = (req: Request, res: Response, next: NextFunction) => {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();

  // Bypass rate limiting for localhost / 127.0.0.1 in development
  if (ip === '127.0.0.1' || ip === '::1' || ip === '::ffff:127.0.0.1' || ip === 'localhost') {
    return next();
  }

  if (!rateLimitStore[ip] || now > rateLimitStore[ip].resetTime) {
    rateLimitStore[ip] = {
      count: 1,
      resetTime: now + rateLimitWindowMs
    };
  } else {
    rateLimitStore[ip].count++;
  }

  if (rateLimitStore[ip].count > maxRequestsPerWindow) {
    return res.status(429).json({
      error: 'Too many requests. Please try again later.',
      retryAfter: Math.ceil((rateLimitStore[ip].resetTime - now) / 1000)
    });
  }

  next();
};

// Global Error Handler
export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  const timestamp = new Date().toISOString();
  const reqPath = `${req.method} ${req.originalUrl || req.url}`;
  
  // Check if error is a Prisma or Database error
  const isPrismaError = 
    err.name?.includes('Prisma') || 
    err.code?.startsWith('P') || 
    err.clientVersion || 
    (typeof err.message === 'string' && (err.message.includes('prisma') || err.message.includes('database') || err.message.includes('Can\'t reach database')));

  if (isPrismaError) {
    console.error(`[${timestamp}] DATABASE ERROR [${reqPath}] Code: ${err.code || 'PRISMA_ERR'} - ${err.message}`);
    if (err.stack) {
      console.error(`[${timestamp}] STACK: ${err.stack}`);
    }

    return res.status(503).json({
      success: false,
      message: 'Unable to connect to the database. Please try again later.',
      error: 'Unable to connect to the database. Please try again later.'
    });
  }

  // General Application Errors
  console.error(`[${timestamp}] SERVER ERROR [${reqPath}]`, err);

  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal Server Error';

  return res.status(statusCode).json({
    success: false,
    message: message,
    error: message
  });
};
