import { io } from 'socket.io-client';
import axios from 'axios';

const API_URL = 'http://localhost:3000/api';
const SOCKET_URL = 'http://localhost:3000';

const PLAYERS = [
    { username: 'pro_player_1', email: 'pro1@test.com', type: 'honest' },
    { username: 'pro_player_2', email: 'pro2@test.com', type: 'honest' },
    { username: 'pro_player_3', email: 'pro3@test.com', type: 'honest' },
    { username: 'pro_player_4', email: 'pro4@test.com', type: 'honest' },
    { username: 'cheater_x',    email: 'cheat@test.com', type: 'cheater' }
];

async function main() {
    console.log('--- Starting Elite Simulation Loop ---');

    let matchId = '';
    const sockets: any[] = [];
    const tokens: string[] = [];

    // 1. Auth & Setup
    for (const p of PLAYERS) {
        try {
            let res;
            try {
                res = await axios.post(`${API_URL}/auth/signup`, { username: p.username, email: p.email, password: 'password123' });
            } catch (e) {
                res = await axios.post(`${API_URL}/auth/login`, { email: p.email, password: 'password123' });
            }
            tokens.push(res.data.token);
            console.log(`Logged in: ${p.username}`);
        } catch (err: any) {
            console.error(`Auth failed for ${p.username}`, err.message);
        }
    }

    if (tokens.length === 0) return;

    // 2. Host creates match (Player 1)
    try {
        const res = await axios.post(`${API_URL}/matches`, { parkId: 1, durationMinutes: 10 }, {
            headers: { Authorization: `Bearer ${tokens[0]}` }
        });
        matchId = res.data.matchId;
        console.log(`Match Created: ${matchId}`);
    } catch (err: any) {
        console.error('Match creation failed', err.message);
        return;
    }

    // 3. Connect Sockets & Join Match
    for (let i = 0; i < PLAYERS.length; i++) {
        const socket = io(SOCKET_URL, {
            auth: { token: tokens[i] }
        });
        
        socket.on('connect', () => {
            socket.emit('join_match', matchId);
        });

        socket.on('zone_captured', (data) => {
            console.log(`[EVENT] ${data.userId} captured ${data.zoneName}`);
        });

        // Add to array so we can close later
        sockets.push(socket);
    }

    // Wait for connection
    await new Promise(r => setTimeout(r, 1000));

    // 4. Simulate Movement Loop (10 iterations)
    console.log('--- Simulating Movement ---');
    
    let lat = 40.7829; 
    let lng = -73.9654;

    for (let step = 0; step < 10; step++) {
        await new Promise(r => setTimeout(r, 500)); // 0.5s interval

        PLAYERS.forEach((p, idx) => {
            const socket = sockets[idx];
            if (!socket.connected) return;
            
            if (p.type === 'honest') {
                const offset = (Math.random() - 0.5) * 0.0001;
                socket.emit('location_update', {
                    matchId,
                    lat: lat + offset + (idx * 0.001), 
                    lng: lng + offset + (idx * 0.001),
                    speed: 3
                });
            } else {
                const teleportOffset = step % 5 === 0 ? 0.05 : 0; 
                socket.emit('location_update', {
                    matchId,
                    lat: lat + teleportOffset,
                    lng: lng + teleportOffset,
                    speed: 200 
                });
                if (teleportOffset > 0) console.log(`>> Cheater ${p.username} tried to teleport!`);
            }
        });
    }

    console.log('--- Simulation Complete. Flushing Telemetry... ---');
    
    if (sockets.length > 0) {
        sockets[0].emit('end_match', matchId);
        // Wait for server to process flush
        await new Promise(r => setTimeout(r, 3000));
    }
    
    // Cleanup
    sockets.forEach(s => s.disconnect());
    process.exit(0);
}

main().catch(console.error);
