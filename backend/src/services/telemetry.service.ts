import { query } from '../db';
import { createClient } from 'redis';

const redis = createClient({ url: process.env.REDIS_URL });
redis.connect().catch(console.error);

export const flushMatchTelemetry = async (matchId: string) => {
    console.log(`Flushing telemetry for match ${matchId}...`);

    try {
        // 1. Fetch all telemetry from Redis Stream or List
        // Assuming simple List for MVP: match:{id}:telemetry
        const key = `match:${matchId}:telemetry`;
        const logs = await redis.lRange(key, 0, -1);

        if (logs.length === 0) {
            console.log('No telemetry to flush.');
            return;
        }

        // 2. Format for Bulk Insert
        // logs are JSON strings: { userId, lat, lng, speed, timestamp }
        const values: any[] = [];
        const placeholders: string[] = [];

        logs.forEach((logStr, index) => {
            const log = JSON.parse(logStr);
            // ($1, $2, ST_GeogFromText($3), $4, $5), ...
            const offset = index * 5;
            values.push(log.userId, matchId, `POINT(${log.lng} ${log.lat})`, log.speed, log.timestamp);
            // place holders
        });

        // Construct big query or use pg-format (omitted for speed, doing loop or batch)
        // Simple loop for MVP safety (or chunked)
        for (const logStr of logs) {
            const log = JSON.parse(logStr);
            await query(
                `INSERT INTO telemetry (user_id, match_id, location, speed_mph, timestamp)
             VALUES ($1, $2, ST_GeogFromText($3), $4, $5)`,
                [log.userId, matchId, `POINT(${log.lng} ${log.lat})`, log.speed, log.timestamp]
            );
        }

        console.log(`Flushed ${logs.length} records to Postgres.`);

        // 3. Mark match as completed in DB
        await query(`UPDATE matches SET status = 'completed', end_time = NOW() WHERE id = $1`, [matchId]);

        // 4. Cleanup Redis
        await redis.del(key);
        await redis.del(`match:${matchId}:state`);

    } catch (error) {
        console.error('Failed to flush telemetry:', error);
    }
};
