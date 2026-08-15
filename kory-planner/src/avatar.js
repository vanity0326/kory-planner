// Avatar XP system. Per spec, the reward economy centers on PROACTIVE
// LOGGING, not just finishing work — that's the whole point of the
// "First to Know" race. XP sources, in the order the parent ranked them
// by expected effectiveness:
//   1. Race win (Kory logs it before the parent does)      — biggest
//   2. Self-entry bonus (Kory logs anything, race or not)
//   3. Entry streak (logging days in a row)
//   4. Step completion (per-step reward on split assignments)
//   5. Milestone unlocks (every ~10 self-entries, variable-timed)
// Plain task completion still gives a small amount — finishing your own
// work should feel good — but it is deliberately NOT the main driver.

const XP = {
  RACE_WIN: 15,
  SELF_ENTRY: 5,
  ENTRY_STREAK_DAY: 5,
  STEP_COMPLETE: 8,
  PLAIN_COMPLETE: 3,
  HOME_PRACTICE: 10,
  STUDY_SESSION: 10,
};

const XP_PER_LEVEL = 100;

// Milestone badges cycle through this set — icon + color pairing, using
// existing app colors so no new art assets are needed. Order is fixed so
// the Nth milestone always gets the same badge (predictable to build,
// still feels varied to a kid since the count/timing is a surprise).
const BADGE_STYLES = [
  { icon: 'ti-star', bg: '#faeeda', color: '#854f0b' },
  { icon: 'ti-trophy', bg: '#eaf3de', color: '#3b6d11' },
  { icon: 'ti-medal', bg: '#e6f1fb', color: '#185fa5' },
  { icon: 'ti-diamond', bg: '#eeedfe', color: '#534ab7' },
  { icon: 'ti-crown', bg: '#fbeaf0', color: '#993556' },
  { icon: 'ti-rocket', bg: '#e1f5ee', color: '#0f6e56' },
  { icon: 'ti-bolt', bg: '#faece7', color: '#993c1d' },
];

function levelForXP(xp) {
  return Math.floor(xp / XP_PER_LEVEL) + 1;
}

function xpIntoLevel(xp) {
  return xp % XP_PER_LEVEL;
}

const STAGE_NAMES = ['Rookie', 'Rookie', 'Starter', 'Starter', 'Rising Star', 'Rising Star', 'All-Star', 'All-Star', 'MVP', 'MVP'];
function stageNameForLevel(level) {
  return STAGE_NAMES[Math.min(level - 1, STAGE_NAMES.length - 1)];
}

async function awardXP(amount) {
  const avatar = await window.PlannerStorage.getAvatar();
  const prevLevel = avatar.level;
  avatar.xp += amount;
  avatar.level = levelForXP(avatar.xp);
  avatar.totalSelfEntries = avatar.totalSelfEntries || 0;
  await window.PlannerStorage.saveAvatar(avatar);
  return { avatar, leveledUp: avatar.level > prevLevel };
}

// Call when Kory (not the parent) enters an assignment. Handles both the
// flat self-entry bonus and, since there's no login and entries just stand
// as submitted, treats every Kory-authored entry as a race win by default —
// simplest honest model without needing to reconcile "who knew first."
async function recordKoryEntry() {
  const avatar = await window.PlannerStorage.getAvatar();
  avatar.totalSelfEntries = (avatar.totalSelfEntries || 0) + 1;
  avatar.badges = avatar.badges || [];

  await awardXP(XP.SELF_ENTRY + XP.RACE_WIN);
  await bumpEntryStreak();

  // Milestone: every 8-12 self-entries (randomized within range so it reads
  // as a surprise, not a predictable "every 10th" pattern).
  const milestoneEvery = 8 + (avatar.totalSelfEntries % 5); // varies 8-12 as count grows
  const isMilestone = avatar.totalSelfEntries > 0 && avatar.totalSelfEntries % milestoneEvery === 0;

  let badge = null;
  if (isMilestone) {
    badge = BADGE_STYLES[avatar.badges.length % BADGE_STYLES.length];
    avatar.badges.push({ ...badge, count: avatar.totalSelfEntries, unlockedAt: new Date().toISOString() });
  }

  await window.PlannerStorage.saveAvatar(avatar);
  return { isMilestone, totalSelfEntries: avatar.totalSelfEntries, badge };
}

