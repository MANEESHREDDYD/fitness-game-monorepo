# 🚀 GitHub Setup Instructions

## Current Status
✅ Git repository initialized
✅ All files committed (95 files, 23,652 insertions)
✅ Commit hash: b1267a7

---

## Step 1: Create GitHub Repository

### Option A: Using GitHub CLI (Recommended)
```powershell
# Install GitHub CLI
winget install --id GitHub.cli

# Authenticate
gh auth login

# Create repository and push
gh repo create fitness-game-monorepo --public --source=. --push
```

### Option B: Using GitHub Website
1. Go to https://github.com/new
2. Repository name: `fitness-game-monorepo`
3. Description: `Location-based fitness game with zone capture, ML churn prediction, and real-time updates`
4. Choose Public or Private
5. **DO NOT** initialize with README (we already have files)
6. Click "Create repository"

Then run these commands:
```powershell
git remote add origin https://github.com/YOUR_USERNAME/fitness-game-monorepo.git
git branch -M main
git push -u origin main
```

---

## Step 2: Configure GitHub Secrets (For CI/CD)

After pushing to GitHub, set up secrets for automated deployment:

1. Go to your repository on GitHub
2. Settings → Secrets and variables → Actions
3. Click "New repository secret"

Add these secrets:

### AZURE_CREDENTIALS
```json
{
  "clientId": "<your-client-id>",
  "clientSecret": "<your-client-secret>",
  "subscriptionId": "<your-subscription-id>",
  "tenantId": "<your-tenant-id>"
}
```

To create this, run:
```powershell
az ad sp create-for-rbac --name "fitness-game-deploy" \
  --role contributor \
  --scopes /subscriptions/<subscription-id>/resourceGroups/fitness-game-rg \
  --sdk-auth
```

### Other Required Secrets
- **AZURE_SUBSCRIPTION_ID**: Your Azure subscription ID
- **AZURE_RESOURCE_GROUP**: `fitness-game-rg`
- **AZURE_WEBAPP_NAME**: Your app service name (from deployment)

---

## Step 3: Enable GitHub Actions

Your repository includes `.github/workflows/deploy.yml` which will:
- Automatically deploy infrastructure on push to main
- Build and deploy the backend API
- Run on every commit to main branch

To enable:
1. Push your code to GitHub
2. Go to Actions tab
3. Enable workflows if prompted

---

## Step 4: Update Repository Settings (Optional)

### Add Topics
Go to repository → About (top right) → Add topics:
- `fitness-app`
- `react-native`
- `azure`
- `machine-learning`
- `typescript`
- `location-based`
- `bicep`

### Add Description
```
Location-based fitness game with zone capture, team battles, and ML-powered churn prediction. Built with React Native, Node.js, Azure, and Python.
```

### Add Website
After Azure deployment, add your App Service URL:
```
https://your-app-name.azurewebsites.net
```

---

## Commands Summary

```powershell
# Check current status
git status
git log --oneline

# View your commit
git show

# If you need to make changes
git add .
git commit -m "Your message"
git push

# Update from GitHub
git pull

# Create new branch for features
git checkout -b feature/new-feature
git push -u origin feature/new-feature
```

---

## Repository Structure on GitHub

After pushing, your GitHub repo will show:
```
├── 📁 .github/workflows     # CI/CD automation
├── 📁 backend-api           # Node.js API
├── 📁 mobile-app            # React Native app
├── 📁 ml                    # ML pipeline
├── 📁 infra                 # Azure Bicep
├── 📁 scripts               # Deployment automation
├── 📄 README.md             # Main documentation
├── 📄 DEPLOYMENT_GUIDE.md
├── 📄 QUICK_START.md
└── 📄 CONFIGURATION_GUIDE.md
```

---

## Next Steps After Pushing

1. ✅ **Star your own repository** (for easy access)
2. ✅ **Add collaborators** (if team project)
3. ✅ **Set up branch protection** (Settings → Branches)
4. ✅ **Configure GitHub Actions secrets**
5. ✅ **Deploy to Azure**

---

## Troubleshooting

### "Repository not found"
- Make sure you created the repository on GitHub first
- Check the repository name matches exactly
- Verify you're logged into the correct GitHub account

### "Authentication failed"
```powershell
# Use personal access token
# Generate at: https://github.com/settings/tokens
# When git asks for password, use the token
```

### "Push rejected"
```powershell
# If repository was initialized with files:
git pull origin main --allow-unrelated-histories
git push -u origin main
```

---

## Quick Push Command

Once you've created the GitHub repository:
```powershell
git remote add origin https://github.com/YOUR_USERNAME/fitness-game-monorepo.git
git branch -M main
git push -u origin main
```

Replace `YOUR_USERNAME` with your GitHub username!

---

✅ **Your code is ready to push to GitHub!**
