// Single source of truth for reading/writing shared data.
// Every view goes through here — never calls fetch() directly for data.

const Storage = {
  async get(key) {
    try {
      const res = await fetch(`/.netlify/functions/get-data?key=${encodeURIComponent(key)}`);
      if (!res.ok) {
        const detail = await res.text().catch(() => '');
        console.error(`Storage.get(${key}) failed: ${res.status} ${detail}`);
        return null; // fall back to "start empty" instead of crashing the app
      }
      const { value } = await res.json();
      return value; // null if never written yet
    } catch (err) {
      console.error(`Storage.get(${key}) network error:`, err);
      return null;
    }
  },

  async set(key, value) {
    const res = await fetch('/.netlify/functions/save-data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, value }),
    });
    if (!res.ok) throw new Error(`Failed to save ${key}`);
    return res.json();
  },
};

// ---- Convenience helpers for the specific keys this app uses ----

async function getAssignments() {
  const data = await Storage.get('assignments');
  return data || [];
}

async function saveAssignments(assignments) {
  return Storage.set('assignments', assignments);
}

async function getStreaks() {
  const data = await Storage.get('streaks');
  const defaults = {
    completion: { current: 0, lastCompletedDate: null, history: [] },
    entry: { current: 0, lastEntryDate: null, history: [] },
  };
  if (!data) return defaults;

  // Migrate old flat shape (from before the race/entry-streak rebuild) into
  // the new nested shape, so existing saved data doesn't crash every screen
  // that reads streaks.completion / streaks.entry.
  if (!data.completion && typeof data.current === 'number') {
    return {
      completion: { current: data.current, lastCompletedDate: data.lastCompletedDate || null, history: data.history || [] },
      entry: defaults.entry,
    };
  }

  // Defensive: fill in either half if somehow missing.
  return {
    completion: data.completion || defaults.completion,
    entry: data.entry || defaults.entry,
  };
}

async function saveStreaks(streaks) {
  return Storage.set('streaks', streaks);
}

async function getHomePractice() {
  const data = await Storage.get('homePractice');
  return data || [];
}

async function saveHomePractice(entries) {
  return Storage.set('homePractice', entries);
}

async function getSettings() {
  const data = await Storage.get('settings');
  return data || {
    rewardThresholds: [],
    seasonalOverride: null, // null = auto-detect from date
    archiveTriggeredAt: null,
    // Scaffolding level for step-split templates: 'full' | 'partial' | 'blank'.
    // App can SUGGEST a change based on step success rate, but never applies
    // it automatically — parent approves via Settings either direction.
    scaffoldingLevel: 'full',
    // Recent step outcomes, used only to compute the suggestion above.
    // Each entry: { onTime: boolean, at: ISOString }. Capped at last 12.
    stepOutcomeHistory: [],
  };
}

async function saveSettings(settings) {
  return Storage.set('settings', settings);
}

async function getAvatar() {
  const data = await Storage.get('avatar-current');
  return data || { xp: 0, level: 1, schoolYearLabel: null };
}

async function saveAvatar(avatar) {
  return Storage.set('avatar-current', avatar);
}

async function getVillage() {
  const data = await Storage.get('village');
  return data || [];
}

async function saveVillage(village) {
  return Storage.set('village', village);
}

async function saveArchive(yearLabel, snapshot) {
  return Storage.set(`archive-${yearLabel}`, snapshot);
}

async function getArchive(yearLabel) {
  return Storage.get(`archive-${yearLabel}`);
}

async function getDailyPracticeSubjects() {
  const data = await Storage.get('dailyPracticeSubjects');
  return data || [];
}

async function saveDailyPracticeSubjects(list) {
  return Storage.set('dailyPracticeSubjects', list);
}

async function getKnownSubjects() {
  const data = await Storage.get('subjects');
  return data || [];
}

async function addKnownSubject(subject) {
  const subjects = await getKnownSubjects();
  const exists = subjects.some(s => s.toLowerCase() === subject.toLowerCase());
  if (!exists) {
    subjects.push(subject);
    await Storage.set('subjects', subjects);
  }
}

// Wipes testing/trial data (assignments, streaks, home practice, avatar
// XP/level/badges, known-subjects list, step-outcome history) WITHOUT
// touching Village/Rafters or creating an archive entry — unlike
// runYearEndArchive, this is not a "graduate the year" action, just a
// clean slate. Deliberately preserves parent-configured settings
// (rewardThresholds, seasonalOverride, scaffoldingLevel) since those are
// decisions, not test artifacts.
async function clearTestData() {
  await Promise.all([
    saveAssignments([]),
    saveHomePractice([]),
    saveStreaks({
      completion: { current: 0, lastCompletedDate: null, history: [] },
      entry: { current: 0, lastEntryDate: null, history: [] },
    }),
    saveAvatar({ xp: 0, level: 1, badges: [], totalSelfEntries: 0, schoolYearLabel: null }),
    Storage.set('subjects', []),
  ]);
  const settings = await getSettings();
  settings.stepOutcomeHistory = [];
  await saveSettings(settings);
}

window.PlannerStorage = {
  getAssignments,
  saveAssignments,
  getStreaks,
  saveStreaks,
  getSettings,
  saveSettings,
  getAvatar,
  saveAvatar,
  getVillage,
  saveVillage,
  saveArchive,
  getArchive,
  getKnownSubjects,
  addKnownSubject,
  getHomePractice,
  saveHomePractice,
  clearTestData,
  getDailyPracticeSubjects,
  saveDailyPracticeSubjects,
};
