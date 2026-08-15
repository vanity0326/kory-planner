// Home Practice: separate from schoolwork. Parent assigns something
// (e.g. "15 min critical reasoning"), Kory self-logs when he's done it.
// No verification, no clawback mechanic for false logs — this is a trust
// space, not another thing to be checked up on. Also hosts test study
// sessions, logged the same trust-based way.

async function renderHomePractice(container) {
  const [entries, assignments] = await Promise.all([
    window.PlannerStorage.getHomePractice(),
    window.PlannerStorage.getAssignments(),
  ]);

  const upcomingTests = assignments.filter(a =>
    a.type === 'test' && a.studyReminder && !a.done &&
    daysUntilStr(a.dueDate) >= 0 && daysUntilStr(a.dueDate) <= 2
  );

  container.innerHTML = `
    <div class="doing-screen">
      <h1>Home Practice</h1>
      <p class="field-hint">Extra work outside school, logged on the honor system.</p>

      ${upcomingTests.length ? `
        <div class="study-nudges">
          ${upcomingTests.map(t => `
            <button class="nudge-chip" data-log-study="${t.id}" data-subject="${escapeHtmlHP(t.subject)}">
              ${escapeHtmlHP(t.subject)} test soon — log a study session
            </button>
          `).join('')}
        </div>
      ` : ''}

      <form id="practice-form" novalidate>
        <label for="practice-subject">Subject</label>
        <input id="practice-subject" type="text" placeholder="Math" required />

        <label for="practice-desc">What did you work on?</label>
        <input id="practice-desc" type="text" placeholder="15 min of practice problems" required />

        <p class="field-error" id="practice-error" style="display: none;"></p>

        <button type="submit" class="primary-btn" style="width: 100%; margin-top: 1rem;">Log it</button>
      </form>

      <div class="assignment-list" style="margin-top: 1.5rem;">
        ${entries.length ? entries.slice().reverse().map(renderEntry).join('') : '<p class="empty-state">Nothing logged yet.</p>'}
      </div>
    </div>
  `;

  document.getElementById('practice-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const subject = document.getElementById('practice-subject').value.trim();
    const description = document.getElementById('practice-desc').value.trim();
    const errorEl = document.getElementById('practice-error');
    if (!subject || !description) {
      errorEl.textContent = 'Fill in both fields first.';
      errorEl.style.display = 'block';
      return;
    }
    errorEl.style.display = 'none';
    await logPractice(subject, description, null);
    renderHomePractice(container);
  });

  container.querySelectorAll('[data-log-study]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const testId = btn.dataset.logStudy;
      const subject = btn.dataset.subject;
      await logPractice(subject, 'Study session', testId, true);
      const assignments2 = await window.PlannerStorage.getAssignments();
      const test = assignments2.find(a => a.id === testId);
      if (test) test.studySessionLogged = true;
      await window.PlannerStorage.saveAssignments(assignments2);
      renderHomePractice(container);
    });
  });
}

async function logPractice(subject, description, linkedTestId, isStudySession) {
  const entries = await window.PlannerStorage.getHomePractice();
  entries.push({
    id: `hp-${Date.now()}`,
    subject,
    description,
    linkedTestId: linkedTestId || null,
    kind: isStudySession ? 'study' : 'practice',
    loggedAt: new Date().toISOString(),
  });
  await window.PlannerStorage.saveHomePractice(entries);
  await window.PlannerAvatar.awardXP(
    isStudySession ? window.PlannerAvatar.XP.STUDY_SESSION : window.PlannerAvatar.XP.HOME_PRACTICE
  );
}

function renderEntry(entry) {
  const date = new Date(entry.loggedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return `
    <div class="assignment-row" style="border-radius: var(--radius);">
      <div class="done-circle" aria-hidden="true"><i class="ti ti-check"></i></div>
      <div class="assignment-info">
        <p class="assignment-title">${escapeHtmlHP(entry.description)}</p>
        <span class="subject-pill subject-${entry.subject.toLowerCase().replace(/\s+/g, '-')}">${escapeHtmlHP(entry.subject)}</span>
        <span class="overdue-tag">${date}${entry.kind === 'study' ? ' · study session' : ''}</span>
      </div>
    </div>
  `;
}

function daysUntilStr(dueDateStr) {
  const due = new Date(dueDateStr + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((due - today) / (1000 * 60 * 60 * 24));
}

function escapeHtmlHP(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

window.PlannerViews = window.PlannerViews || {};
window.PlannerViews.homePractice = renderHomePractice;
