import { Router, Request, Response } from 'express';
import * as AuthController from '../controllers/auth.controller';
import { authenticateCallback } from '../middleware/auth.middleware';
import * as MatchController from '../controllers/match.controller';
import { query } from '../db';

const router = Router();

// Auth
router.post('/auth/signup', AuthController.signup);
router.post('/auth/login', AuthController.login);

// Matches
router.post('/matches', authenticateCallback, MatchController.createMatch);
router.get('/matches', authenticateCallback, MatchController.listMatches);
router.get('/matches/:matchId', authenticateCallback, MatchController.getMatch);
router.post('/matches/:matchId/join', authenticateCallback, MatchController.joinMatch);

// Parks - Voronoi Territories
router.get('/parks/:parkId/territories', authenticateCallback, async (req: Request, res: Response) => {
    try {
        const { parkId } = req.params;
        const result = await query(`
            SELECT park_id, park_name, ST_AsGeoJSON(territory) as territory_geojson
            FROM v_park_territories
            WHERE park_id = $1
        `, [parkId]);

        const territories = result.rows.map((r: any) => ({
            park_id: r.park_id,
            park_name: r.park_name,
            territory: JSON.parse(r.territory_geojson),
        }));
        res.json(territories);
    } catch (err: any) {
        console.error('[Territories]', err.message);
        res.json([]); // Graceful degradation
    }
});

// Analytics - User Profile
router.get('/users/:userId/profile', authenticateCallback, async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const result = await query(`SELECT * FROM v_user_profiles WHERE id = $1`, [userId]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
        res.json(result.rows[0]);
    } catch (err: any) {
        console.error('[Profile]', err.message);
        res.status(500).json({ error: 'Server error' });
    }
});

// System Health
router.get('/system/health', async (_req: Request, res: Response) => {
    try {
        const result = await query(`SELECT * FROM v_system_health`);
        res.json({
            status: 'ok',
            service: 'fitness-backend',
            matches: result.rows,
        });
    } catch (err: any) {
        res.json({ status: 'ok', service: 'fitness-backend', matches: [] });
    }
});

// Suspicious Activity Report
router.get('/admin/suspicious', authenticateCallback, async (_req: Request, res: Response) => {
    try {
        const result = await query(`SELECT * FROM suspicious_activity ORDER BY timestamp DESC LIMIT 50`);
        res.json(result.rows);
    } catch (err: any) {
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
