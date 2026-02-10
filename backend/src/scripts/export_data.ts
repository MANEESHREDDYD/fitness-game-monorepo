/**
 * Data Export Script
 * 
 * Generates clean_dataset.csv for downstream ML (Churn Prediction).
 * Connects to PostgreSQL via DATABASE_URL env var.
 * 
 * Usage: npx ts-node src/scripts/export_data.ts
 */
import dotenv from 'dotenv';
dotenv.config();

import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function main() {
    console.log('--- Starting Data Export ---');
    console.log(`DB URL: ${process.env.DATABASE_URL ? '✓ Set' : '✗ NOT SET'}`);

    const client = await pool.connect();

    try {
        const result = await client.query(`
            WITH user_stats AS (
                SELECT 
                    u.id,
                    u.username,
                    COUNT(DISTINCT t.match_id) as matches_played,
                    COALESCE(ROUND(AVG(t.speed_mph), 2), 0) as avg_speed,
                    MAX(t.timestamp) as last_active,
                    (SELECT COUNT(*) FROM zones z WHERE z.owner_id = u.id) as zones_owned,
                    (SELECT COUNT(*) FROM suspicious_activity sa WHERE sa.user_id = u.id) as cheat_flags
                FROM users u
                LEFT JOIN telemetry t ON u.id = t.user_id
                GROUP BY u.id
            )
            SELECT 
                id,
                username,
                matches_played,
                avg_speed,
                zones_owned,
                cheat_flags,
                last_active,
                CASE 
                    WHEN last_active IS NULL THEN 1
                    WHEN last_active < NOW() - INTERVAL '7 days' THEN 1 
                    ELSE 0 
                END as is_churned
            FROM user_stats
            ORDER BY id
        `);

        if (result.rows.length === 0) {
            console.log('No data found.');
            return;
        }

        // CSV Generation
        const header = Object.keys(result.rows[0]).join(',') + '\n';
        const rows = result.rows
            .map((row) =>
                Object.values(row)
                    .map((v) => (v === null ? '' : String(v)))
                    .join(',')
            )
            .join('\n');

        const outputPath = path.resolve(__dirname, '../../clean_dataset.csv');
        fs.writeFileSync(outputPath, header + rows);

        console.log(`✓ Exported ${result.rows.length} rows to ${outputPath}`);
        console.log('\nSample:');
        console.log(header + result.rows.slice(0, 3).map(r => Object.values(r).join(',')).join('\n'));
    } catch (err: any) {
        console.error('Export failed:', err.message);
    } finally {
        client.release();
        await pool.end();
    }
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
