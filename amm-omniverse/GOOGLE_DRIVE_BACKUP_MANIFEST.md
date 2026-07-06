# Google Drive Backup Manifest
Date: June 25, 2026
Version: v5 Complete

## How to backup to Google Drive
1. In the app, go to Settings → Backup to Google Drive
2. Or call: import { backupToGoogleDrive } from './src/game/drive/GoogleDriveBackup'
3. Pass your Google OAuth access token
4. Files are uploaded to "AMM-Omniverse-Backup" folder

## What gets saved to Drive
- player-save.json (your cash, XP, missions, vehicles, wallet)
- AMM-Omniverse-Blueprint.md (full technical blueprint)  
- WHAT_YOU_OWN.md (complete feature inventory)
- PRICING-AND-MONETIZATION.md (pricing tiers + revenue)
- VICTOR-HANDOFF.md (what Victor builds vs what's done)
- .env.example (all environment variables)

## To enable Google Drive API
Add to Supabase Google OAuth scopes:
- https://www.googleapis.com/auth/drive.file
Then the access token from Supabase auth includes Drive permission.
