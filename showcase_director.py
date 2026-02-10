#!/usr/bin/env python3
"""
╔══════════════════════════════════════════════════════════════╗
║           SHOWCASE DIRECTOR ENGINE v1.0                      ║
║   Autonomous Cinematic Walkthrough via Python + ADB          ║
║   Drives an Android Emulator through a 45-second showcase    ║
╚══════════════════════════════════════════════════════════════╝

Prerequisites:
  - Android Emulator running with the Fitness Game app installed
  - ADB in PATH
  - Emulator console accessible on localhost:5554

Usage:
  python showcase_director.py
  python showcase_director.py --record   # Records to showcase_demo.mp4
"""

import subprocess
import time
import sys
import os
import telnetlib

# ─── Configuration ───────────────────────────────────────────
EMULATOR_SERIAL = "emulator-5554"
TELNET_PORT = 5554
PACKAGE_NAME = "com.fitnessgame.app"
ACTIVITY_NAME = ".MainActivity"

# GPS Coordinates: Central Park NYC
BETHESDA_TERRACE = (40.7736, -73.9712)
ZONE_TARGET      = (40.7742, -73.9708)  # ~60m north of Bethesda
TIMES_SQUARE     = (40.7580, -73.9855)  # Teleport destination

# Walking path from Bethesda Terrace into a Zone (10 waypoints, ~3mph)
WALKING_PATH = [
    (40.7736, -73.9712),
    (40.7737, -73.9711),
    (40.7738, -73.9710),
    (40.7739, -73.9710),
    (40.7740, -73.9709),
    (40.7740, -73.9709),
    (40.7741, -73.9708),
    (40.7741, -73.9708),
    (40.7742, -73.9708),
    (40.7742, -73.9708),
]

# Screen coordinates (1080x1920 default emulator)
# Adjust these for your emulator resolution
COORDS = {
    "username_field": (540, 600),
    "password_field": (540, 750),
    "login_button":   (540, 950),
    "map_center":     (540, 960),
    "territory_toggle": (950, 200),
    "profile_tab":    (900, 1850),
    "skill_graph_scroll_target": (540, 1200),
}


def adb(cmd: str, capture=False):
    """Execute an ADB command."""
    full = f"adb -s {EMULATOR_SERIAL} {cmd}"
    if capture:
        return subprocess.run(full, shell=True, capture_output=True, text=True).stdout
    subprocess.run(full, shell=True, check=False)


def tap(x: int, y: int, label: str = ""):
    """Tap a screen coordinate."""
    print(f"  🖱  TAP ({x}, {y}) {label}")
    adb(f"shell input tap {x} {y}")


def swipe(x1, y1, x2, y2, duration_ms=300):
    """Swipe gesture."""
    adb(f"shell input swipe {x1} {y1} {x2} {y2} {duration_ms}")


def type_text(text: str):
    """Type text via ADB."""
    # Escape spaces for ADB
    escaped = text.replace(" ", "%s")
    adb(f'shell input text "{escaped}"')


def pinch_zoom_in():
    """Simulate pinch-to-zoom using two-finger gesture."""
    print("  🔍 PINCH-TO-ZOOM IN")
    # Multi-touch via sendevent is complex; use swipe approximation
    # Zoom in by double-tapping center of map
    tap(540, 960, "double-tap-zoom")
    time.sleep(0.15)
    tap(540, 960, "double-tap-zoom")
    time.sleep(0.5)
    # Additional zoom via touchscreen gesture
    adb("shell input swipe 540 960 540 960 50")  # Long press
    time.sleep(0.1)
    adb("shell input swipe 540 800 540 600 500")  # Drag up = zoom


def set_gps(lat: float, lng: float):
    """Inject GPS coordinates via emulator console (telnet)."""
    try:
        tn = telnetlib.Telnet("localhost", TELNET_PORT, timeout=3)
        tn.read_until(b"OK", timeout=2)
        cmd = f"geo fix {lng} {lat}\n"
        tn.write(cmd.encode())
        time.sleep(0.3)
        tn.close()
        print(f"  📍 GPS → ({lat:.4f}, {lng:.4f})")
    except Exception as e:
        # Fallback: use adb geo fix
        print(f"  📍 GPS (adb fallback) → ({lat:.4f}, {lng:.4f})")
        adb(f"emu geo fix {lng} {lat}")


def screenshot(name: str):
    """Take a screenshot."""
    adb(f"shell screencap -p /sdcard/{name}.png")
    adb(f"pull /sdcard/{name}.png ./{name}.png")
    print(f"  📸 Screenshot saved: {name}.png")


def wait(seconds: float, reason: str = ""):
    """Wait with a reason."""
    print(f"  ⏳ WAIT {seconds}s {reason}")
    time.sleep(seconds)


# ═════════════════════════════════════════════════════════════
#                    DIRECTOR'S SCRIPT
# ═════════════════════════════════════════════════════════════

