# Kory's Planner

An ADHD-friendly homework and chore planner built for one family, one kid. Shared between parent and child with no logins, deployed on Netlify with Netlify Blobs for durable storage meant to last for years, not just a school term.

## Why this exists

Off-the-shelf assignment trackers (like MyHomework) are built to manage everything. This is built to manage attention instead — fewer decisions, less visual noise, and a Today view that never hands out an excuse to procrastinate.

## Design principles this app follows

- **No due-today/due-tomorrow labels.** Only priority order signals urgency — a due date visible in the UI becomes a reason to wait.
- **Current work first, then past due (furthest-overdue first), then done.** Kory keeps moving forward instead of getting stuck staring at what's already late.
- **Overdue visual weight escalates with days overdue** — thicker accent bar, darker tag, a day count — but stays a quiet accent, never a shaming red banner.
- **"Doing" screens (Today, Add assignment, Reports) stay static year-round.** No seasonal decoration, no animated motion — peripheral movement is a real attention cost.
- **"Feeling" screens (Village, app shell chrome) get the seasonal skins and richer visuals** — snowflakes in winter, pool floats in summer, leaves in fall, flowers/rain in spring, a birthday cake on November 23.
- **Everything Kory needs is fully open to him** — no separate login, no locked features on his own progress.
- **Parent-only settings are de-prioritized, not locked** — reward thresholds, seasonal overrides, and the year-end archive trigger sit behind a small gear icon off his main nav, not behind a password.

## What's built

- **Today view** — sorted (current work → past due, furthest-overdue first → completed), tap-to-complete, streak counter.
- **Add assignment** — subject, title, due date only. No optional fields to skip filling out.
- **Reports** — completion rate, streak metric cards, CSV export, print/save-as-PDF export.
- **Village** — this year's avatar (XP bar, level, stage name) plus a grid of every past year's graduated avatar, permanently.
- **Settings** (gear icon, off Kory's main nav) — reward thresholds editor, seasonal skin override, calendar feed URL, year-end archive trigger.
- **Calendar feed** — one-way `.ics` feed of open assignments' due dates, subscribable from Google Calendar. Editing in Calendar never writes back here.
- **Storage** — Netlify Blobs via three functions (`get-data`, `save-data`, `calendar-feed`), with siteID/token passed explicitly (see Deploying below).
- **PWA basics** — manifest + service worker + icons for home-screen install.

## Still placeholder / simple on purpose

- **Avatar visuals** are a single icon that doesn't change shape — only the label/level text changes. Real art direction is a future pass once a visual style is chosen.
- **Year-end archive is real and irreversible from the UI.** It wipes active assignments/streaks after archiving them (confirmed via a browser dialog before running). Test on dummy data before using it for real.
- **Reward thresholds are stored but not yet enforced.** Nothing currently notifies Kory or a parent when he crosses one — it's a reference list maintained in Settings, not an automatic trigger, for now.

## Local setup

```bash
npm install
```

## Deploying (GitHub + Netlify)

1. Push this project to a GitHub repository — see GitHub's own "uploading an existing file" flow if you're new to it; no command-line git required.
2. In Netlify, connect the site to that repo (Site settings → Build & deploy → Link repository), rather than dragging and dropping a zip. A Git-connected deploy runs `npm install` automatically and is more reliable for Netlify Blobs' automatic context than a manual drop deploy.
3. **Required environment variables** — Netlify's automatic Blobs context doesn't always get wired in on every deploy type, so this project passes siteID and token explicitly:
   - `BLOBS_SITE_ID` — from Site settings → General → Site details → Site ID
   - `BLOBS_TOKEN` — a personal access token from User settings → Applications → New access token
   Add both under Site settings → Environment variables, then trigger a fresh deploy (env vars only take effect on a new deploy).
4. After deploying, open the site, add a test assignment, then check the Netlify dashboard under **Blobs** to confirm the `kory-planner` store and its keys show up.
5. To subscribe to the calendar feed: open Settings in the app, copy the feed URL, then in Google Calendar go to Settings → Add calendar → From URL, and paste it.

## Data model (Netlify Blobs keys)

| Key | Shape |
|---|---|
| `assignments` | Array of `{ id, subject, title, dueDate, done, createdAt, completedAt? }` |
| `streaks` | `{ current, lastCompletedDate, history: [] }` |
| `settings` | `{ rewardThresholds: [{xp, reward}], seasonalOverride, archiveTriggeredAt }` |
| `avatar-current` | `{ xp, level, schoolYearLabel }` |
| `village` | Array of `{ yearLabel, finalXP, finalLevel, stageName }` |
| `archive-{year}` | `{ assignments, streaks, avatarAtArchive }` snapshot, written at year-end |
