# Faisal Book Depot — Android Build & Deployment Guide

## Architecture Overview

```
Monorepo (pnpm workspaces)
├── artifacts/api-server/          # Express API (shared by both apps)
├── artifacts/customer-app/        # Web storefront (React/Vite)
├── artifacts/customer-mobile/     # Customer Android App (Expo)  ← NEW
├── artifacts/employee-app/        # Staff Android App (Expo)     ← EXISTING
├── lib/db/                        # PostgreSQL schema (Drizzle ORM)
├── lib/api-spec/                  # OpenAPI spec
└── lib/api-client-react/          # Generated React Query hooks
```

---

## Prerequisites

```bash
# Install EAS CLI globally
npm install -g eas-cli

# Login to Expo account
eas login

# Your Expo account username: [your-expo-username]
```

---

## STEP 1: Set Your Production Domain

After publishing your Replit app, update the `EXPO_PUBLIC_DOMAIN` in both eas.json files:

**artifacts/customer-mobile/eas.json** — change `production.env.EXPO_PUBLIC_DOMAIN`
**artifacts/employee-app/eas.json** — change `production.env.EXPO_PUBLIC_DOMAIN`

Replace `your-production-domain.replit.app` with your actual Replit deployment domain.

---

## STEP 2: Link Projects to EAS

```bash
# Customer App
cd artifacts/customer-mobile
eas init

# Staff App
cd ../employee-app
eas init
```

This generates a `projectId` in each `app.json` under `expo.extra.eas.projectId`.

---

## STEP 3: Build APK (for testing)

### Customer App — APK
```bash
cd artifacts/customer-mobile
eas build --platform android --profile preview
```

### Staff App — APK
```bash
cd artifacts/employee-app
eas build --platform android --profile preview
```

**Download:** EAS will provide a download link when complete (~15-20 minutes).

---

## STEP 4: Build AAB (for Play Store)

### Customer App — AAB
```bash
cd artifacts/customer-mobile
eas build --platform android --profile production
```

### Staff App — AAB
```bash
cd artifacts/employee-app
eas build --platform android --profile production
```

---

## STEP 5: Android Signing

EAS handles signing automatically. For production:

1. EAS creates a keystore on first production build
2. **IMPORTANT:** Download and save your keystore from EAS dashboard
3. Store it securely — losing it means you cannot update the app

To use your own keystore:
```bash
eas credentials
```

---

## STEP 6: Play Store Setup

### For Each App:

1. Go to [Google Play Console](https://play.google.com/console)
2. Create new app
3. Fill in app details using `/docs/play-store-assets.md`
4. Upload the AAB file
5. Set up pricing (free)
6. Add screenshots (see checklist in play-store-assets.md)
7. Add privacy policy URL
8. Submit for review

### Package IDs:
- Customer App: `com.faisalbookdepot.khanpur`
- Staff App: `com.faisalbookdepot.staff`

---

## STEP 7: App Icons

Generated icons are in `attached_assets/`:
- `icon-customer.png` → Copy to `artifacts/customer-mobile/assets/images/icon.png`
- `icon-staff.png` → Copy to `artifacts/employee-app/assets/images/icon.png`
- `splash-customer.png` → Copy to `artifacts/customer-mobile/assets/images/splash.png`
- `feature-graphic.png` → Upload to Play Store listing

---

## White-Label Deployment (New Clients)

To deploy for a new client, change ONLY:

### 1. Database Settings (no code changes)
```sql
UPDATE settings SET
  store_name = 'New Client Store',
  store_phone = '+92-XXX-XXXXXXX',
  store_email = 'info@newclient.com',
  store_address = 'City, Pakistan',
  company_name = 'New Client Company'
WHERE id = 1;
```

### 2. App Config (minimal code changes)
In `app.json` for each app, change:
- `expo.name` — App display name
- `expo.android.package` — Package ID
- `expo.ios.bundleIdentifier` — iOS bundle ID
- `expo.extra.eas.projectId` — New EAS project ID

### 3. Domain
In `eas.json`, update `EXPO_PUBLIC_DOMAIN` to the new client's domain.

### 4. Icons
Replace `assets/images/icon.png` and `assets/images/splash.png` with client's brand assets.

---

## Useful Commands

```bash
# Check build status
eas build:list

# View build logs
eas build:view [build-id]

# Submit to Play Store
eas submit --platform android --latest

# Update OTA (without rebuild)
eas update --branch production --message "Bug fix"

# Check current credentials
eas credentials
```

---

## Environment Variables

| Variable | Purpose | Required |
|---|---|---|
| `EXPO_PUBLIC_DOMAIN` | API server domain | Yes |
| `DATABASE_URL` | PostgreSQL connection | API server only |
| `SESSION_SECRET` | JWT signing key | API server only |

---

## Troubleshooting

**Build fails with "node_modules not found"**
```bash
# In the customer-mobile directory
pnpm install
```

**API calls fail on device**
- Check `EXPO_PUBLIC_DOMAIN` in eas.json matches your live domain
- Ensure the API server is deployed and accessible

**App crashes on startup**
```bash
eas build:view [build-id]  # Check build logs
```
