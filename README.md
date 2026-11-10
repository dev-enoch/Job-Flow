# Job Flow

A job application tracker for iOS and Android. Every application, its status and its follow-up date live on the phone, and the app works without a network.

Built with Expo and React Native, in TypeScript.

## What it does

- Track applications with company, role, location, salary, source URL and date applied
- Move an application through six stages: applied, interviewing, offered, rejected, accepted, declined
- Dashboard with a progress chart and upcoming reminders
- Insights tab with a simple funnel: total applications, interviews, offers, rejections
- Reminders through local notifications, scheduled per application
- Add and edit screens as modals, so the list keeps its place
- Backup to a JSON file and restore from one, through the document picker and share sheet
- Sign in with Google
- Light and dark themes, custom splash, onboarding screens

## Data handling

Applications are stored in SQLite on the device (`jobflow.db`, write ahead logging on). An earlier AsyncStorage store is migrated on first launch, and changes made offline are queued in a pending list so a sync can replay them later.

Sign in tokens are kept in Expo SecureStore, not AsyncStorage.

## Stack

| Concern | Choice |
| --- | --- |
| Runtime | Expo SDK 53, React Native 0.79, React 19 |
| Navigation | expo-router 5 |
| Storage | expo-sqlite, AsyncStorage for migration |
| Forms | react-hook-form with zod |
| UI | React Native Paper, Moti, react-native-svg-charts, lucide icons |
| Documents | expo-document-picker, expo-sharing, react-native-pdf |
| Auth | Google Sign-In |
| Builds | EAS Build, three variants (development, preview, production) |

## Project layout

```
app/(tabs)/        dashboard, applications list, insights, settings
app/(modals)/      add job, job detail, edit, backup, restore, about, privacy
components/        job cards, status controls, charts, onboarding, UI primitives
context/           jobs, auth, theme, notifications
services/          JobService (SQLite), BackupService
schemas/           zod schemas
constants/         colours and the status model
```

## Running locally

```bash
npm install
npx expo start
```

Use `npx expo start --dev-client` when testing Google Sign-In and notifications, since they need a development build rather than Expo Go.

Builds:

```bash
eas build --profile development --platform android
eas build --profile production --platform ios
```

The application identifiers are `com.jobflow.app`, with `.dev` and `.preview` suffixes for the other two variants.

## Environment variables

```bash
GOOGLE_WEB_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
IOS_CLIENT_ID=
EXPO_PUBLIC_SCHEME=
APP_VARIANT=
```

## Security note

This repository has a committed `.env` file containing a Google OAuth client secret. That secret should be rotated in the Google Cloud console, removed from git history, and loaded from EAS secrets or a local `.env.local` from now on. The repo is public, so treat the current value as exposed.

## Author

Enoch Philip Dibal, https://devenoch.cv
