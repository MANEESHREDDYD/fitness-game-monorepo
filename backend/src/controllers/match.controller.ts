import { Request, Response } from 'express';
import { query } from '../db';
import { createClient } from 'redis';

const redis = createClient({ url: process.env.REDIS_URL });
redis.connect().catch(console.error);

export const createMatch = async (req: any, res: Response) => {
    try {
        const { parkId, durationMinutes } = req.body;
        const userId = req.user.id;

        // Create match in Postgres
        const result = await query(
            `INSERT INTO matches (park_id, status, start_time, config)
       VALUES ($1, 'pending', NOW(), $2)
       RETURNING id`,
            [parkId, { durationMinutes, hostId: userId }]
        );
        const matchId = result.rows[0].id;

        // Initialize in Redis
        const matchState = {
            id: matchId,
            status: 'pending',
            parkId,
            hostId: userId,
            players: [userId],
            scores: { [userId]: 0 }
        };

        await redis.set(`match:${matchId}:state`, JSON.stringify(matchState));
        await redis.expire(`match:${matchId}:state`, 3600 * 2); // 2 hours TTL

        res.status(201).json({ matchId, state: matchState });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create match' });
    }
};

export const listMatches = async (req: Request, res: Response) => {
    try {
        const result = await query(`SELECT * FROM matches WHERE status = 'pending' OR status = 'active' ORDER BY start_time DESC LIMIT 10`);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: 'Failed to list matches' });
    }
};

export const getMatch = async (req: any, res: Response) => {
    try {
        const { matchId } = req.params;
        // Fetch match + zones
        // We use a subquery/join to get zones for the park
        const result = await query(`
            SELECT m.*, 
            (SELECT json_agg(z.*) FROM zones z WHERE z.park_id = m.park_id) as zones
            FROM matches m WHERE m.id = $1`, [matchId]);

        if (result.rows.length === 0) return res.status(404).json({ error: 'Match not found' });
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

export const joinMatch = async (req: any, res: Response) => {
    try {
        const { matchId } = req.params;
        const userId = req.user.id;

        const stateStr = await redis.get(`match:${matchId}:state`);
        if (!stateStr) {
            return res.status(404).json({ error: 'Match not found or expired' });
        }

        const state = JSON.parse(stateStr);
        if (!state.players.includes(userId)) {
            state.players.push(userId);
            state.scores[userId] = 0;
            await redis.set(`match:${matchId}:state`, JSON.stringify(state));
        }

        res.json(state);
    } catch (error) {
        res.status(500).json({ error: 'Failed to join match' });
    }
};
