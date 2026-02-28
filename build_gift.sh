#!/bin/bash
# ============================================================================
# ROPA Gift Package Builder — Simplified
# Creates: 2 documents + 1 "App Files" folder at root
# ============================================================================

set -e

PROJ_DIR="$(cd "$(dirname "$0")" && pwd)"
GIFT_DIR="$PROJ_DIR/ROPA Para Molly"
APP_DIR="$GIFT_DIR/App Files"

echo "🎁 Building ROPA Gift Package..."
echo ""

# ── Step 1: Create the App Files folder ───────────────────────────────────
echo "📁 Step 1: Creating App Files folder..."

rm -rf "$APP_DIR"
mkdir -p "$APP_DIR/source-code"
mkdir -p "$APP_DIR/guides"
mkdir -p "$APP_DIR/business-docs"

# ── Step 2: Copy AI Assistant to root ─────────────────────────────────────
echo "🤖 Step 2: Placing AI Assistant at root..."

[ -f "$APP_DIR/docs-source/AI_ASSISTANT.md" ] && \
  cp "$APP_DIR/docs-source/AI_ASSISTANT.md" "$GIFT_DIR/AI Assistant - Upload to ChatGPT.md"

# ── Step 3: Populate guides ──────────────────────────────────────────────
echo "🛠️  Step 3: Organizing setup guides..."

[ -f "$APP_DIR/docs-source/ROPA - Technical Handoff IT.docx" ] && \
  cp "$APP_DIR/docs-source/ROPA - Technical Handoff IT.docx" "$APP_DIR/guides/Complete Setup Guide.docx"

[ -f "$APP_DIR/docs-source/SETUP_GUIDE_IT.md" ] && \
  cp "$APP_DIR/docs-source/SETUP_GUIDE_IT.md" "$APP_DIR/guides/Setup Guide.md"

[ -f "$APP_DIR/docs-source/TECHNICAL_FRIEND.md" ] && \
  cp "$APP_DIR/docs-source/TECHNICAL_FRIEND.md" "$APP_DIR/guides/Technical Takeover Guide.md"

[ -f "$APP_DIR/docs-source/MOLLY.md" ] && \
  cp "$APP_DIR/docs-source/MOLLY.md" "$APP_DIR/guides/App Features Guide.md"

[ -f "$APP_DIR/docs-source/USER_GUIDE.md" ] && \
  cp "$APP_DIR/docs-source/USER_GUIDE.md" "$APP_DIR/guides/User Guide.md"

[ -f "$APP_DIR/docs-source/ROPA - User Guide.docx" ] && \
  cp "$APP_DIR/docs-source/ROPA - User Guide.docx" "$APP_DIR/guides/User Guide.docx"

[ -f "$GIFT_DIR/.env.example" ] && \
  cp "$GIFT_DIR/.env.example" "$APP_DIR/guides/.env.example"

# ── Step 4: Populate business docs ────────────────────────────────────────
echo "📊 Step 4: Organizing business documents..."

[ -f "$GIFT_DIR/ROPA Business Strategy.pdf" ] && \
  cp "$GIFT_DIR/ROPA Business Strategy.pdf" "$APP_DIR/business-docs/"

[ -f "$GIFT_DIR/ROPA E2E Audit Report.pdf" ] && \
  cp "$GIFT_DIR/ROPA E2E Audit Report.pdf" "$APP_DIR/business-docs/"

[ -f "$GIFT_DIR/ROPA Market Analysis.pdf" ] && \
  cp "$GIFT_DIR/ROPA Market Analysis.pdf" "$APP_DIR/business-docs/"

[ -f "$APP_DIR/docs-source/ROPA - Business Model.docx" ] && \
  cp "$APP_DIR/docs-source/ROPA - Business Model.docx" "$APP_DIR/business-docs/Business Model.docx"

[ -f "$APP_DIR/docs-source/BUSINESS_STRATEGY.md" ] && \
  cp "$APP_DIR/docs-source/BUSINESS_STRATEGY.md" "$APP_DIR/business-docs/"

