import subprocess
import time
import socketio
import requests
import json
import os
import sys
import signal

# --- Configuration ---
EMULATOR_SERIAL = "emulator-5554"
BASE_URL = "http://localhost:3000"
API_URL = f"{BASE_URL}/api"
SOCKET_URL = BASE_URL
MATCH_ID = "nyc-showcase-001" 
VIDEO_FILE = "showcase_nyc_group.mp4"
REMOTE_VIDEO_PATH = f"/sdcard/{VIDEO_FILE}"

# Central Park Bethesda Terrace
START_POINT = {"lat": 40.7710, "lng": -73.9712}
END_POINT = {"lat": 40.7736, "lng": -73.9712}

# 1080x2400 Coordinates
COORDS = {
    "login": (540, 2200),
    "voronoi_toggle": (950, 200),
    "profile_tab": (950, 2250),
    "switcher_app": (540, 1200), # Center tap for App Switcher
}

bots = []

def adb(command):
    cmd = f"adb -s {EMULATOR_SERIAL} {command}"
    print(f"Executing: {cmd}")
    return subprocess.run(cmd, shell=True, capture_output=True, text=True)

class Bot:
    def __init__(self, username, email):
        self.username = username
        self.email = email
        self.token = None
        self.sio = socketio.Client()

    def setup(self):
        try:
            res = requests.post(f"{API_URL}/auth/signup", json={
                "username": self.username,
                "email": self.email,
                "password": "password123"
            })
            if res.status_code != 200 and res.status_code != 201:
                res = requests.post(f"{API_URL}/auth/login", json={
                    "email": self.email,
                    "password": "password123"
                })
            self.token = res.json().get("token")
        except Exception as e:
            print(f"Auth failed for {self.username}: {e}")
            return False

        @self.sio.on('connect')
        def on_connect():
            print(f"Bot {self.username} connected")
            self.sio.emit('join_match', MATCH_ID)

        self.sio.connect(SOCKET_URL, auth={"token": self.token})
        return True

    def move(self, lat, lng):
        if self.sio.connected:
            self.sio.emit('location_update', {
                "matchId": MATCH_ID,
                "lat": lat,
                "lng": lng,
                "speed": 5
            })

def main():
    print("🎬 STARTING NYC SOCIAL SQUAD DIRECTOR (MAP RESCUE & HOT START)")
    
    # 0. Initialize Bots
    print("🤖 Initializing 4 Bots...")
    for i in range(1, 5):
        bot = Bot(f"social_bot_{i}", f"bot{i}@test.com")
        if bot.setup():
            bots.append(bot)
    
    # 1. Start Recording
    print("📹 Starting screen recording...")
    record_proc = subprocess.Popen(
        f"adb -s {EMULATOR_SERIAL} shell screenrecord --time-limit 60 --bit-rate 20M {REMOTE_VIDEO_PATH}",
        shell=True
    )
    time.sleep(3) # Give recorder 3s to initialize

    try:
        # 2. The Map Jolt (0:03 - 0:05)
        print("⚡ EXECUTING MAP JOLT (Restore Render)")
        adb("shell input keyevent 3") # Home
        time.sleep(1)
        adb("shell input keyevent 187") # App Switcher
        time.sleep(1)
        adb(f"shell input tap {COORDS['switcher_app'][0]} {COORDS['switcher_app'][1]}") # Restore center app
        time.sleep(2)

        # 3. The Run (0:05 - 0:35)
        print("🎬 SCENE: THE RUN (GPS MOVE + BOT SQUAD)")
        steps = 30 
        for i in range(steps):
            progress = i / steps
            current_lat = START_POINT["lat"] + (END_POINT["lat"] - START_POINT["lat"]) * progress
            current_lng = START_POINT["lng"]
            
            adb(f"emu geo fix {current_lng} {current_lat}")
            
            offsets = [
                (0.0003, 0.0003), (-0.0003, 0.0003),
                (0.0003, -0.0003), (-0.0003, -0.0003)
            ]
            for idx, bot in enumerate(bots):
                bot.move(current_lat + offsets[idx][0], current_lng + offsets[idx][1])
                
            print(f"  📍 Progress: {int(progress*100)}% | Lat: {current_lat:.4f}", end="\r")
            time.sleep(1)
        
        # 4. The Capture (0:35 - 0:45)
        print("\n🎬 SCENE: THE CAPTURE (35s Mark)")
        adb(f"emu geo fix {END_POINT['lng']} {END_POINT['lat']}")
        time.sleep(10) # Wait for visual confirmation

        # 5. The Finale (0:45 - 0:50)
        print("🎬 SCENE: THE FINALE (Skill Graph)")
        adb(f"shell input tap {COORDS['profile_tab'][0]} {COORDS['profile_tab'][1]}")
        time.sleep(5)

    except KeyboardInterrupt:
        print("\nInterrupted.")
    finally:
        print("\n⏹ Stopping recording...")
        adb("shell pkill -INT screenrecord")
        time.sleep(3) # Allow file to finalize
        record_proc.terminate()
        
        print("📥 Pulling video...")
        adb(f"pull {REMOTE_VIDEO_PATH} ./{VIDEO_FILE}")
        
        # Verify size
        if os.path.exists(VIDEO_FILE):
            size = os.path.getsize(VIDEO_FILE)
            print(f"✅ Video pulled. Size: {size / (1024*1024):.2f} MB")
        
        for bot in bots:
            bot.sio.disconnect()

if __name__ == "__main__":
    main()
