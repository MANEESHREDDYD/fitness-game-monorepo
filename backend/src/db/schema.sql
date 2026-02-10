-- Enable PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    weight_kg DECIMAL(5,2),
    height_cm DECIMAL(5,2),
    x_aggressiveness_score DECIMAL(3,2) DEFAULT 0.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Parks Table (Geospatial Boundaries)
CREATE TABLE IF NOT EXISTS parks (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    boundary GEOGRAPHY(POLYGON, 4326) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Zones Table (Capture Points)
CREATE TABLE IF NOT EXISTS zones (
    id SERIAL PRIMARY KEY,
    park_id INTEGER REFERENCES parks(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    location GEOGRAPHY(POINT, 4326) NOT NULL,
    radius_meters INTEGER DEFAULT 20,
    owner_id INTEGER REFERENCES users(id),
    team_color VARCHAR(20),
    points_value INTEGER DEFAULT 10
);

-- Matches Table
CREATE TABLE IF NOT EXISTS matches (
    id SERIAL PRIMARY KEY,
    status VARCHAR(20) DEFAULT 'pending', -- pending, active, completed
    park_id INTEGER REFERENCES parks(id),
    start_time TIMESTAMP WITH TIME ZONE,
    end_time TIMESTAMP WITH TIME ZONE,
    config JSONB
);

-- Telemetry Table (Partitioned by Match ID)
-- Note: 'id' serial primary key removed to support partitioning without complexity
CREATE TABLE IF NOT EXISTS telemetry (
    user_id INTEGER NOT NULL,
    match_id INTEGER NOT NULL,
    location GEOGRAPHY(POINT, 4326) NOT NULL,
    speed_mph DECIMAL(5,2),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
) PARTITION BY LIST (match_id);

-- Default Partition (Catch-all)
CREATE TABLE IF NOT EXISTS telemetry_default PARTITION OF telemetry DEFAULT;

-- Specific Partitions for Seed Matches (1-5)
CREATE TABLE IF NOT EXISTS telemetry_match_1 PARTITION OF telemetry FOR VALUES IN (1);
CREATE TABLE IF NOT EXISTS telemetry_match_2 PARTITION OF telemetry FOR VALUES IN (2);

-- Suspicious Activity Table (Anti-Cheat Logs)
CREATE TABLE IF NOT EXISTS suspicious_activity (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    match_id INTEGER,
    reason VARCHAR(50), -- 'Teleportation', 'GPS Drift'
    details JSONB,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- VIEW: Park Territories (Voronoi with Clipping)
CREATE OR REPLACE VIEW v_park_territories AS
WITH zone_clusters AS (
    SELECT park_id, ST_Collect(location::geometry) as geom
    FROM zones
    GROUP BY park_id
),
voronoi_cells AS (
    SELECT park_id, (ST_Dump(ST_VoronoiPolygons(geom, 0, (SELECT boundary::geometry FROM parks WHERE id = park_id)))).geom as poly
    FROM zone_clusters
)
SELECT 
    v.park_id,
    p.name as park_name,
    ST_Intersection(v.poly, p.boundary::geometry)::geography as territory
FROM voronoi_cells v
JOIN parks p ON v.park_id = p.id;

-- VIEW: User Profiles (Aggression & Consistency)
CREATE OR REPLACE VIEW v_user_profiles AS
SELECT 
    u.id,
    u.username,
    COUNT(DISTINCT t.match_id) as matches_played,
    -- Zone Aggression Score: (Zones Owned / Distance KM) * Match Intensity Log
    (
        (SELECT COUNT(*) FROM zones z WHERE z.owner_id = u.id)::DECIMAL / 
        NULLIF((SUM(ST_Length(t.location::geography)) OVER (PARTITION BY u.id) / 1000), 1)
    ) * COALESCE(LOG(COUNT(t.id) + 1), 1) as aggression_score,
    -- Spatial Consistency: Variance in ping intervals (Lower is better)
    STDDEV(EXTRACT(EPOCH FROM (t.timestamp - lag(t.timestamp) OVER (PARTITION BY t.match_id, t.user_id ORDER BY t.timestamp)))) as spatial_consistency
FROM users u
LEFT JOIN telemetry t ON u.id = t.user_id
GROUP BY u.id;

-- VIEW: System Health (Pipeline Latency)
CREATE OR REPLACE VIEW v_system_health AS
SELECT 
    match_id,
    AVG(EXTRACT(EPOCH FROM (NOW() - timestamp))) as upload_latency_sec,
    COUNT(*) as throughput_pings
FROM telemetry
where timestamp > NOW() - INTERVAL '1 hour'
GROUP BY match_id;