[ -f "$APP_DIR/docs-source/MARKET_ANALYSIS.md" ] && \
  cp "$APP_DIR/docs-source/MARKET_ANALYSIS.md" "$APP_DIR/business-docs/"

[ -f "$APP_DIR/docs-source/USER_STORIES.md" ] && \
  cp "$APP_DIR/docs-source/USER_STORIES.md" "$APP_DIR/business-docs/"

[ -f "$APP_DIR/docs-source/360_AUDIT_REPORT.md" ] && \
  cp "$APP_DIR/docs-source/360_AUDIT_REPORT.md" "$APP_DIR/business-docs/"

# ── Step 5: Copy source code ─────────────────────────────────────────────
echo "💻 Step 5: Copying source code..."

rsync -a \
  --exclude='node_modules' \
  --exclude='.next' \
  --exclude='.git' \
  --exclude='.agent' \
  --exclude='.vercel' \
  --exclude='.firebase' \
  --exclude='.DS_Store' \
  --exclude='.env' \
  --exclude='.env.backup_neon' \
  --exclude='dev.db' \
  --exclude='dev.db-journal' \
  --exclude='tsconfig.tsbuildinfo' \
  --exclude='next-env.d.ts' \
  --exclude='ROPA Para Molly' \
  --exclude='build_gift.sh' \
  --exclude='Gemini_Generated_Image_*' \
  --exclude='src/generated' \
  "$PROJ_DIR/" "$APP_DIR/source-code/"

echo "   ✅ Source code copied ($(find "$APP_DIR/source-code" -type f | wc -l | tr -d ' ') files)"

# ── Step 6: Create App Files README ───────────────────────────────────────
cat > "$APP_DIR/README.md" << 'README_EOF'
# 📁 ROPA App Files

This folder contains everything needed to set up and manage the ROPA platform.

## What's Here

| Folder | What's Inside | Who It's For |
|--------|-------------|-------------|
| **guides/** | Step-by-step setup instructions, user guides, environment config | Your IT person |
| **business-docs/** | Market analysis, business strategy, audit reports | Anyone interested in the business side |
| **source-code/** | The complete application source code | Your IT person |

## Quick Start for IT Person

1. Open `guides/Setup Guide.md` — it has numbered steps from zero to live app
2. The `.env.example` in `guides/` shows every config variable
3. The `source-code/` folder is the complete Next.js project — run `npm install && npm run dev`

## The App Is Already Live

The app is currently deployed at **https://ropa-trade.vercel.app** — this folder is for when Molly wants to take ownership and deploy under her own account.
README_EOF

# ── Step 7: Create ZIP ───────────────────────────────────────────────────
echo "📦 Step 6: Creating ZIP..."

ZIP_NAME="ROPA-For-Molly.zip"
cd "$PROJ_DIR"
rm -f "$ZIP_NAME"

# Only include the new structure (2 root docs + App Files folder)
zip -r "$ZIP_NAME" \
  "ROPA Para Molly/Gift Letter.md" \
  "ROPA Para Molly/AI Assistant - Upload to ChatGPT.md" \
  "ROPA Para Molly/App Files" \
  -x "*.DS_Store" \
  > /dev/null 2>&1

ZIP_SIZE=$(du -sh "$ZIP_NAME" | cut -f1)
echo "   ✅ ZIP: $ZIP_NAME ($ZIP_SIZE)"

# ── Done ──────────────────────────────────────────────────────────────────
echo ""
echo "═══════════════════════════════════════════════════════"
echo "  🎁 Gift package ready!"
echo ""
echo "  ROPA Para Molly/"
echo "    📄 Gift Letter.md"
echo "    📄 AI Assistant - Upload to ChatGPT.md"
echo "    📁 App Files/"
echo "       ├── guides/"
echo "       ├── business-docs/"
echo "       └── source-code/"
echo ""
echo "  ZIP: $ZIP_NAME ($ZIP_SIZE)"
echo "═══════════════════════════════════════════════════════"