async function bumpEntryStreak() {
  const streaks = await window.PlannerStorage.getStreaks();
  const todayStr = new Date().toISOString().slice(0, 10);
  if (streaks.entry.lastEntryDate === todayStr) return; // already counted today

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().slice(0, 10);

  streaks.entry.current = streaks.entry.lastEntryDate === yesterdayStr ? streaks.entry.current + 1 : 1;
  streaks.entry.lastEntryDate = todayStr;
  streaks.entry.history = streaks.entry.history || [];
  streaks.entry.history.push(todayStr);
  await window.PlannerStorage.saveStreaks(streaks);
  await awardXP(XP.ENTRY_STREAK_DAY);
}

async function bumpCompletionStreak() {
  const streaks = await window.PlannerStorage.getStreaks();
  const todayStr = new Date().toISOString().slice(0, 10);
  if (streaks.completion.lastCompletedDate === todayStr) return;

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().slice(0, 10);

  streaks.completion.current = streaks.completion.lastCompletedDate === yesterdayStr ? streaks.completion.current + 1 : 1;
  streaks.completion.lastCompletedDate = todayStr;
  streaks.completion.history = streaks.completion.history || [];
  streaks.completion.history.push(todayStr);
  await window.PlannerStorage.saveStreaks(streaks);
}

function currentSchoolYearLabel() {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth() + 1;
  const startYear = m >= 7 ? y : y - 1;
  return `${startYear}-${String(startYear + 1).slice(2)}`;
}

async function runYearEndArchive() {
  const yearLabel = currentSchoolYearLabel();
  const [avatar, village, assignments, streaks, settings, homePractice] = await Promise.all([
    window.PlannerStorage.getAvatar(),
    window.PlannerStorage.getVillage(),
    window.PlannerStorage.getAssignments(),
    window.PlannerStorage.getStreaks(),
    window.PlannerStorage.getSettings(),
    window.PlannerStorage.getHomePractice(),
  ]);

  await window.PlannerStorage.saveArchive(yearLabel, { assignments, streaks, homePractice, avatarAtArchive: avatar });

  village.push({ yearLabel, finalXP: avatar.xp, finalLevel: avatar.level, stageName: stageNameForLevel(avatar.level) });
  await window.PlannerStorage.saveVillage(village);

  await window.PlannerStorage.saveAvatar({ xp: 0, level: 1, totalSelfEntries: 0, schoolYearLabel: currentSchoolYearLabel() });
  await window.PlannerStorage.saveAssignments([]);
  await window.PlannerStorage.saveHomePractice([]);
  await window.PlannerStorage.saveStreaks({
    completion: { current: 0, lastCompletedDate: null, history: [] },
    entry: { current: 0, lastEntryDate: null, history: [] },
  });

  settings.archiveTriggeredAt = new Date().toISOString();
  await window.PlannerStorage.saveSettings(settings);

  return { yearLabel };
}

// Suggests (never applies) a scaffolding change based on recent step
// outcomes. Direction works both ways — a stretch of misses after a
// reduction is a normal signal to offer MORE structure back, framed the
// same neutral way as offering less. Parent approves in Settings either way.
function suggestScaffoldingChange(currentLevel, stepOutcomeHistory) {
  const recent = stepOutcomeHistory.slice(-8);
  if (recent.length < 4) return null; // not enough data yet

  const onTimeRate = recent.filter(o => o.onTime).length / recent.length;

  if (onTimeRate >= 0.85 && currentLevel !== 'blank') {
    const next = currentLevel === 'full' ? 'partial' : 'blank';
    return { direction: 'reduce', suggestedLevel: next, reason: 'Recent steps have been going smoothly.' };
  }
  if (onTimeRate <= 0.4 && currentLevel !== 'full') {
    const next = currentLevel === 'blank' ? 'partial' : 'full';
    return { direction: 'increase', suggestedLevel: next, reason: 'Steps have been slipping the last little while.' };
  }
  return null;
}

window.PlannerAvatar = {
  awardXP,
  recordKoryEntry,
  bumpEntryStreak,
  bumpCompletionStreak,
  levelForXP,
  xpIntoLevel,
  stageNameForLevel,
  currentSchoolYearLabel,
  runYearEndArchive,
  suggestScaffoldingChange,
  XP,
  XP_PER_LEVEL,
};
