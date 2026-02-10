import * as Haptics from 'expo-haptics';

/**
 * Rhythmic Haptic Pulse
 * 
 * Triggers a distinctive rhythmic vibration pattern when a user enters
 * a capture zone. The pattern is: Heavy -> pause -> Medium -> pause -> Light
 * creating a "heartbeat" sensation that intensifies awareness.
 */

let pulseInterval: ReturnType<typeof setInterval> | null = null;
let isActive = false;

export async function startZonePulse() {
    if (isActive) return;
    isActive = true;

    // Immediate initial pulse
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    // Rhythmic loop: ~1.2s cycle
    let tick = 0;
    pulseInterval = setInterval(async () => {
        tick++;
        switch (tick % 4) {
            case 0:
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                break;
            case 1:
                // pause
                break;
            case 2:
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                break;
            case 3:
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                break;
        }
    }, 300); // 300ms per tick = 1.2s full cycle
}

export function stopZonePulse() {
    if (pulseInterval) {
        clearInterval(pulseInterval);
        pulseInterval = null;
    }
    isActive = false;
}

/**
 * Single notification haptic for events like zone capture confirmation
 */
export async function captureSuccessHaptic() {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
}

/**
 * Warning haptic for anti-cheat flags or speed warnings
 */
export async function warningHaptic() {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
}
