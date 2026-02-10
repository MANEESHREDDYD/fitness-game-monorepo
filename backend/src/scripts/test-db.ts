import { query } from '../db';
import pool from '../db';

const test = async () => {
    try {
        console.log('Testing DB connection...');
        const res = await query('SELECT postgis_full_version()');
        console.log('PostGIS Version:', res.rows[0]);
        await pool.end();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

test();
