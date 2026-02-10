import subprocess
import time
import os
import sys

# --- Configuration ---
EMULATOR_SERIAL = "emulator-5554"
VIDEO_FILE = "showcase_indoor.mp4"
REMOTE_VIDEO_PATH = f"/sdcard/{VIDEO_FILE}"

def adb(command):
    cmd = f"adb -s {EMULATOR_SERIAL} {command}"
    print(f"Executing: {cmd}")
    return subprocess.run(cmd, shell=True, capture_output=True, text=True)

def setup_scene():
    print("🎬 STARTING INDOOR DASHBOARD SHOWCASE (HOT START)")
    
    # 1. Start Recording
    print("📹 Starting screen recording (HOT START)...")
    record_proc = subprocess.Popen(
        f"adb -s {EMULATOR_SERIAL} shell screenrecord --time-limit 60 --bit-rate 20M {REMOTE_VIDEO_PATH}",
        shell=True
    )
    time.sleep(3) # Wait for recorder

    try:
        # 2. The Map Jolt (Force Layout)
        print("⚡ EXECUTING UI JOLT (Force Render)")
        adb("shell input keyevent 3") # Home
        time.sleep(1)
        adb("shell input keyevent 187") # App Switcher
        time.sleep(1)
        adb("shell input tap 540 1200") # Tap center to restore app
        time.sleep(2)

        # 3. The Sprint (0:05 - 0:35)
        print("🎬 SCENE: THE SPRINT (Indoor Telemetry & Progress)")
        # Dashboard is self-animated via simulation intervals in React Native
        time.sleep(30)

        # 4. The Close (0:35 - 0:45)
        print("🎬 SCENE: THE CLOSE (Dashboard Analytics)")
        time.sleep(10)

    except KeyboardInterrupt:
        print("\nInterrupted.")
    finally:
        print("\n⏹ Stopping recording...")
        adb("shell pkill -INT screenrecord")
        time.sleep(3)
        record_proc.terminate()
        
        print("📥 Pulling video...")
        adb(f"pull {REMOTE_VIDEO_PATH} ./{VIDEO_FILE}")
        
        if os.path.exists(VIDEO_FILE):
            size = os.path.getsize(VIDEO_FILE)
            print(f"✅ Video pulled. Size: {size / (1024*1024):.2f} MB")

if __name__ == "__main__":
    setup_scene()
