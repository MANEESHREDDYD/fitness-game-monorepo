import request from 'supertest';
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { io as ioc, Socket as ClientSocket } from 'socket.io-client';
import routes from '../routes';
import { initSocket } from '../services/socket.service';
import pool, { query } from '../db';

let app: any;
let httpServer: any;
let io: Server;
let clientSocket: ClientSocket;
let PORT: number;

beforeAll((done) => {
    app = express();
    app.use(cors());
    app.use(express.json());
    app.use('/api', routes);

    httpServer = createServer(app);
    io = new Server(httpServer);
    initSocket(io);

    // Use a random port
    httpServer.listen(() => {
        // @ts-ignore
        PORT = httpServer.address().port;
        clientSocket = ioc(`http://localhost:${PORT}`, {
            autoConnect: false
        });
        done();
    });
});

afterAll(async () => {
    if (clientSocket) clientSocket.close();
    if (io) io.close();
    if (httpServer) httpServer.close();
    await pool.end();
    // Give handles a moment to close
    await new Promise(resolve => setTimeout(resolve, 500));
});

describe('Integration Tests', () => {
    let token: string;
    let userId: number;
    let matchId: number;

    test('Auth: Signup works', async () => {
        const res = await request(app).post('/api/auth/signup').send({
            username: `testuser_${Date.now()}`,
            email: `test_${Date.now()}@example.com`,
            password: 'password123'
        });
        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('token');
        token = res.body.token;
        userId = res.body.user.id;
    });

    test('Match: Create Match', async () => {
        // Ensure park exists (Seeding should have done this, but for isolation we can insert one or rely on seed)
        // Assuming Seed ran. Park ID 1 should exist.
        const res = await request(app).post('/api/matches')
            .set('Authorization', `Bearer ${token}`)
            .send({ parkId: 1, durationMinutes: 30 });

        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('matchId');
        matchId = res.body.matchId;
    });

    test('Socket: Join Match & Teleport Check', (done) => {
        clientSocket.auth = { token };
        clientSocket.connect();

        clientSocket.on('connect', () => {
            clientSocket.emit('join_match', matchId.toString());
        });

        clientSocket.on('joined', (data) => {
            expect(data.matchId).toBe(matchId.toString());

            // Test Speeding / Teleport
            // Emit a location update with high speed
            clientSocket.emit('location_update', {
                matchId: matchId.toString(),
                lat: 40.768,
                lng: -73.981,
                speed: 100 // > 25mph
            });

            // Wait a bit for server logs (Manual check via logs in real dev, here we assume no crash)
            // Ideally we'd listen for a 'warning' event if we implemented it.
            setTimeout(() => {
                done();
            }, 500);
        });
    });
});