def scene_1_the_hook():
    """Scene 1: The Hook (0:00 - 0:05)"""
    print("\n" + "═" * 60)
    print("🎬 SCENE 1: THE HOOK (0:00 - 0:05)")
    print("═" * 60)

    # Launch the app
    print("  🚀 Launching app...")
    adb(f"shell am start -n {PACKAGE_NAME}/{ACTIVITY_NAME}")
    wait(3, "App launch + splash screen")

    # Type username
    tap(*COORDS["username_field"], "Username field")
    wait(0.5)
    type_text("ProUser")
    wait(0.3)

    # Type password
    tap(*COORDS["password_field"], "Password field")
    wait(0.3)
    type_text("password123")
    wait(0.3)

    # Tap Login
    tap(*COORDS["login_button"], "Login button")
    wait(2, "Glassmorphism animation completes")

    screenshot("scene1_hook")


def scene_2_the_tech():
    """Scene 2: The Tech (0:05 - 0:15)"""
    print("\n" + "═" * 60)
    print("🎬 SCENE 2: THE TECH (0:05 - 0:15)")
    print("═" * 60)

    # Set initial GPS to Central Park
    set_gps(*BETHESDA_TERRACE)
    wait(1, "Map centers on Central Park")

    # Pinch to zoom into Central Park
    pinch_zoom_in()
    wait(1)
    pinch_zoom_in()
    wait(1, "Zoomed into Bethesda Terrace area")

    # Tap Territories toggle to reveal Voronoi
    tap(*COORDS["territory_toggle"], "Territories toggle")
    wait(2, "Voronoi overlays render with neon glow")

    screenshot("scene2_tech")


def scene_3_the_gameplay():
    """Scene 3: The Gameplay (0:15 - 0:25)"""
    print("\n" + "═" * 60)
    print("🎬 SCENE 3: THE GAMEPLAY (0:15 - 0:25)")
    print("═" * 60)

    # Simulate walking from Bethesda Terrace to Zone
    print("  🚶 Simulating walking path (10 waypoints)...")
    for i, (lat, lng) in enumerate(WALKING_PATH):
        set_gps(lat, lng)
        wait(0.8, f"Step {i+1}/10")

    # Pause when haptic pulse triggers (user is now in zone)
    wait(3, "⚡ Haptic Pulse UI triggered — IN ZONE")

    screenshot("scene3_gameplay")


def scene_4_the_twist():
    """Scene 4: The Twist (0:25 - 0:35)"""
    print("\n" + "═" * 60)
    print("🎬 SCENE 4: THE TWIST (0:25 - 0:35)")
    print("═" * 60)

    # TELEPORT to Times Square (instant jump ~3.5km)
    print("  ⚡ TELEPORTING to Times Square!")
    set_gps(*TIMES_SQUARE)
    wait(3, "Waiting for 'Suspicious Activity Detected' toast")

    screenshot("scene4_twist_anticheat")

    # Wait for UI reaction
    wait(2, "Anti-cheat toast visible")
    screenshot("scene4_toast")


def scene_5_the_stats():
    """Scene 5: The Stats (0:35 - 0:45)"""
    print("\n" + "═" * 60)
    print("🎬 SCENE 5: THE STATS (0:35 - 0:45)")
    print("═" * 60)

    # Navigate to Profile tab
    tap(*COORDS["profile_tab"], "Profile tab")
    wait(1.5, "Profile screen loads")

    # Scroll down to Hexagonal Skill Graph
    swipe(540, 1400, 540, 600, 500)
    wait(1, "Scrolling to Skill Graph")

    swipe(540, 1400, 540, 600, 500)
    wait(2, "Hexagonal Skill Graph visible")

    screenshot("scene5_stats")


def main():
    recording = "--record" in sys.argv

    print("╔══════════════════════════════════════════════════════════╗")
    print("║        🎬 SHOWCASE DIRECTOR ENGINE v1.0                 ║")
    print("║        Autonomous Cinematic Walkthrough                 ║")
    print("╚══════════════════════════════════════════════════════════╝")

    # Verify ADB connection
    devices = adb("devices", capture=True)
    if EMULATOR_SERIAL not in (devices or ""):
        print(f"\n❌ Emulator '{EMULATOR_SERIAL}' not found.")
        print("   Start your emulator first, then re-run this script.")
        print(f"\n   Detected devices:\n{devices}")
        sys.exit(1)

    # Start screen recording if requested
    if recording:
        print("\n🔴 RECORDING to showcase_demo.mp4 (max 180s)")
        subprocess.Popen(
            f"adb -s {EMULATOR_SERIAL} shell screenrecord --time-limit 60 /sdcard/showcase_demo.mp4",
            shell=True
        )
        time.sleep(0.5)

    try:
        scene_1_the_hook()
        scene_2_the_tech()
        scene_3_the_gameplay()
        scene_4_the_twist()
        scene_5_the_stats()
    except KeyboardInterrupt:
        print("\n\n⚠ Director interrupted by user.")
    finally:
        if recording:
            time.sleep(2)
            # Pull the recording
            adb("pull /sdcard/showcase_demo.mp4 ./showcase_demo.mp4")
            print("\n✅ Recording saved: showcase_demo.mp4")

    print("\n" + "═" * 60)
    print("🎬 DIRECTOR'S CUT COMPLETE")
    print("═" * 60)
    print("\nScreenshots saved:")
    for f in sorted([f for f in os.listdir(".") if f.startswith("scene") and f.endswith(".png")]):
        print(f"  📸 {f}")


if __name__ == "__main__":
    main()
