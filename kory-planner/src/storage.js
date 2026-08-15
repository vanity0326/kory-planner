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
  return data || { current: 0, lastCompletedDate: null, history: [] };
}

async function saveStreaks(streaks) {
  return Storage.set('streaks', streaks);
}

async function getSettings() {
  const data = await Storage.get('settings');
  return data || {
    rewardThresholds: [],
    seasonalOverride: null, // null = auto-detect from date
    archiveTriggeredAt: null,
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
};
