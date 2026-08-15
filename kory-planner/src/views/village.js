// Kory's All-time Achievements: the "feeling" screen. Seasonal decoration,
// richer visuals, and static-but-colorful reward payoffs belong here —
// unlike Today/Add assignment/Reports, which stay calm year-round.
//
// Two accumulation mechanics live here:
//   - Trophy Case: earned mid-year from logging milestones, shown both as a
//     shelf AND as small accessory chips around the avatar itself, so the
//     avatar visibly "wears" its history as it grows.
//   - Rafters: past years' fully-graduated avatars, added once a year at
//     archive time — a slower, longer-arc payoff underneath. Framed as
//     retired banners hanging in the rafters, athlete-team style.
//
// NOTE: the route key and internal CSS class stay "village" for now to
// keep the diff small — only the visible title/copy changed to the
// athlete theme. Fine to rename the class later if this sticks.

function xpBarWidth(xp) {
  const pct = window.PlannerAvatar.xpIntoLevel(xp) / window.PlannerAvatar.XP_PER_LEVEL * 100;
  return `${Math.round(pct)}%`;
}

function stageIcon(level, size) {
  const key = window.PlannerStageIcons.stageKeyForLevel(level);
  const colors = window.PlannerStageIcons.STAGE_COLORS[key];
  return `
    <div class="stage-icon-wrap" style="width: ${size}px; height: ${size}px; background: ${colors.bg};">
      ${window.PlannerStageIcons.ICONS[key]}
    </div>
  `;
}

async function renderVillage(container) {
  const [avatar, village] = await Promise.all([
    window.PlannerStorage.getAvatar(),
    window.PlannerStorage.getVillage(),
  ]);

  const stageName = window.PlannerAvatar.stageNameForLevel(avatar.level);
  const badges = avatar.badges || [];

  container.innerHTML = `
    <div class="village-screen">
      <h1>Kory's All-time Achievements</h1>

      <div class="avatar-card">
        ${stageIcon(avatar.level, 56)}
        <div class="avatar-info">
          <p class="avatar-stage">${stageName} · level ${avatar.level}</p>
          <div class="xp-track"><div class="xp-fill" style="width: ${xpBarWidth(avatar.xp)};"></div></div>
          <p class="xp-label">${window.PlannerAvatar.xpIntoLevel(avatar.xp)} / ${window.PlannerAvatar.XP_PER_LEVEL} XP to next level</p>
          ${badges.length ? `
            <div class="avatar-accessories">
              ${badges.map(b => `<span class="badge-chip-mini" style="background: ${b.bg}; color: ${b.color};"><i class="ti ${b.icon}" aria-hidden="true"></i></span>`).join('')}
            </div>
          ` : ''}
        </div>
      </div>

      ${badges.length ? `
        <h2>Trophy Case</h2>
        <div class="badge-shelf">
          ${badges.map(b => `
            <div class="badge-chip" style="background: ${b.bg}; color: ${b.color};">
              <i class="ti ${b.icon}" aria-hidden="true"></i>
              <span>${b.count} logged</span>
            </div>
          `).join('')}
        </div>
      ` : `
        <h2>Trophy Case</h2>
        <p class="field-hint">Keep logging your own assignments — the first trophy shows up here.</p>
      `}

      <h2>Rafters</h2>
      ${village.length ? `
        <div class="rafters-grid">
          ${village.map(v => {
            const key = stageKeyFromName(v.stageName);
            const colors = window.PlannerStageIcons.STAGE_COLORS[key];
            return `
              <div class="rafter-banner" style="background: ${colors.bg}; border-color: ${colors.accent};">
                <div class="rafter-hook" style="background: ${colors.accent};"></div>
                ${stageIcon(levelFromStageName(v.stageName, v.finalLevel), 40)}
                <p class="rafter-year">${v.yearLabel}</p>
                <p class="rafter-stage" style="color: ${colors.accent};">${v.stageName} · Lv ${v.finalLevel}</p>
              </div>
            `;
          }).join('')}
        </div>
      ` : `
        <p class="field-hint">Nothing hanging up here yet — this year's banner goes up at year-end.</p>
      `}
    </div>
  `;
}

// Archived village entries only stored stageName (a label) historically,
// not the numeric level needed to pick an icon variant within a stage —
// finalLevel covers that going forward. Falls back to the first level in
// that stage's range if an older archive predates finalLevel being saved.
function levelFromStageName(stageName, finalLevel) {
  if (typeof finalLevel === 'number') return finalLevel;
  const key = stageKeyFromName(stageName);
  const idx = ['rookie', 'starter', 'rising-star', 'all-star', 'mvp'].indexOf(key);
  return idx >= 0 ? idx * 2 + 1 : 1;
}

function stageKeyFromName(stageName) {
  const map = {
    'Rookie': 'rookie', 'Starter': 'starter', 'Rising Star': 'rising-star',
    'All-Star': 'all-star', 'MVP': 'mvp',
    // Back-compat with archives saved under the old tree-metaphor names.
    'Sprout': 'rookie', 'Sapling': 'starter', 'Young tree': 'rising-star',
    'Grown tree': 'all-star', 'Elder tree': 'mvp',
  };
  return map[stageName] || 'rookie';
}

window.PlannerViews = window.PlannerViews || {};
window.PlannerViews.village = renderVillage;
