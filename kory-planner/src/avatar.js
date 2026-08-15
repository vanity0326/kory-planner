// Avatar XP system. Kept deliberately simple: complete an assignment, gain XP,
// level up every 100 XP. Visual richness belongs on the village "feeling" screen,
// not here — this file is just the math and the archive/graduation mechanic.

const XP_PER_ASSIGNMENT = 10;
const XP_PER_LEVEL = 100;

function levelForXP(xp) {
  return Math.floor(xp / XP_PER_LEVEL) + 1;
}

function xpIntoLevel(xp) {
  return xp % XP_PER_LEVEL;
}

// Stage names are cosmetic labels tied to level — swap for real art direction later.
const STAGE_NAMES = ['Sprout', 'Sprout', 'Sapling', 'Sapling', 'Young tree', 'Young tree', 'Grown tree', 'Grown tree', 'Elder tree', 'Elder tree'];
function stageNameForLevel(level) {
  return STAGE_NAMES[Math.min(level - 1, STAGE_NAMES.length - 1)];
}

async function awardXP(amount = XP_PER_ASSIGNMENT) {
  const avatar = await window.PlannerStorage.getAvatar();
  avatar.xp += amount;
  avatar.level = levelForXP(avatar.xp);
  await window.PlannerStorage.saveAvatar(avatar);
  return avatar;
}

function currentSchoolYearLabel() {
  // School year label like "2026-27", based on a July cutover.
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth() + 1;
  const startYear = m >= 7 ? y : y - 1;
  return `${startYear}-${String(startYear + 1).slice(2)}`;
}

// Year-end archive: current avatar graduates into the permanent village,
// assignments/streaks get frozen into archive-{year}, and a fresh avatar starts.
// This is parent-only — triggered from Settings, never from Kory's nav path.
async function runYearEndArchive() {
  const yearLabel = currentSchoolYearLabel();
  const [avatar, village, assignments, streaks, settings] = await Promise.all([
    window.PlannerStorage.getAvatar(),
    window.PlannerStorage.getVillage(),
    window.PlannerStorage.getAssignments(),
    window.PlannerStorage.getStreaks(),
    window.PlannerStorage.getSettings(),
  ]);

  await window.PlannerStorage.saveArchive(yearLabel, { assignments, streaks, avatarAtArchive: avatar });

  village.push({ yearLabel, finalXP: avatar.xp, finalLevel: avatar.level, stageName: stageNameForLevel(avatar.level) });
  await window.PlannerStorage.saveVillage(village);

  await window.PlannerStorage.saveAvatar({ xp: 0, level: 1, schoolYearLabel: currentSchoolYearLabel() });
  await window.PlannerStorage.saveAssignments([]);
  await window.PlannerStorage.saveStreaks({ current: 0, lastCompletedDate: null, history: [] });

  settings.archiveTriggeredAt = new Date().toISOString();
  await window.PlannerStorage.saveSettings(settings);

  return { yearLabel };
}

window.PlannerAvatar = {
  awardXP,
  levelForXP,
  xpIntoLevel,
  stageNameForLevel,
  currentSchoolYearLabel,
  runYearEndArchive,
  XP_PER_LEVEL,
};
