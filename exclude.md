# SAFE GIT IGNORE RULES (PaperPulse)

## 1. Dependencies (NEVER COMMIT)
node_modules/

## 2. Environment & Secrets (CRITICAL)
.env
.env.*
*.pem
*.key
*.cert

## 3. Build Outputs (AUTO GENERATED)
build/
dist/
out/
.next/
target/
coverage/

## 4. Logs & Runtime Files
logs/
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

## 5. User-generated / runtime uploads
uploads/

## 6. OS / IDE files
.DS_Store
Thumbs.db
desktop.ini
.vscode/
.idea/
*.swp

## 7. Git internal (NEVER)
.git/