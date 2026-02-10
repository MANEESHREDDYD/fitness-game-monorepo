import React, { useEffect, useState } from 'react';
import { Polygon } from 'react-native-maps';

/**
 * VoronoiOverlay
 * 
 * Fetches Voronoi territory polygons from the backend's v_park_territories view
 * and renders them as semi-transparent neon-glow polygons on the Google Map.
 * 
 * Each territory is colored based on the team that controls the majority of zones
 * within it (or neutral if unclaimed).
 */

const API_URL = 'http://10.0.2.2:3000/api';

// Neon Color Palette
const COLORS = {
    RED: { fill: 'rgba(255, 50, 80, 0.25)', stroke: 'rgba(255, 50, 80, 0.8)' },
    BLUE: { fill: 'rgba(50, 120, 255, 0.25)', stroke: 'rgba(50, 120, 255, 0.8)' },
    GREEN: { fill: 'rgba(0, 255, 170, 0.25)', stroke: 'rgba(0, 255, 170, 0.8)' },
    NEUTRAL: { fill: 'rgba(255, 255, 255, 0.08)', stroke: 'rgba(255, 255, 255, 0.3)' },
};

interface Territory {
    id: string;
    coordinates: Array<{ latitude: number; longitude: number }>;
    teamColor: keyof typeof COLORS;
}

interface VoronoiOverlayProps {
    parkId: number;
    token: string;
}

export default function VoronoiOverlay({ parkId, token }: VoronoiOverlayProps) {
    const [territories, setTerritories] = useState<Territory[]>([]);

    useEffect(() => {
        fetchTerritories();
    }, [parkId]);

    const fetchTerritories = async () => {
        try {
            const res = await fetch(`${API_URL}/parks/${parkId}/territories`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();

            if (Array.isArray(data)) {
                const parsed: Territory[] = data.map((t: any, idx: number) => {
                    // PostGIS returns GeoJSON or WKT. Assuming GeoJSON coordinates.
                    const coords = t.territory?.coordinates?.[0] || [];
                    return {
                        id: `territory-${idx}`,
                        coordinates: coords.map((c: number[]) => ({
                            latitude: c[1],
                            longitude: c[0],
                        })),
                        teamColor: (t.team_color?.toUpperCase() || 'NEUTRAL') as keyof typeof COLORS,
                    };
                });
                setTerritories(parsed);
            }
        } catch (err) {
            console.warn('[VoronoiOverlay] Failed to fetch territories:', err);
            // Graceful degradation: simply don't render overlays
        }
    };

    return (
        <>
            {territories.map((t) => {
                const palette = COLORS[t.teamColor] || COLORS.NEUTRAL;
                // FIX: Wrap Polygon in a length check. Android Maps crashes on empty/too-small coordinate lists.
                return t.coordinates && t.coordinates.length >= 3 ? (
                    <Polygon
                        key={t.id}
                        coordinates={t.coordinates}
                        fillColor={palette.fill}
                        strokeColor={palette.stroke}
                        strokeWidth={2}
                    />
                ) : null;
            })}
        </>
    );
}
