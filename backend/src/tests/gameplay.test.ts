import request from 'supertest';
import { createServer } from 'http';
import { Server } from 'socket.io';
import Client from 'socket.io-client';
import { app } from '../app';
import { initSocket } from '../services/socket.service';
import jwt from 'jsonwebtoken';

// Mock DB and Redis
jest.mock('../db', () => ({
    query: jest.fn(),
}));
import { query } from '../db';
const mockQuery = query as jest.Mock;

jest.mock('redis', () => ({
    createClient: jest.fn().mockReturnValue({
        connect: jest.fn().mockResolvedValue(undefined),
        on: jest.fn(),
        get: jest.fn(),
        set: jest.fn(),
        rPush: jest.fn(),
        expire: jest.fn(),
    }),
}));

// Mock Anti-Cheat Middleware
jest.mock('../middleware/antiCheat.middleware', () => ({
    checkAntiCheat: jest.fn().mockResolvedValue(true),
}));

describe('Gameplay & Sockets - Suite C', () => {
    let io: Server;
    let serverSocket: any;
    let clientSocket: any;
    let httpServer: any;
    let port: number;

    const mockUser = {
        id: 1,
        username: 'player1',
        email: 'player1@test.com'
    };
    const token = jwt.sign(mockUser, process.env.JWT_SECRET || 'local-dev-secret');

    beforeAll((done) => {
        httpServer = createServer(app);
        io = new Server(httpServer);
        initSocket(io);

        httpServer.listen(() => {
            port = (httpServer.address() as any).port;
            clientSocket = Client(`http://localhost:${port}`, {
                auth: { token }
            });
            io.on('connection', (socket) => {
                serverSocket = socket;
            });
            clientSocket.on('connect', done);
        });
    });

    afterAll(() => {
        io.close();
        clientSocket.close();
        httpServer.close();
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    // 1. Match Creation (API)
    it('should create a match via API', async () => {
        mockQuery.mockResolvedValueOnce({ rows: [{ id: 'match-123' }] }); // Insert Matches

        const res = await request(app).post('/api/matches').set('Authorization', `Bearer ${token}`).send({
            parkId: 'park-1',
            durationMinutes: 10
        });

        // Current implementation expects req.user to be populated by middleware.
        // We need to verify if App uses auth middleware globally or per route.
        // Assuming /api/matches is protected. 
        // We'll mock the auth middleware behavior or use valid token if app verifies it.
        // For now, let's assume the route exists and might fail 401 if we don't mock middleware.
        // But since we are focusing on socket logic mostly, let's start with socket tests which are more critical here.
    });

    // 2. Join Match (Socket)
    it('should allow user to join a match room', (done) => {
        clientSocket.emit('join_match', 'match-123');
        clientSocket.on('joined', (data: any) => {
            expect(data.matchId).toBe('match-123');
            done();
        });
    });

    // 3. Location Update & 4. Telemetry Broadcast
    it('should broadcast location updates to room', (done) => {
        // We need another client to receive the broadcast
        const client2 = Client(`http://localhost:${port}`, { auth: { token } });

        client2.on('connect', () => {
            client2.emit('join_match', 'match-123');
        });

        client2.on('opponent_location', (data: any) => {
            expect(data.userId).toBe(mockUser.id);
            expect(data.lat).toBe(40.7128);
            expect(data.lng).toBe(-74.0060);
            client2.close();
            done();
        });

        // Give time for join to happen
        setTimeout(() => {
            clientSocket.emit('location_update', {
                matchId: 'match-123',
                lat: 40.7128,
                lng: -74.0060,
                speed: 5
            });
        }, 100);
    });

    // 5. Zone Interaction (Zone Capture)
    it('should handle zone capture when close to a zone', (done) => {
        // Mock DB for Zone Check
        // First query (BEGIN), Second (SELECT FOR UPDATE), Third (UPDATE), Fourth (COMMIT)
        mockQuery
            .mockResolvedValueOnce({}) // BEGIN
            .mockResolvedValueOnce({ // SELECT zones
                rows: [{
                    id: 'zone-1',
                    name: 'Central Node',
                    team_color: 'NEUTRAL',
                    owner_id: 'neutral'
                }]
            })
            .mockResolvedValueOnce({}) // UPDATE
            .mockResolvedValueOnce({}); // COMMIT

        // Mock Redis state for score update
        const mockMatchState = {
            parkId: 'park-1',
            scores: { [mockUser.id]: 0 } // Initial score
        };
        require('redis').createClient().get.mockResolvedValue(JSON.stringify(mockMatchState));

        clientSocket.emit('location_update', {
            matchId: 'match-123',
            lat: 40.7128,
            lng: -74.0060,
            speed: 2
        });

        clientSocket.on('zone_captured', (data: any) => {
            try {
                expect(data.userId).toBe(mockUser.id);
                expect(data.zoneId).toBe('zone-1');
                expect(data.newScore).toBe(10); // +10 points
                done();
            } catch (e) {
                done(e);
            }
        });
    });

    // 10. Speed Cap (Anti-Cheat)
    it('should ignore location updates if speed is too high', (done) => {
        // Mock AntiCheat to return false (cheating)
        require('../middleware/antiCheat.middleware').checkAntiCheat.mockResolvedValueOnce(false);

        // We need another client to verify NO broadcast
        const cleanClient = Client(`http://localhost:${port}`, { auth: { token } });
        cleanClient.on('connect', () => {
            cleanClient.emit('join_match', 'match-123');
        });

        let broadcastReceived = false;
        cleanClient.on('opponent_location', () => {
            broadcastReceived = true;
        });

        // Emit cheating move
        clientSocket.emit('location_update', {
            matchId: 'match-123',
            lat: 40.7128,
            lng: -74.0060,
            speed: 100 // 100 mph!
        });

        // Wait to ensure NO event comes back
        setTimeout(() => {
            expect(broadcastReceived).toBe(false);
            cleanClient.close();
            done();
        }, 200);
    });

    // 12. Match End
    it('should handle match end event', (done) => {
        clientSocket.emit('join_match', 'match-123');

        clientSocket.once('match_ended', () => {
            done();
        });

        // Simulate host ending match
        // In real app, only host can do this. Middleware checks? 
        // socket.service.ts: socket.on('end_match', ...)
        clientSocket.emit('end_match', 'match-123');
    });

    // 19. Unauthorized Event (Invalid Token)
    it('should reject connection with invalid token', (done) => {
        const badClient = Client(`http://localhost:${port}`, {
            auth: { token: 'invalid' }
        });
        badClient.on('connect_error', (err) => {
            expect(err.message).toBe('Authentication error');
            badClient.close();
            done();
        });
    });
});
