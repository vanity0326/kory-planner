// Village: the "feeling" screen. Seasonal decoration, richer visuals, and
// static-but-colorful reward payoffs belong here — unlike Today/Add
// assignment/Reports, which stay calm year-round.
//
// Two accumulation mechanics live here:
//   - Badges: earned mid-year from logging milestones, shown both as a
//     shelf AND as small accessory chips around the avatar itself, so the
//     avatar visibly "wears" its history as it grows.
//   - Village residents: past years' fully-graduated avatars, added once a
//     year at archive time — a slower, longer-arc payoff underneath.

function xpBarWidth(xp) {
  const pct = window.PlannerAvatar.xpIntoLevel(xp) / window.PlannerAvatar.XP_PER_LEVEL * 100;
  return `${Math.round(pct)}%`;
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
      <h1>Kory's Village</h1>

      <div class="avatar-card">
        <div class="avatar-visual" aria-hidden="true"><i class="ti ti-plant-2"></i></div>
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
        <h2>Badge Shelf</h2>
        <div class="badge-shelf">
          ${badges.map(b => `
            <div class="badge-chip" style="background: ${b.bg}; color: ${b.color};">
              <i class="ti ${b.icon}" aria-hidden="true"></i>
              <span>${b.count} logged</span>
            </div>
          `).join('')}
        </div>
      ` : `
        <h2>Badge Shelf</h2>
        <p class="field-hint">Keep logging your own assignments — the first badge shows up here.</p>
      `}

      <h2>Past Years</h2>
      ${village.length ? `
        <div class="village-grid">
          ${village.map(v => `
            <div class="village-resident">
              <i class="ti ti-plant-2" aria-hidden="true"></i>
              <p class="resident-year">${v.yearLabel}</p>
              <p class="resident-stage">${v.stageName}</p>
            </div>
          `).join('')}
        </div>
      ` : `
        <p class="field-hint">Nothing here yet — this year's avatar moves in at year-end.</p>
      `}
    </div>
  `;
}

window.PlannerViews = window.PlannerViews || {};
window.PlannerViews.village = renderVillage;
