import axios from 'axios';

const API_URL = 'http://localhost:3000';

describe('Backend API Tests - Match Management', () => {
  // ===== HEALTH ENDPOINT TESTS =====
  describe('Health Check Endpoint', () => {
    test('Test 1: Health endpoint returns 200 status', async () => {
      const response = await axios.get(`${API_URL}/health`);
      expect(response.status).toBe(200);
    });

    test('Test 2: Health endpoint returns valid JSON', async () => {
      const response = await axios.get(`${API_URL}/health`);
      expect(typeof response.data).toBe('object');
    });

    test('Test 3: Health endpoint returns status = ok', async () => {
      const response = await axios.get(`${API_URL}/health`);
      expect(response.data.status).toBe('ok');
    });

    test('Test 4: Health endpoint response time < 100ms', async () => {
      const start = Date.now();
      await axios.get(`${API_URL}/health`);
      const latency = Date.now() - start;
      expect(latency).toBeLessThan(100);
    });

    test('Test 5: Health endpoint has valid headers', async () => {
      const response = await axios.get(`${API_URL}/health`);
      expect(response.headers['content-type']).toContain('application/json');
    });
  });

  // ===== MATCH CREATION TESTS =====
  describe('Match Creation Endpoint', () => {
    test('Test 6: Create match returns 200 status', async () => {
      const response = await axios.post(`${API_URL}/api/matches`, {
        creatorId: 'user123',
        maxPlayers: 8,
        duration: 1800,
        parkId: 'central-park',
      });
      expect(response.status).toBe(200);
    });

    test('Test 7: Create match returns match object', async () => {
      const response = await axios.post(`${API_URL}/api/matches`, {
        creatorId: 'user123',
        maxPlayers: 8,
        duration: 1800,
        parkId: 'central-park',
      });
      expect(response.data).toHaveProperty('id');
      expect(response.data).toHaveProperty('code');
    });

    test('Test 8: Generated match code is 6 characters', async () => {
      const response = await axios.post(`${API_URL}/api/matches`, {
        creatorId: 'user123',
        maxPlayers: 8,
        duration: 1800,
        parkId: 'central-park',
      });
      expect(response.data.code).toMatch(/^[A-Z0-9]{6}$/);
    });

    test('Test 9: Match has correct creator', async () => {
      const response = await axios.post(`${API_URL}/api/matches`, {
        creatorId: 'user123',
        maxPlayers: 8,
        duration: 1800,
        parkId: 'central-park',
      });
      expect(response.data.creatorId).toBe('user123');
    });

    test('Test 10: Match has correct player count', async () => {
      const response = await axios.post(`${API_URL}/api/matches`, {
        creatorId: 'user123',
        maxPlayers: 8,
        duration: 1800,
        parkId: 'central-park',
      });
      expect(response.data.maxPlayers).toBe(8);
    });

    test('Test 11: Match has correct duration', async () => {
      const response = await axios.post(`${API_URL}/api/matches`, {
        creatorId: 'user123',
        maxPlayers: 30,
        duration: 3600,
        parkId: 'central-park',
      });
      expect(response.data.duration).toBe(3600);
    });

    test('Test 12: Match status is waiting', async () => {
      const response = await axios.post(`${API_URL}/api/matches`, {
        creatorId: 'user123',
        maxPlayers: 8,
        duration: 1800,
        parkId: 'central-park',
      });
      expect(response.data.status).toBe('waiting');
    });

    test('Test 13: Match has timestamp', async () => {
      const response = await axios.post(`${API_URL}/api/matches`, {
        creatorId: 'user123',
        maxPlayers: 8,
        duration: 1800,
        parkId: 'central-park',
      });
      expect(response.data.startTime).toBeDefined();
    });

    test('Test 14: Create match with max 50 players', async () => {
      const response = await axios.post(`${API_URL}/api/matches`, {
        creatorId: 'user123',
        maxPlayers: 50,
        duration: 1800,
        parkId: 'central-park',
      });
      expect(response.data.maxPlayers).toBe(50);
    });

    test('Test 15: Create match with min 2 players', async () => {
      const response = await axios.post(`${API_URL}/api/matches`, {
        creatorId: 'user123',
        maxPlayers: 2,
        duration: 1800,
        parkId: 'central-park',
      });
      expect(response.data.maxPlayers).toBe(2);
    });

    test('Test 16: Match has unique code each time', async () => {
      const response1 = await axios.post(`${API_URL}/api/matches`, {
        creatorId: 'user123',
        maxPlayers: 8,
        duration: 1800,
        parkId: 'central-park',
      });
      const response2 = await axios.post(`${API_URL}/api/matches`, {
        creatorId: 'user456',
        maxPlayers: 8,
        duration: 1800,
        parkId: 'central-park',
      });
      expect(response1.data.code).not.toBe(response2.data.code);
    });
  });

  // ===== JOIN MATCH TESTS =====
  describe('Join Match Endpoint', () => {
    test('Test 17: Join match by code returns 200', async () => {
      const createRes = await axios.post(`${API_URL}/api/matches`, {
        creatorId: 'user123',
        maxPlayers: 8,
        duration: 1800,
        parkId: 'central-park',
      });
      const code = createRes.data.code;

      const joinRes = await axios.post(`${API_URL}/api/matches/join-by-code`, {
        code,
        playerId: 'user456',
      });
      expect(joinRes.status).toBe(200);
    });

    test('Test 18: Join response confirms player added', async () => {
      const createRes = await axios.post(`${API_URL}/api/matches`, {
        creatorId: 'user123',
        maxPlayers: 8,
        duration: 1800,
        parkId: 'central-park',
      });
      const code = createRes.data.code;

      const joinRes = await axios.post(`${API_URL}/api/matches/join-by-code`, {
        code,
        playerId: 'user456',
      });
      expect(joinRes.data.success).toBe(true);
    });

    test('Test 19: Join updates player count', async () => {
      const createRes = await axios.post(`${API_URL}/api/matches`, {
        creatorId: 'user123',
        maxPlayers: 8,
        duration: 1800,
        parkId: 'central-park',
      });

      const joinRes = await axios.post(`${API_URL}/api/matches/join-by-code`, {
        code: createRes.data.code,
        playerId: 'user456',
      });
      expect(joinRes.data.playerCount).toBeGreaterThan(0);
    });

    test('Test 20: Cannot exceed max capacity', async () => {
      const createRes = await axios.post(`${API_URL}/api/matches`, {
        creatorId: 'user123',
        maxPlayers: 2,
        duration: 1800,
        parkId: 'central-park',
      });

      await axios.post(`${API_URL}/api/matches/join-by-code`, {
        code: createRes.data.code,
        playerId: 'user456',
      });

      try {
        await axios.post(`${API_URL}/api/matches/join-by-code`, {
          code: createRes.data.code,
          playerId: 'user789',
        });
      } catch (error: any) {
        expect(error.response.status).toBe(400);
      }
    });
  });

  // ===== ZONE CAPTURE TESTS =====
  describe('Zone Capture Endpoint', () => {
    test('Test 21: Capture zone returns 200 status', async () => {
      const matchRes = await axios.post(`${API_URL}/api/matches`, {
        creatorId: 'user123',
        maxPlayers: 8,
        duration: 1800,
        parkId: 'central-park',
      });

      const response = await axios.post(
        `${API_URL}/api/matches/${matchRes.data.id}/capture-zone`,
        {
          zoneId: 'zone-1',
          playerId: 'user123',
        }
      );
      expect(response.status).toBe(200);
    });

    test('Test 22: Zone capture awards points', async () => {
      const matchRes = await axios.post(`${API_URL}/api/matches`, {
        creatorId: 'user123',
        maxPlayers: 8,
        duration: 1800,
        parkId: 'central-park',
      });

      const response = await axios.post(
        `${API_URL}/api/matches/${matchRes.data.id}/capture-zone`,
        {
          zoneId: 'zone-1',
          playerId: 'user123',
        }
      );
      expect(response.data.points).toBeGreaterThan(0);
    });

    test('Test 23: Zone capture has countdown timer', async () => {
      const matchRes = await axios.post(`${API_URL}/api/matches`, {
        creatorId: 'user123',
        maxPlayers: 8,
        duration: 1800,
        parkId: 'central-park',
      });

      const response = await axios.post(
        `${API_URL}/api/matches/${matchRes.data.id}/capture-zone`,
        {
          zoneId: 'zone-1',
          playerId: 'user123',
        }
      );
      expect(response.data.countdown).toBeDefined();
      expect(response.data.countdown).toBeGreaterThan(0);
    });
  });

  // ===== USER ENDPOINT TESTS =====
  describe('Users Endpoint', () => {
    test('Test 24: Get users returns 200 status', async () => {
      const response = await axios.get(`${API_URL}/api/users`);
      expect(response.status).toBe(200);
    });

    test('Test 25: Get users returns array', async () => {
      const response = await axios.get(`${API_URL}/api/users`);
      expect(Array.isArray(response.data)).toBe(true);
    });
  });

  // ===== PARKS ENDPOINT TESTS =====
  describe('Parks Endpoint', () => {
    test('Test 26: Get parks returns 200 status', async () => {
      const response = await axios.get(`${API_URL}/api/parks`);
      expect(response.status).toBe(200);
    });

    test('Test 27: Get parks returns array', async () => {
      const response = await axios.get(`${API_URL}/api/parks`);
      expect(Array.isArray(response.data)).toBe(true);
    });
  });

  // ===== ERROR HANDLING TESTS =====
  describe('Error Handling', () => {
    test('Test 28: Invalid match code returns error', async () => {
      try {
        await axios.post(`${API_URL}/api/matches/join-by-code`, {
          code: 'INVALID',
          playerId: 'user123',
        });
      } catch (error: any) {
        expect(error.response.status).toBeGreaterThanOrEqual(400);
      }
    });

    test('Test 29: Missing required fields returns error', async () => {
      try {
        await axios.post(`${API_URL}/api/matches`, {
          creatorId: 'user123',
          // missing other required fields
        });
      } catch (error: any) {
        expect(error.response.status).toBeGreaterThanOrEqual(400);
      }
    });
  });

  // ===== PERFORMANCE TESTS =====
  describe('Performance', () => {
    test('Test 30: API responds under 500ms', async () => {
      const start = Date.now();
      await axios.post(`${API_URL}/api/matches`, {
        creatorId: 'user123',
        maxPlayers: 8,
        duration: 1800,
        parkId: 'central-park',
      });
      const latency = Date.now() - start;
      expect(latency).toBeLessThan(500);
    });
  });
});
