import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

// Note: To prevent test concurrency issues, we can run them against a test db or mock.
// Since Jest will run this, we can run it against the database or import the app.
// For the test runner, we will mock the database and server requests.

const mockUser = {
  id: 'test-user-uuid',
  email: 'test@example.com',
  username: 'testuser',
  password: 'hashedpassword',
  role: 'User',
  emailVerified: true
};

const mockReport = {
  id: 'test-report-uuid',
  userId: 'test-user-uuid',
  type: 'URL',
  inputData: 'https://example.com',
  threatScore: 12,
  riskLevel: 'Safe',
  confidence: 94.5
};

jest.mock('@prisma/client', () => {
  const mPrisma = {
    user: {
      findFirst: jest.fn().mockImplementation(() => Promise.resolve(mockUser)),
      findUnique: jest.fn().mockImplementation(() => Promise.resolve(mockUser)),
      create: jest.fn().mockImplementation(() => Promise.resolve(mockUser)),
      update: jest.fn().mockImplementation(() => Promise.resolve(mockUser))
    },
    threatReport: {
      create: jest.fn().mockImplementation(() => Promise.resolve(mockReport)),
      findMany: jest.fn().mockImplementation(() => Promise.resolve([mockReport])),
      update: jest.fn().mockImplementation(() => Promise.resolve(mockReport))
    },
    auditLog: {
      create: jest.fn().mockImplementation(() => Promise.resolve({}))
    },
    refreshToken: {
      create: jest.fn().mockImplementation(() => Promise.resolve({}))
    }
  };
  return { PrismaClient: jest.fn().mockImplementation(() => mPrisma) };
});

import { app } from './server';

describe('CipherEye Backend API Suite', () => {
  it('should pass a basic sanity check', () => {
    expect(true).toBe(true);
  });
  
  it('should generate valid JWT tokens', () => {
    const payload = { id: '123', email: 'test@ciphereye.com', role: 'User' };
    const token = jwt.sign(payload, 'test_secret', { expiresIn: '1h' });
    const decoded = jwt.verify(token, 'test_secret') as any;
    expect(decoded.email).toBe('test@ciphereye.com');
    expect(decoded.role).toBe('User');
  });

  it('should return error 400 for empty login credentials', async () => {
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({ username: '', password: '' });
    expect(response.status).toBe(400);
  });

  it('should handle logout endpoint cleanly', async () => {
    const response = await request(app)
      .post('/api/v1/auth/logout')
      .send({});
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Logged out successfully');
  });
});
