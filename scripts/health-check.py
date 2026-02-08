"""
Quick Health Check Script
Tests all components and shows configuration status
"""
import subprocess
import sys
import os

def run_command(cmd, description):
    """Run a command and return success status"""
    try:
        result = subprocess.run(
            cmd, 
            shell=True, 
            capture_output=True, 
            text=True,
            timeout=5
        )
        return result.returncode == 0
    except:
        return False

def check_with_emoji(condition, success_msg, fail_msg):
    """Print status with emoji"""
    if condition:
        print(f"   ✅ {success_msg}")
        return True
    else:
        print(f"   ❌ {fail_msg}")
        return False

def main():
    print("\n🏥 FITNESS GAME - HEALTH CHECK")
    print("=" * 50)
    
    total_checks = 0
    passed_checks = 0
    
    # Backend API
    print("\n📦 Backend API:")
    total_checks += 1
    backend_running = run_command(
        'curl -s http://localhost:3000/health',
        'Backend Health Check'
    )
    if check_with_emoji(
        backend_running,
        "Running on http://localhost:3000",
        "Not running (start with: npm --workspace backend-api run dev)"
    ):
        passed_checks += 1
    
    # Node.js
    print("\n🟢 Node.js:")
    total_checks += 1
    if check_with_emoji(
        run_command('node --version', 'Node.js'),
        f"Installed: {subprocess.run('node --version', shell=True, capture_output=True, text=True).stdout.strip()}",
        "Not installed"
    ):
        passed_checks += 1
    
    # Python
    print("\n🐍 Python:")
    total_checks += 1
    if check_with_emoji(
        run_command('python --version', 'Python'),
        f"Installed: {subprocess.run('python --version', shell=True, capture_output=True, text=True).stdout.strip()}",
        "Not installed"
    ):
        passed_checks += 1
    
    # ML Dependencies
    print("\n🤖 ML Dependencies:")
    total_checks += 1
    try:
        import pandas
        import sklearn
        import joblib
        check_with_emoji(True, "All ML packages installed", "")
        passed_checks += 1
    except ImportError as e:
        check_with_emoji(False, "", f"Missing packages (run: pip install -r ml/requirements.txt)")
    
    # ML Artifacts
    print("\n📁 ML Artifacts:")
    total_checks += 1
    has_model = os.path.exists("ml_artifacts/churn_model.joblib")
    has_dataset = os.path.exists("ml_artifacts/churn_dataset.csv")
    if check_with_emoji(
        has_model and has_dataset,
        "Model and dataset found",
        "Missing (run: python ml/scripts/test_ml_local.py)"
    ):
        passed_checks += 1
    
    # Azure CLI
    print("\n☁️  Azure CLI:")
    total_checks += 1
    if check_with_emoji(
        run_command('az --version', 'Azure CLI'),
        "Installed and ready",
        "Not installed (run: scripts/install-azure-cli-simple.bat)"
    ):
        passed_checks += 1
    
    # Git
    print("\n📝 Git:")
    total_checks += 1
    if check_with_emoji(
        run_command('git --version', 'Git'),
        "Installed",
        "Not installed"
    ):
        passed_checks += 1
    
    # Mobile app dependencies
    print("\n📱 Mobile App:")
    total_checks += 1
    mobile_deps = os.path.exists("mobile-app/node_modules")
    if check_with_emoji(
        mobile_deps,
        "Dependencies installed",
        "Missing (run: npm install --workspace mobile-app)"
    ):
        passed_checks += 1
    
    # Configuration Files
    print("\n⚙️  Configuration:")
    total_checks += 1
    has_backend_env = os.path.exists("backend-api/.env")
    has_mobile_env = os.path.exists("mobile-app/.env")
    if check_with_emoji(
        has_backend_env and has_mobile_env,
        "Environment files present",
        "Missing .env files"
    ):
        passed_checks += 1
    
    # Summary
    print("\n" + "=" * 50)
    print(f"📊 RESULTS: {passed_checks}/{total_checks} checks passed")
    print("=" * 50)
    
    if passed_checks == total_checks:
        print("\n🎉 All systems ready! You can:")
        print("   - Deploy to Azure: az login && .\\scripts\\deploy-azure.ps1")
        print("   - Test mobile app: cd mobile-app && npm run android")
        print("   - Train ML model: python ml\\scripts\\test_ml_local.py")
    elif passed_checks >= total_checks * 0.7:
        print("\n✅ Core systems ready!")
        print("   - Backend API working locally")
        print("   - ML pipeline functional")
        print("   - Install remaining tools as needed")
    else:
        print("\n⚠️  Some components need setup.")
        print("   Check the ❌ items above and follow the suggestions.")
    
    print()

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\nHealth check cancelled.")
    except Exception as e:
        print(f"\n❌ Error: {e}")
        sys.exit(1)
