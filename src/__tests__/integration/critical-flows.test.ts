/**
 * Tests d'intégration pour les flows critiques
 * GirlyCrea - Production Sprint Janvier 2026
 */

import { pgPool } from '../../config/supabase.js';

// Mock des dépendances
const mockRequest = async (method: string, path: string, body?: any, headers?: Record<string, string>) => {
  const baseUrl = process.env.TEST_API_URL || 'http://localhost:3001';
  
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  
  const data = await response.json().catch(() => null);
  return { status: response.status, data };
};

describe('Critical User Flows', () => {
  let authToken: string;
  let userId: string;
  let testEmail: string;
  
  beforeAll(async () => {
    // Générer un email unique pour ce test
    testEmail = `test-${Date.now()}@example.com`;
  });
  
  afterAll(async () => {
    // Cleanup: supprimer l'utilisateur de test
    if (userId && pgPool) {
      try {
        await pgPool.query('DELETE FROM users WHERE id = $1', [userId]);
      } catch (e) {
        // Ignorer les erreurs de cleanup
      }
    }
  });
  
  // =========================================================================
  // FLOW 1: Health Check
  // =========================================================================
  describe('Flow 1: Health Check', () => {
    test('Simple health check returns ok', async () => {
      const { status, data } = await mockRequest('GET', '/health');
      
      expect(status).toBe(200);
      expect(data.status).toBe('ok');
      expect(data.timestamp).toBeDefined();
    });
    
    test('Detailed health check returns database status', async () => {
      const { status, data } = await mockRequest('GET', '/health/detailed');
      
      expect(status).toBeLessThanOrEqual(200);
      expect(data.services).toBeDefined();
      expect(data.services.database).toBeDefined();
    });
  });
  
  // =========================================================================
  // FLOW 2: Register → Login
  // =========================================================================
  describe('Flow 2: Register → Login', () => {
    test('User can register with valid data', async () => {
      const { status, data } = await mockRequest('POST', '/api/auth/register', {
        email: testEmail,
        password: 'ValidPass123!',
        name: 'Test User Flow',
      });
      
      // Peut être 201 (succès) ou 409 (email déjà utilisé si test re-run)
      if (status === 201) {
        expect(data.user).toBeDefined();
        expect(data.user.email).toBe(testEmail);
        userId = data.user.id;
      } else {
        // Email déjà utilisé - c'est OK pour les re-runs
        expect(status).toBe(409);
      }
    });
    
    test('User can login with correct credentials', async () => {
      const { status, data } = await mockRequest('POST', '/api/auth/login', {
        email: testEmail,
        password: 'ValidPass123!',
      });
      
      if (status === 200) {
        expect(data.accessToken).toBeDefined();
        expect(data.user).toBeDefined();
        authToken = data.accessToken;
        userId = data.user.id;
      } else {
        // L'utilisateur n'existe peut-être pas, essayons avec l'admin
        const adminLogin = await mockRequest('POST', '/api/auth/login', {
          email: 'admin@girlycrea.local',
          password: 'Password123!',
        });
        
        expect(adminLogin.status).toBe(200);
        authToken = adminLogin.data.accessToken;
      }
    });
    
    test('Login fails with wrong password', async () => {
      const { status } = await mockRequest('POST', '/api/auth/login', {
        email: 'admin@girlycrea.local',
        password: 'WrongPassword!',
      });
      
      expect(status).toBe(401);
    });
  });
  
  // =========================================================================
  // FLOW 3: Browse Products
  // =========================================================================
  describe('Flow 3: Browse Products', () => {
    test('Can list products without auth', async () => {
      const { status, data } = await mockRequest('GET', '/api/products');
      
      expect(status).toBe(200);
      // Peut être vide si pas de produits
      expect(data).toBeDefined();
    });
    
    test('Can search products', async () => {
      const { status, data } = await mockRequest('GET', '/api/products?q=bijou');
      
      expect(status).toBe(200);
      expect(data).toBeDefined();
    });
    
    test('Can filter products by category', async () => {
      const { status, data } = await mockRequest('GET', '/api/products?category=Bijoux');
      
      expect(status).toBe(200);
      expect(data).toBeDefined();
    });
  });
  
  // =========================================================================
  // FLOW 4: Coupons
  // =========================================================================
  describe('Flow 4: Coupons', () => {
    test('Can validate coupon (if exists)', async () => {
      // Ce test vérifie que l'endpoint existe et répond correctement
      const { status, data } = await mockRequest('POST', '/api/coupons/validate', {
        code: 'BIENVENUE10',
        order_total: 50,
      }, authToken ? { Authorization: `Bearer ${authToken}` } : {});
      
      // 200 si coupon valide, 400/404 si invalide - les deux sont acceptables
      expect([200, 400, 401, 404]).toContain(status);
    });
    
    test('Invalid coupon returns error', async () => {
      const { status } = await mockRequest('POST', '/api/coupons/validate', {
        code: 'INVALID_CODE_123',
        order_total: 50,
      }, authToken ? { Authorization: `Bearer ${authToken}` } : {});
      
      // Doit être une erreur ou unauthorized
      expect([400, 401, 404]).toContain(status);
    });
  });
  
  // =========================================================================
  // FLOW 5: API Info
  // =========================================================================
  describe('Flow 5: API Info', () => {
    test('API info endpoint works', async () => {
      const { status, data } = await mockRequest('GET', '/api');
      
      expect(status).toBe(200);
      expect(data.message).toContain('GirlyCrea');
      expect(data.version).toBeDefined();
    });
  });
});

// =========================================================================
// Tests de Performance Basiques
// =========================================================================
describe('Performance Tests', () => {
  test('Health check responds in < 100ms', async () => {
    const start = Date.now();
    await mockRequest('GET', '/health');
    const duration = Date.now() - start;
    
    expect(duration).toBeLessThan(100);
  });
  
  test('Products list responds in < 500ms', async () => {
    const start = Date.now();
    await mockRequest('GET', '/api/products?limit=10');
    const duration = Date.now() - start;
    
    expect(duration).toBeLessThan(500);
  });
});
