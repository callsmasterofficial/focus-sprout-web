# 🌱 Focus Sprout Web Application & Backend API

Focus Sprout Web is the web client and central synchronization backend for the Focus Sprout productivity ecosystem.

Built with **Next.js 16 (App Router)**, **TypeScript**, **Tailwind CSS**, and **Web Audio API**.

---

## ✨ Features

- **Pomodoro Timer**: Circular countdown timer with configurable focus/break sessions, cycle tracking, and emergency exit delay challenges.
- **Botanical Growth Visualizer**: Sprout illustration that grows through 6 stages based on daily completed sessions.
- **Task Management**: Create, prioritize, categorize, and complete tasks with estimated Pomodoro counts.
- **Analytics & History**: 7-day trend chart, 24-hour distribution histogram, monthly streak calendar, and session logs with reflection notes.
- **Procedural Ambient Soundscape**: Web Audio API synthesized pink noise, rain, forest, and ocean waves with zero external audio assets.
- **Distraction Shield**: Website blocker configuration and emergency unlock challenge.
- **Achievements & Badges**: Bronze, Silver, Gold, and Emerald milestone badges.
- **Central REST & Sync API**:
  - `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
  - `POST /api/sync`: Cross-platform delta synchronization for Mobile, Web, and Chrome Extension.
  - `GET /api/tasks`, `POST /api/tasks`, `DELETE /api/tasks`
  - `GET /api/sessions`, `POST /api/sessions`
  - `GET /api/settings`, `PUT /api/settings`
  - `GET /api/rules`, `POST /api/rules`
  - `GET /api/backup`: Export JSON backup, import backup, and seed realistic demo data.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ (tested on Node 22)
- npm, yarn, or pnpm

### Installation

```bash
npm install
```

### Running Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

### Building for Production

```bash
npm run build
npm run start
```

---

## 📁 Project Structure

```
focus-sprout-web/
├── app/
│   ├── page.tsx            # Dashboard with Sprout growth visualizer
│   ├── timer/page.tsx      # Pomodoro timer
│   ├── tasks/page.tsx      # Task management
│   ├── analytics/page.tsx  # Trends & streak calendar
│   ├── sounds/page.tsx     # Ambient audio mixer
│   ├── distraction/        # Distraction shield rules
│   ├── achievements/       # Milestone gallery
│   ├── history/page.tsx    # Focus session logs
│   ├── settings/page.tsx   # Preferences & cloud sync
│   └── api/                # REST & Sync endpoints
├── components/             # Reusable UI components
├── constants/              # Theme palette & sprout stages
├── lib/                    # Atomic database & JWT auth
├── services/               # API & procedural sound services
├── stores/                 # Zustand app store
└── types/                  # TypeScript domain models
```

---

## 🌿 Part of the Focus Sprout Ecosystem

This web application coordinates with:
- **Focus Sprout Mobile App** (React Native / Expo)
- **Focus Sprout Chrome Extension** (Manifest V3)
