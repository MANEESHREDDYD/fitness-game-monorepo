import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Polygon, Line, Circle, Text as SvgText, G, Defs, LinearGradient, Stop } from 'react-native-svg';

const { width } = Dimensions.get('window');
const SIZE = width * 0.85;
const CENTER = SIZE / 2;
const RADIUS = SIZE / 2.5;

// 6 axes for the hexagonal radar
const AXES = ['Speed', 'Stamina', 'Strategy', 'Aggression', 'Consistency', 'Captures'];
const NUM_AXES = AXES.length;
const ANGLE_STEP = (2 * Math.PI) / NUM_AXES;

interface SkillGraphProps {
    data: number[]; // 6 values, each 0-100
    color?: string;
}

function polarToCartesian(angle: number, radius: number): [number, number] {
    // Start from top (-PI/2 offset)
    const x = CENTER + radius * Math.cos(angle - Math.PI / 2);
    const y = CENTER + radius * Math.sin(angle - Math.PI / 2);
    return [x, y];
}

function buildPolygonPoints(values: number[]): string {
    return values
        .map((val, i) => {
            const scaled = (val / 100) * RADIUS;
            const [x, y] = polarToCartesian(i * ANGLE_STEP, scaled);
            return `${x},${y}`;
        })
        .join(' ');
}

function buildHexPoints(scale: number): string {
    return Array.from({ length: NUM_AXES })
        .map((_, i) => {
            const [x, y] = polarToCartesian(i * ANGLE_STEP, RADIUS * scale);
            return `${x},${y}`;
        })
        .join(' ');
}

export default function HexagonalSkillGraph({ data, color = '#00FFAA' }: SkillGraphProps) {
    const safeData = data.length === 6 ? data : [50, 50, 50, 50, 50, 50];

    return (
        <View style={styles.container}>
            <Text style={styles.title}>PLAYER PROFILE</Text>
            <Svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
                <Defs>
                    <LinearGradient id="skillGrad" x1="0" y1="0" x2="1" y2="1">
                        <Stop offset="0" stopColor={color} stopOpacity="0.6" />
                        <Stop offset="1" stopColor="#0044FF" stopOpacity="0.3" />
                    </LinearGradient>
                </Defs>

                {/* Background Hexagon Rings (20%, 40%, 60%, 80%, 100%) */}
                {[0.2, 0.4, 0.6, 0.8, 1.0].map((scale, idx) => (
                    <Polygon
                        key={`ring-${idx}`}
                        points={buildHexPoints(scale)}
                        fill="none"
                        stroke="rgba(255,255,255,0.08)"
                        strokeWidth={1}
                    />
                ))}

                {/* Axis Lines */}
                {AXES.map((_, i) => {
                    const [x, y] = polarToCartesian(i * ANGLE_STEP, RADIUS);
                    return (
                        <Line
                            key={`axis-${i}`}
                            x1={CENTER}
                            y1={CENTER}
                            x2={x}
                            y2={y}
                            stroke="rgba(255,255,255,0.1)"
                            strokeWidth={1}
                        />
                    );
                })}

                {/* Data Polygon */}
                <Polygon
                    points={buildPolygonPoints(safeData)}
                    fill="url(#skillGrad)"
                    stroke={color}
                    strokeWidth={2}
                    opacity={0.85}
                />

                {/* Data Points */}
                {safeData.map((val, i) => {
                    const scaled = (val / 100) * RADIUS;
                    const [x, y] = polarToCartesian(i * ANGLE_STEP, scaled);
                    return (
                        <Circle
                            key={`dot-${i}`}
                            cx={x}
                            cy={y}
                            r={4}
                            fill={color}
                            stroke="#000"
                            strokeWidth={1.5}
                        />
                    );
                })}

                {/* Axis Labels */}
                {AXES.map((label, i) => {
                    const [x, y] = polarToCartesian(i * ANGLE_STEP, RADIUS + 22);
                    return (
                        <SvgText
                            key={`label-${i}`}
                            x={x}
                            y={y}
                            fill="#888"
                            fontSize="11"
                            fontWeight="600"
                            textAnchor="middle"
                            alignmentBaseline="central"
                        >
                            {label.toUpperCase()}
                        </SvgText>
                    );
                })}

                {/* Value Labels */}
                {safeData.map((val, i) => {
                    const scaled = (val / 100) * RADIUS;
                    const [x, y] = polarToCartesian(i * ANGLE_STEP, scaled + 14);
                    return (
                        <SvgText
                            key={`val-${i}`}
                            x={x}
                            y={y}
                            fill={color}
                            fontSize="10"
                            fontWeight="bold"
                            textAnchor="middle"
                        >
                            {val}
                        </SvgText>
                    );
                })}
            </Svg>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        paddingVertical: 20,
        backgroundColor: 'rgba(15, 15, 20, 0.95)',
        borderRadius: 20,
        marginHorizontal: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.06)',
    },
    title: {
        color: '#666',
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 3,
        marginBottom: 10,
    },
});
