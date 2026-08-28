# Kory's Planner

An ADHD-friendly homework and chore tracker built for one family, one kid. The core mechanic is a "First to Know" race between parent and child to log assignments first — not just a shared checklist. Shared, no logins, deployed on Netlify with Netlify Blobs for durable storage meant to last for years.

## Why this exists

Off-the-shelf assignment trackers (like MyHomework) are built to manage everything. This is built around one specific behavior: getting Kory to proactively tell the app about his own assignments before a parent has to. Everything else — the avatar, XP, streaks — exists to reward that specific habit.

## Core mechanic: the race

- Whoever logs an assignment first gets the win — literally, visibly, tallied weekly ("This week: Kory 4 — Parent 1").
- Entries stand as submitted, even if a detail gets corrected later — the win is about noticing and logging, not data accuracy.
- Logging (not just completing) is what feeds the avatar's XP: self-entry bonus, race-win bonus, and a dedicated entry streak — separate from the completion streak, since planning and executing are different skills.
- No login exists, so "who's entering this" is a lightweight toggle on the Add form, not authentication.

## Design principles

- **No due-today/due-tomorrow labels.** Priority order alone signals urgency.
- **Current work first, then past due (furthest-overdue first), then done.**
- **Overdue visual weight escalates with days overdue**, but stays a quiet accent, never a shaming banner.
- **"Doing" screens stay static year-round.** No seasonal decoration, no animated motion. Seasonal skins live only on "feeling" screens (Village, app shell chrome).
- **Everything Kory needs is fully open to him.** Parent-only settings are de-prioritized behind a gear icon, not locked.
- **Big assignments get split into steps**, template-based, with a scaffolding level (full/partial/blank) that can fade over time — the app *suggests* changing it based on recent step outcomes, but a parent always approves, and it works in both directions (more structure back is offered the same neutral way as less).
- **Only the next-due step shows on Today**, never the whole parent assignment — a big project never looms as one scary line.
- **Tests are a distinct type**, not step-split, with an optional study-session reminder that's itself a loggable, rewarded entry.
- **Home Practice is separate and trust-based** — Kory self-logs outside-school work, no verification, no clawback for false logs.

## What's built

- **Today view** — race tally, entry-streak note, recurring-subject nudge, priority-ordered list with step-collapsing, completed section.
- **Add assignment** — who's-entering toggle, assignment/test type, free-text autocomplete subjects, optional step-split (template + scaffolding-aware) for assignments 5+ days out, optional study-reminder toggle for tests.
- **Home Practice** — separate log, self-reported, hosts study sessions linked to upcoming tests.
- **Village** — this year's avatar (XP/level/stage) + every past year's graduated avatar, permanently.
- **Settings** (gear icon, off Kory's nav) — scaffolding level with bidirectional suggestion banner, reward thresholds, seasonal override, calendar feed URL, year-end archive.
- **Reports** — completion + entry streaks, race tally, home practice count, CSV/print export.
- **Calendar feed** — one-way `.ics` feed of open assignments.
- **Storage** — Netlify Blobs via serverless functions, siteID/token passed explicitly.
- **PWA basics** — manifest, service worker, install icons.

## Known simplifications (worth revisiting)

- **Milestone unlocks currently show a toast, not a real village decoration yet** — the "something new" language is a placeholder; actual milestone rewards need real visual design.
- **Avatar visuals are still a single icon** — real art direction is a future pass.
- **Recurring-pattern nudge is naive** — it looks at weekday-of-entry frequency (3+ matches) rather than anything smarter; worth watching whether it's actually useful once real data accumulates.
- **Scaffolding suggestion logic is a simple threshold** (85%+ on-time → suggest less structure, 40%- → suggest more) over the last 8 step outcomes — tune this once you see it in practice.

## Local setup

```bash
npm install
```

## Deploying (GitHub + Netlify)

1. Push this project to a GitHub repository, making sure `index.html`, `netlify.toml`, `src/`, `netlify/`, `icons/` etc. sit directly at the repo root — not nested inside a wrapper folder. (This tripped us up before: dragging a folder icon into GitHub's uploader nests it one level deeper than intended. Drag what's *inside* the folder, not the folder itself.)
2. In Netlify, connect the site to that repo. Confirm **Base directory** matches wherever your files actually ended up — check this before triggering a deploy, not after.
3. **Required environment variables** (Netlify's automatic Blobs context isn't always reliable):
   - `BLOBS_SITE_ID` — Site settings → General → Site details → Site ID
   - `BLOBS_TOKEN` — User settings → Applications → New access token
4. After deploying, add a test assignment, reload, and confirm it's still there before considering the deploy verified.
5. To subscribe to the calendar feed: Settings in the app → copy the feed URL → Google Calendar → Settings → Add calendar → From URL.

## Data model (Netlify Blobs keys)

| Key | Shape |
|---|---|
| `assignments` | Array of `{ id, subject, title, dueDate, type: 'assignment'\|'test', done, enteredBy: 'kory'\|'parent', enteredAt, createdAt, completedAt?, steps: [{id, title, dueDate, done}] \| null, studyReminder, studySessionLogged }` |
| `homePractice` | Array of `{ id, subject, description, linkedTestId, kind: 'practice'\|'study', loggedAt }` |
| `streaks` | `{ completion: {current, lastCompletedDate, history}, entry: {current, lastEntryDate, history} }` |
| `settings` | `{ rewardThresholds, seasonalOverride, archiveTriggeredAt, scaffoldingLevel, stepOutcomeHistory }` |
| `avatar-current` | `{ xp, level, totalSelfEntries, schoolYearLabel }` |
| `subjects` | Array of strings — captured as-you-go for autocomplete |
| `village` | Array of `{ yearLabel, finalXP, finalLevel, stageName }` |
| `archive-{year}` | `{ assignments, streaks, homePractice, avatarAtArchive }` snapshot, written at year-end |
