#!/usr/bin/env bash

# ==============================================================================
# SVARP Email Portal Frontend Deployment Script
# ==============================================================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

BRANCH="${BRANCH:-dev}"

echo -e "${CYAN}========================================================================${NC}"
echo -e "${CYAN}                Deploying SVARP Email Portal Frontend                   ${NC}"
echo -e "${CYAN}========================================================================${NC}"

# Navigate to frontend directory where this script is located
cd "$(dirname "$0")"

# 1. Pull latest code from origin dev branch
if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
    echo -e "${YELLOW}➜ Pulling latest frontend code (origin/${BRANCH})...${NC}"
    git fetch origin "$BRANCH" || true
    git checkout "$BRANCH" || true
    git pull origin "$BRANCH" || true
fi

# 2. Install Node dependencies
if [ -f "package.json" ]; then
    echo -e "${YELLOW}➜ Installing Node dependencies...${NC}"
    npm install
fi

# 3. Build production static assets
echo -e "${YELLOW}➜ Building production static assets (npm run build)...${NC}"
npm run build

echo -e "${GREEN}========================================================================${NC}"
echo -e "${GREEN}✓ Email Portal Frontend deployment completed successfully!               ${NC}"
echo -e "${GREEN}========================================================================${NC}"
