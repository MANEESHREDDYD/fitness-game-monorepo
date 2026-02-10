import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { createClient } from 'redis';
import * as TelemetryService from './telemetry.service';
import { query } from '../db';
import { checkAntiCheat } from '../middleware/antiCheat.middleware';

const redis = createClient({ url: process.env.REDIS_URL });
redis.connect().catch(console.error);

const SECRET_KEY = process.env.JWT_SECRET || 'local-dev-secret';

export const initSocket = (io: Server) => {
    io.use((socket, next) => {
        const token = socket.handshake.auth.token;
        if (!token) return next(new Error('Authentication error'));

        try {
            const decoded = jwt.verify(token, SECRET_KEY);
            (socket as any).user = decoded;
            next();
        } catch (err) {
            next(new Error('Authentication error'));
        }
    });

    io.on('connection', (socket: Socket) => {
        const user = (socket as any).user;
        console.log(`User ${user.username} connected`);

        socket.on('join_match', async (matchId: string) => {
            socket.join(`match:${matchId}`);
            console.log(`User ${user.username} joined match ${matchId}`);
            socket.emit('joined', { matchId });
        });

        socket.on('location_update', async (data: { matchId: string, lat: number, lng: number, speed: number }) => {
            const { matchId, lat, lng, speed } = data;

            // 1. Anti-Cheat Validation
            const isClean = await checkAntiCheat(user.id, matchId, lat, lng, 1.0); // Default HDOP 1.0 for MVP
            if (!isClean) return; // Drop packet

            // 2. Store in Redis Telemetry List
            const log = {
                userId: user.id,
                lat,
                lng,
                speed,
                timestamp: new Date().toISOString()
            };
            await redis.rPush(`match:${matchId}:telemetry`, JSON.stringify(log));

            // 3. Broadcast to room (Optimized: maybe throttle this)
            socket.to(`match:${matchId}`).emit('opponent_location', { userId: user.id, lat, lng });

            // 4. Check Zone Capture via PostGIS with Atomic Transaction
            try {
                const matchStateStr = await redis.get(`match:${matchId}:state`);
                if (matchStateStr) {
                    const matchState = JSON.parse(matchStateStr);
                    const parkId = matchState.parkId;

                    // BEGIN Transaction
                    await query('BEGIN');

                    // Check if close to any zone in this park using FOR UPDATE SKIP LOCKED to prevent race conditions
                    const result = await query(
                        `SELECT id, name, team_color, owner_id FROM zones 
                         WHERE park_id = $1 
                         AND ST_DWithin(location, ST_GeogFromText($2), radius_meters)
                         FOR UPDATE SKIP LOCKED 
                         LIMIT 1`,
                        [parkId, `POINT(${lng} ${lat})`]
                    );

                    if (result.rows.length > 0) {
                        const zone = result.rows[0];

                        // Only capture if not already owned by SAME user
                        if (zone.owner_id !== user.id) {
                            console.log(`User ${user.username} capturing ${zone.name}...`);

                            // Update Zone Owner in DB
                            await query(`UPDATE zones SET owner_id = $1, team_color = 'RED' WHERE id = $2`, [user.id, zone.id]);

                            // COMMIT Transaction
                            await query('COMMIT');

                            // Update Score in Redis (Optimistic update)
                            // In a real app, we'd lock Redis or use Lua script, but DB is the source of truth here.
                            matchState.scores[user.id] = (matchState.scores[user.id] || 0) + 10;
                            await redis.set(`match:${matchId}:state`, JSON.stringify(matchState));

                            // Broadcast Capture
                            io.to(`match:${matchId}`).emit('zone_captured', {
                                userId: user.id,
                                zoneId: zone.id,
                                zoneName: zone.name,
                                newScore: matchState.scores[user.id]
                            });
                        } else {
                            await query('ROLLBACK');
                        }
                    } else {
                        await query('ROLLBACK');
                    }
                }
            } catch (err) {
                await query('ROLLBACK');
                console.error('Zone check check failed:', err);
            }
        });

        socket.on('end_match', async (matchId: string) => {
            // In real app, verify host
            io.to(`match:${matchId}`).emit('match_ended');
            await TelemetryService.flushMatchTelemetry(matchId);
        });

        socket.on('disconnect', () => {
            console.log(`User ${user.username} disconnected`);
        });
    });
};
