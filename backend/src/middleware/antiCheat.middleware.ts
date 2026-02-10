import { createClient } from 'redis';
import { query } from '../db';

const redis = createClient({ url: process.env.REDIS_URL });
redis.connect().catch(console.error);

const SPEED_THRESHOLD_MPH = 25;
const HDOP_THRESHOLD = 4.0;

// Haversine formula for distance in miles
function getDistanceFromLatLonInMiles(lat1: number, lon1: number, lat2: number, lon2: number) {
    var R = 3958.8; // Radius of the earth in miles
    var dLat = deg2rad(lat2 - lat1);  // deg2rad below
    var dLon = deg2rad(lon2 - lon1);
    var a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2)
        ;
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c; // Distance in miles
    return d;
}

function deg2rad(deg: number) {
    return deg * (Math.PI / 180)
}

export const checkAntiCheat = async (userId: string, matchId: string, lat: number, lng: number, hdop: number = 1.0, timestamp: number = Date.now()): Promise<boolean> => {
    // 1. HDOP Check (Signal Quality)
    if (hdop > HDOP_THRESHOLD) {
        console.warn(`AntiCheat: User ${userId} flagged for poor signal (HDOP: ${hdop})`);
        await logSuspiciousActivity(userId, matchId, 'GPS Drift', { hdop, lat, lng });
        return false; // Reject
    }

    // 2. Speed Check (Teleportation)
    const lastLocStr = await redis.get(`last_location:${userId}`);
    if (lastLocStr) {
        const lastLoc = JSON.parse(lastLocStr);
        const distanceMiles = getDistanceFromLatLonInMiles(lastLoc.lat, lastLoc.lng, lat, lng);
        const timeDeltaHours = (timestamp - lastLoc.timestamp) / 1000 / 3600;

        if (timeDeltaHours > 0) {
            const speedMph = distanceMiles / timeDeltaHours;

            // Allow some buffer for very short time deltas to avoid GPS jitter noise
            if (speedMph > SPEED_THRESHOLD_MPH && timeDeltaHours > 0.00027) { // > 1 second
                console.warn(`AntiCheat: User ${userId} flagged for speeding (${speedMph.toFixed(2)} mph)`);
                await logSuspiciousActivity(userId, matchId, 'Teleportation', { speedMph, distanceMiles, timeDeltaHours });
                return false; // Reject
            }
        }
    }

    // Update last location
    await redis.set(`last_location:${userId}`, JSON.stringify({ lat, lng, timestamp }));
    return true; // Pass
};

async function logSuspiciousActivity(userId: string, matchId: string, reason: string, details: any) {
    try {
        // userId might be "ME" in mock, handle string/int conversion if needed. Assuming int for DB.
        // If auth uses UUIDs or strings, schema needs update. Schema has integer user_id.
        // For MVP, if userId is not int, this might fail unless we cast or mock.
        // Assuming real app uses Int IDs. 
        if (isNaN(Number(userId))) return;

        await query(
            `INSERT INTO suspicious_activity (user_id, match_id, reason, details) VALUES ($1, $2, $3, $4)`,
            [userId, matchId, reason, JSON.stringify(details)]
        );
    } catch (err) {
        console.error('Failed to log suspicious activity:', err);
    }
}
