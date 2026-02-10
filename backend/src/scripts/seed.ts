import { query, initDb } from '../db';
import pool from '../db';

// Coordinates for Park 1 (Approximate Central Park NY Rectangle)
const PARK_1_COORDS = [
    [-73.981, 40.768], [-73.958, 40.800], [-73.949, 40.796], [-73.973, 40.764], [-73.981, 40.768]
];

// Coordinates for Park 2 (Approximate Hyde Park London)
const PARK_2_COORDS = [
    [-0.170, 51.503], [-0.176, 51.510], [-0.158, 51.511], [-0.155, 51.504], [-0.170, 51.503]
];

// Helper to generate Polygon WKT
const polygonWKT = (coords: number[][]) => {
    const points = coords.map(c => `${c[0]} ${c[1]}`).join(',');
    return `POLYGON((${points}))`;
};

// Helper: Point inside bounds (Simplified)
const randomPointInBounds = (coords: number[][]) => {
    const minX = Math.min(...coords.map(c => c[0]));
    const maxX = Math.max(...coords.map(c => c[0]));
    const minY = Math.min(...coords.map(c => c[1]));
    const maxY = Math.max(...coords.map(c => c[1]));

    const x = minX + Math.random() * (maxX - minX);
    const y = minY + Math.random() * (maxY - minY);
    return `POINT(${x} ${y})`;
};

const seed = async () => {
    try {
        console.log('Starting seed...');
        await initDb();

        // 0. Cleanup
        console.log('Cleaning up old data...');
        await query('TRUNCATE users, parks, matches, zones, telemetry CASCADE');


        // 1. Users
        console.log('Seeding Users...');
        for (let i = 1; i <= 15; i++) {
            await query(
                `INSERT INTO users (username, email, password_hash, weight_kg, height_cm)
                 VALUES ($1, $2, $3, $4, $5)
                 ON CONFLICT (email) DO NOTHING`,
                [`user${i}`, `user${i}@example.com`, 'hashedpassword', 70 + (Math.random() * 20), 170 + (Math.random() * 15)]
            );
        }

        // 2. Parks
        console.log('Seeding Parks...');
        const park1C = polygonWKT(PARK_1_COORDS);
        const park2C = polygonWKT(PARK_2_COORDS);

        const p1 = await query(
            `INSERT INTO parks (name, boundary) VALUES ('Central Park Simulation', ST_GeogFromText($1)) RETURNING id`,
            [park1C]
        );
        const p2 = await query(
            `INSERT INTO parks (name, boundary) VALUES ('Hyde Park Simulation', ST_GeogFromText($1)) RETURNING id`,
            [park2C]
        );

        // 3. Zones (5 per park)
        console.log('Seeding Zones...');
        const parkIds = [p1.rows[0].id, p2.rows[0].id];
        const parkCoords = [PARK_1_COORDS, PARK_2_COORDS];

        for (let i = 0; i < 2; i++) {
            for (let z = 1; z <= 5; z++) {
                const point = randomPointInBounds(parkCoords[i]);
                await query(
                    `INSERT INTO zones (park_id, name, location, radius_meters)
                     VALUES ($1, $2, ST_GeogFromText($3), 30)`,
                    [parkIds[i], `Zone ${String.fromCharCode(65 + z - 1)}`, point]
                );
            }
        }

        console.log('Seeding Complete.');
        await pool.end();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seed();
