// Settings: parent-only editable. Not on Kory's main nav path — reached via
// the gear icon. No password/lock — this is decluttering, not security.

async function renderSettings(container) {
  const settings = await window.PlannerStorage.getSettings();
  const thresholds = settings.rewardThresholds || [];

  container.innerHTML = `
    <div class="doing-screen">
      <h1>Settings</h1>
      <p class="field-hint">Parent-only controls. Not shown on Kory's main nav.</p>

      <h2>Reward thresholds</h2>
      <div id="threshold-list">
        ${thresholds.map((t, i) => `
          <div class="threshold-row" data-index="${i}">
            <span>${t.xp} XP → ${escapeHtmlSettings(t.reward)}</span>
            <button type="button" class="remove-threshold" data-index="${i}" aria-label="Remove">
              <i class="ti ti-x" aria-hidden="true"></i>
            </button>
          </div>
        `).join('') || '<p class="field-hint">No thresholds set yet.</p>'}
      </div>
      <div class="threshold-add">
        <input type="number" id="threshold-xp" placeholder="XP" min="0" style="width: 90px;" />
        <input type="text" id="threshold-reward" placeholder="Reward (e.g. 30 min VR time)" style="flex: 1;" />
        <button type="button" id="add-threshold-btn" class="secondary-btn">Add</button>
      </div>

      <h2>Seasonal skin</h2>
      <select id="season-override">
        <option value="">Auto (based on today's date)</option>
        <option value="winter">Winter</option>
        <option value="spring">Spring</option>
        <option value="summer">Summer</option>
        <option value="fall">Fall</option>
        <option value="birthday">Birthday (Nov 23)</option>
      </select>

      <h2>Calendar feed</h2>
      <p class="field-hint">Subscribe once in Google Calendar (Settings → Add calendar → From URL):</p>
      <div class="ics-url-box" id="ics-url-box"></div>

      <h2>Year-end archive</h2>
      <p class="field-hint">Graduates this year's avatar into the village, archives assignments and streaks, and starts a fresh year. This cannot be undone from here.</p>
      <button type="button" id="archive-btn" class="secondary-btn" style="width: 100%; color: var(--text-danger); border-color: var(--border-danger);">
        Run year-end archive
      </button>
      <p class="field-hint" id="archive-result"></p>

      <button class="secondary-btn" id="back-btn" style="margin-top: 1.5rem; width: 100%;">Back to today</button>
    </div>
  `;

  document.getElementById('season-override').value = settings.seasonalOverride || '';
  const icsUrl = `${window.location.origin}/.netlify/functions/calendar-feed`;
  document.getElementById('ics-url-box').innerHTML = `
    <input type="text" readonly value="${icsUrl}" id="ics-url-input" style="width: 100%; font-size: 13px;" />
  `;

  container.querySelectorAll('.remove-threshold').forEach(btn => {
    btn.addEventListener('click', async () => {
      const i = Number(btn.dataset.index);
      thresholds.splice(i, 1);
      settings.rewardThresholds = thresholds;
      await window.PlannerStorage.saveSettings(settings);
      renderSettings(container);
    });
  });

  document.getElementById('add-threshold-btn').addEventListener('click', async () => {
    const xp = Number(document.getElementById('threshold-xp').value);
    const reward = document.getElementById('threshold-reward').value.trim();
    if (!xp || !reward) return;
    thresholds.push({ xp, reward });
    thresholds.sort((a, b) => a.xp - b.xp);
    settings.rewardThresholds = thresholds;
    await window.PlannerStorage.saveSettings(settings);
    renderSettings(container);
  });

  document.getElementById('season-override').addEventListener('change', async (e) => {
    settings.seasonalOverride = e.target.value || null;
    await window.PlannerStorage.saveSettings(settings);
  });

  document.getElementById('archive-btn').addEventListener('click', async () => {
    const confirmed = confirm('This archives the current year and starts fresh. Continue?');
    if (!confirmed) return;
    const { yearLabel } = await window.PlannerAvatar.runYearEndArchive();
    document.getElementById('archive-result').textContent = `Archived as ${yearLabel}. A new year has started.`;
  });

  document.getElementById('back-btn').addEventListener('click', () => {
    window.PlannerApp.navigate('today');
  });
}

function escapeHtmlSettings(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

window.PlannerViews = window.PlannerViews || {};
window.PlannerViews.settings = renderSettings;
