#!/usr/bin/env bash

# ============================================================
# TrLaucher — Unified Cross-Platform Build Pipeline Runner
# Supports: Web, Android APK, Windows/Linux/macOS PC Apps
# ============================================================

# ANSI colors for beautiful logging
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}====================================================${NC}"
echo -e "${CYAN}          STARTING TRLAUNCHER UNIFIED BUILD         ${NC}"
echo -e "${CYAN}====================================================${NC}"

# Ensure we start in the correct directory
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR"

# Artifact outputs tracking variables
APK_PATH="N/A (Skipped)"
APK_SIZE="N/A"
PC_PATH="N/A (Skipped)"
PC_SIZE="N/A"
PC_TYPE="N/A"

# ── STEP 1: BUILD WEB CORE ──────────────────────────────────
echo -e "\n${BLUE}[1/3] Building Web Core...${NC}"
if npm run build; then
  echo -e "${GREEN}✔ Web Core compiled successfully (dist/ folder is ready).${NC}"
else
  echo -e "${RED}✘ Web Core compilation failed. Aborting build process.${NC}"
  exit 1
fi

# ── STEP 2: BUILD ANDROID APK (CAPACITOR) ───────────────────
echo -e "\n${BLUE}[2/3] Building Android APK...${NC}"

HAS_ANDROID_SDK=false
if [ -d "android" ]; then
  # Check if Java is installed
  if type java >/dev/null 2>&1; then
    # Check if SDK directory is configured
    if [ -n "$ANDROID_HOME" ] || [ -n "$ANDROID_SDK_ROOT" ] || [ -f "android/local.properties" ]; then
      HAS_ANDROID_SDK=true
    fi
  fi
fi

if [ "$HAS_ANDROID_SDK" = true ]; then
  echo -e "${CYAN}Android environment detected. Syncing Capacitor...${NC}"
  if npx cap sync android; then
    echo -e "${CYAN}Running gradle build command...${NC}"
    cd android
    if ./gradlew assembleDebug; then
      cd "$DIR"
      APK_PATH="android/app/build/outputs/apk/debug/app-debug.apk"
      if [ -f "$APK_PATH" ]; then
        APK_SIZE=$(du -sh "$APK_PATH" | cut -f1)
        echo -e "${GREEN}✔ Android APK compiled successfully at $APK_PATH ($APK_SIZE)${NC}"
      else
        echo -e "${YELLOW}⚠ Build command finished but APK file not found at expected path.${NC}"
      fi
    else
      cd "$DIR"
      echo -e "${YELLOW}⚠ Gradle build command failed. Skipping APK creation step.${NC}"
    fi
  else
    echo -e "${YELLOW}⚠ Capacitor sync failed. Skipping APK creation step.${NC}"
  fi
else
  echo -e "${YELLOW}⚠ Android SDK or local.properties not configured/found. Skipping APK creation.${NC}"
fi

# ── STEP 3: BUILD PC APP (ELECTRON) ─────────────────────────
echo -e "\n${BLUE}[3/3] Packaging PC App (Electron)...${NC}"

HAS_ELECTRON=false
if grep -q '"electron-builder"' package.json; then
  HAS_ELECTRON=true
fi

if [ "$HAS_ELECTRON" = true ]; then
  # Detect Host OS
  OS="linux"
  if [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]]; then
    OS="win"
  elif [[ "$OSTYPE" == "darwin"* ]]; then
    OS="mac"
  fi

  echo -e "${CYAN}Packaging Electron app for $OS target...${NC}"
  BUILD_CMD="npm run build:pc"
  if [ "$OS" = "linux" ]; then
    echo -e "${CYAN}Linux host detected. Building BOTH Windows (.exe) and Linux (.AppImage) targets...${NC}"
    BUILD_CMD="npx electron-builder --win --linux"
  fi

  if $BUILD_CMD; then
    # Search for compiled binaries in output directory (dist-desktop)
    if [ -d "dist-desktop" ]; then
      EXE_BIN=$(find dist-desktop -name "*.exe" | head -n 1)
      APPIMAGE_BIN=$(find dist-desktop -name "*.AppImage" | head -n 1)
      DEB_BIN=$(find dist-desktop -name "*.deb" | head -n 1)
      DMG_BIN=$(find dist-desktop -name "*.dmg" | head -n 1)

      if [ -n "$EXE_BIN" ] && [ -f "$EXE_BIN" ]; then
        EXE_SIZE=$(du -sh "$EXE_BIN" | cut -f1)
      fi
      if [ -n "$APPIMAGE_BIN" ] && [ -f "$APPIMAGE_BIN" ]; then
        APPIMAGE_SIZE=$(du -sh "$APPIMAGE_BIN" | cut -f1)
      fi
      if [ -n "$DEB_BIN" ] && [ -f "$DEB_BIN" ]; then
        DEB_SIZE=$(du -sh "$DEB_BIN" | cut -f1)
      fi
      if [ -n "$DMG_BIN" ] && [ -f "$DMG_BIN" ]; then
        DMG_SIZE=$(du -sh "$DMG_BIN" | cut -f1)
      fi
      
      echo -e "${GREEN}✔ PC app packaging completed successfully.${NC}"
    else
      echo -e "${YELLOW}⚠ Output desktop directory not created.${NC}"
    fi
  else
    echo -e "${YELLOW}⚠ Electron packager failed. Skipping PC app package step.${NC}"
  fi
else
  echo -e "${YELLOW}⚠ electron-builder package not found in package.json. Skipping PC packaging.${NC}"
fi

# ── STEP 4: OUTPUT COMPLETE SUMMARY CARD ─────────────────────
echo -e "\n"
echo -e "${GREEN}====================================================${NC}"
echo -e "${GREEN}               TRLAUNCHER BUILD COMPLETE            ${NC}"
echo -e "${GREEN}====================================================${NC}"
echo -e "${CYAN} Android APK:${NC}  $APK_PATH"
if [ "$APK_PATH" != "N/A (Skipped)" ] && [ -f "$APK_PATH" ]; then
  echo -e "   - Size: $APK_SIZE"
fi

echo -e "${CYAN} Output Binaries:${NC}"
if [ -n "$EXE_BIN" ] && [ -f "$EXE_BIN" ]; then
  echo -e "   - Windows (.exe):   $EXE_BIN ($EXE_SIZE)"
fi
if [ -n "$APPIMAGE_BIN" ] && [ -f "$APPIMAGE_BIN" ]; then
  echo -e "   - Linux (.AppImage): $APPIMAGE_BIN ($APPIMAGE_SIZE)"
fi
if [ -n "$DEB_BIN" ] && [ -f "$DEB_BIN" ]; then
  echo -e "   - Linux Debian (.deb): $DEB_BIN ($DEB_SIZE)"
fi
if [ -n "$DMG_BIN" ] && [ -f "$DMG_BIN" ]; then
  echo -e "   - macOS (.dmg):      $DMG_BIN ($DMG_SIZE)"
fi
if [ -z "$EXE_BIN" ] && [ -z "$APPIMAGE_BIN" ] && [ -z "$DEB_BIN" ] && [ -z "$DMG_BIN" ]; then
  echo -e "   - No desktop packages generated."
fi
echo -e "${GREEN}====================================================${NC}"
