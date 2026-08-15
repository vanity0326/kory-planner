// Village: the "feeling" screen. Seasonal decoration, richer visuals, and any
// small motion belong here (unlike Today/Add Assignment/Reports, which stay
// static). Shows this year's avatar progress plus every graduated avatar
// from past years, permanently.

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

  container.innerHTML = `
    <div class="village-screen">
      <h1>Kory's village</h1>

      <div class="avatar-card">
        <div class="avatar-visual" aria-hidden="true">
          <i class="ti ti-plant-2"></i>
        </div>
        <div class="avatar-info">
          <p class="avatar-stage">${stageName} · level ${avatar.level}</p>
          <div class="xp-track"><div class="xp-fill" style="width: ${xpBarWidth(avatar.xp)};"></div></div>
          <p class="xp-label">${window.PlannerAvatar.xpIntoLevel(avatar.xp)} / ${window.PlannerAvatar.XP_PER_LEVEL} XP to next level</p>
        </div>
      </div>

      <h2>Past years</h2>
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
        <p class="field-hint">Nothing here yet — this year's avatar will move in at year-end.</p>
      `}
    </div>
  `;
}

window.PlannerViews = window.PlannerViews || {};
window.PlannerViews.village = renderVillage;
