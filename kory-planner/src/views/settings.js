// Settings: parent-only editable. Not on Kory's main nav path — reached via
// the gear icon. No password/lock — this is decluttering, not security.

async function renderSettings(container) {
  const settings = await window.PlannerStorage.getSettings();
  const thresholds = settings.rewardThresholds || [];
  const suggestion = window.PlannerAvatar.suggestScaffoldingChange(
    settings.scaffoldingLevel, settings.stepOutcomeHistory || []
  );

  container.innerHTML = `
    <div class="doing-screen">
      <h1>Settings</h1>
      <p class="field-hint">Parent-only controls. Not shown on Kory's main nav.</p>

      <h2>Step-Split Scaffolding</h2>
      <p class="field-hint">How much structure big-assignment step templates give him. You can adjust this either direction anytime.</p>
      <select id="scaffolding-select">
        <option value="full">Full — detailed step templates</option>
        <option value="partial">Partial — lighter hints only</option>
        <option value="blank">Blank — he drives it himself</option>
      </select>

      ${suggestion ? `
        <div class="scaffolding-suggestion">
          <p style="margin: 0 0 8px; font-size: 14px;">${suggestion.reason} Want to ${suggestion.direction === 'reduce' ? 'ease off a bit' : 'add a bit more structure back'}?</p>
          <div class="form-actions">
            <button type="button" class="secondary-btn" id="dismiss-suggestion">Not now</button>
            <button type="button" class="primary-btn" id="accept-suggestion">Yes, switch to ${suggestion.suggestedLevel}</button>
          </div>
        </div>
      ` : ''}

      <h2>Reward Thresholds</h2>
      <div id="threshold-list">
        ${thresholds.map((t, i) => `
          <div class="threshold-row" data-index="${i}">
            <span>${t.xp} XP → ${escapeHtmlSettings(t.reward)}</span>
            <button type="button" class="remove-threshold" data-index="${i}" aria-label="Remove"><i class="ti ti-x" aria-hidden="true"></i></button>
          </div>
        `).join('') || '<p class="field-hint">No thresholds set yet.</p>'}
      </div>
      <div class="threshold-add">
        <input type="number" id="threshold-xp" placeholder="XP" min="0" style="width: 90px;" />
        <input type="text" id="threshold-reward" placeholder="Reward (e.g. 30 min VR time)" style="flex: 1;" />
        <button type="button" id="add-threshold-btn" class="secondary-btn">Add</button>
      </div>

      <h2>Seasonal Skin</h2>
      <select id="season-override">
        <option value="">Auto (based on today's date)</option>
        <option value="winter">Winter</option>
        <option value="spring">Spring</option>
        <option value="summer">Summer</option>
        <option value="fall">Fall</option>
        <option value="birthday">Birthday (Nov 23)</option>
      </select>

      <h2>Calendar Feed</h2>
      <p class="field-hint">Subscribe once in Google Calendar (Settings → Add calendar → From URL):</p>
      <div class="ics-url-box" id="ics-url-box"></div>

      <h2>Year-End Archive</h2>
      <p class="field-hint">Graduates this year's avatar into the village, archives everything, and starts fresh. Irreversible from here.</p>
      <button type="button" id="archive-btn" class="secondary-btn" style="width: 100%; color: var(--text-danger); border-color: var(--border-danger);">Run year-end archive</button>
      <p class="field-hint" id="archive-result"></p>

      <button class="secondary-btn" id="back-btn" style="margin-top: 1.5rem; width: 100%;">Back to today</button>
    </div>
  `;

  document.getElementById('scaffolding-select').value = settings.scaffoldingLevel;
  document.getElementById('season-override').value = settings.seasonalOverride || '';
  const icsUrl = `${window.location.origin}/.netlify/functions/calendar-feed`;
  document.getElementById('ics-url-box').innerHTML = `<input type="text" readonly value="${icsUrl}" style="width: 100%; font-size: 13px;" />`;

  document.getElementById('scaffolding-select').addEventListener('change', async (e) => {
    settings.scaffoldingLevel = e.target.value;
    await window.PlannerStorage.saveSettings(settings);
  });

  const acceptBtn = document.getElementById('accept-suggestion');
  if (acceptBtn) {
    acceptBtn.addEventListener('click', async () => {
      settings.scaffoldingLevel = suggestion.suggestedLevel;
      settings.stepOutcomeHistory = []; // reset so we don't re-suggest immediately
      await window.PlannerStorage.saveSettings(settings);
      renderSettings(container);
    });
    document.getElementById('dismiss-suggestion').addEventListener('click', () => {
      document.querySelector('.scaffolding-suggestion').style.display = 'none';
    });
  }

  container.querySelectorAll('.remove-threshold').forEach(btn => {
    btn.addEventListener('click', async () => {
      thresholds.splice(Number(btn.dataset.index), 1);
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
    if (!confirm('This archives the current year and starts fresh. Continue?')) return;
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
