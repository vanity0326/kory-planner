// Add Assignment: subject, title, due date, type (assignment/test), and
// WHO is entering it — that last field is what makes the "First to Know"
// race work. No login exists, so this is a lightweight toggle, not auth.
//
// If it's a regular assignment due 5+ days out, offers an optional
// step-split (template-based, respecting the current scaffolding level).
// Tests skip step-splitting entirely and instead offer a study-reminder
// toggle.

const STEP_SPLIT_THRESHOLD_DAYS = 5;

const TEMPLATES = {
  essay: ['Pick a topic', 'Outline', 'Rough draft', 'Revise', 'Final draft'],
  project: ['Research', 'Plan it out', 'Build/create', 'Review', 'Turn it in'],
  study: ['Review notes', 'Practice problems', 'Self-quiz', 'Final review'],
  reading: ['Read part 1', 'Read part 2', 'Reading response'],
  generic: ['Step 1', 'Step 2', 'Step 3'],
};

function daysUntil(dueDateStr) {
  const due = new Date(dueDateStr + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((due - today) / (1000 * 60 * 60 * 24));
}

function spacedDates(count, dueDateStr) {
  const due = new Date(dueDateStr + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const totalDays = Math.max(1, Math.round((due - today) / (1000 * 60 * 60 * 24)));
  const dates = [];
  for (let i = 1; i <= count; i++) {
    const offset = Math.round((totalDays / count) * i);
    const d = new Date(today);
    d.setDate(d.getDate() + offset);
    dates.push(d.toISOString().slice(0, 10));
  }
  return dates;
}

function buildStepsFromTemplate(templateKey, scaffoldingLevel, dueDateStr) {
  const fullSteps = TEMPLATES[templateKey] || TEMPLATES.generic;
  let labels;
  if (scaffoldingLevel === 'full') {
    labels = fullSteps;
  } else if (scaffoldingLevel === 'partial') {
    // Condense to first, middle, last as lighter-touch hints.
    labels = fullSteps.length >= 3
      ? [fullSteps[0], 'Make progress', fullSteps[fullSteps.length - 1]]
      : fullSteps;
  } else {
    // 'blank' — generic, fully user-driven count/labels, handled by caller.
    labels = TEMPLATES.generic;
  }
  const dates = spacedDates(labels.length, dueDateStr);
  return labels.map((title, i) => ({
    id: `s-${Date.now()}-${i}`,
    title,
    dueDate: dates[i],
    done: false,
  }));
}

async function renderAddAssignment(container) {
  const [knownSubjects, settings] = await Promise.all([
    window.PlannerStorage.getKnownSubjects(),
    window.PlannerStorage.getSettings(),
  ]);

  container.innerHTML = `
    <div class="doing-screen">
      <h1>Add Assignment</h1>

      <form id="add-form" novalidate>
        <label>Who's adding this?</label>
        <div class="segmented" id="entered-by-toggle">
          <button type="button" class="segmented-option active" data-value="kory">Kory</button>
          <button type="button" class="segmented-option" data-value="parent">Parent</button>
        </div>

        <label>Type</label>
        <div class="segmented" id="type-toggle">
          <button type="button" class="segmented-option active" data-value="assignment">Assignment</button>
          <button type="button" class="segmented-option" data-value="test">Test / quiz</button>
        </div>

        <label for="subject-input">Subject</label>
        <input id="subject-input" type="text" list="subject-options" placeholder="Math" required autocomplete="off" />
        <datalist id="subject-options">
          ${knownSubjects.map(s => `<option value="${escapeHtmlAdd(s)}"></option>`).join('')}
        </datalist>

        <label for="title-input">What is it?</label>
        <input id="title-input" type="text" placeholder="Worksheet 4.2" required />

        <label for="due-input">Due date</label>
        <input id="due-input" type="date" required />

        <div id="step-split-prompt" style="display: none;"></div>
        <div id="study-reminder-toggle" style="display: none;"></div>
        <div id="daily-school-toggle" style="display: none;"></div>

        <p class="field-error" id="form-error" style="display: none;"></p>

        <div class="form-actions">
          <button type="button" id="cancel-btn" class="secondary-btn">Cancel</button>
          <button type="submit" class="primary-btn">Add assignment</button>
        </div>
      </form>
    </div>
  `;

  const today = new Date().toISOString().slice(0, 10);
  document.getElementById('due-input').value = today;

  let enteredBy = 'kory';
  let type = 'assignment';
  let studyReminderOn = false;
  let makeDailySchoolItem = false;
  let chosenSteps = null; // set if user opts into step-split

  container.querySelectorAll('#entered-by-toggle .segmented-option').forEach(btn => {
    btn.addEventListener('click', () => {
      container.querySelectorAll('#entered-by-toggle .segmented-option').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      enteredBy = btn.dataset.value;
    });
  });

  container.querySelectorAll('#type-toggle .segmented-option').forEach(btn => {
    btn.addEventListener('click', () => {
      container.querySelectorAll('#type-toggle .segmented-option').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      type = btn.dataset.value;
      chosenSteps = null;
      updateConditionalPrompts();
    });
  });

  document.getElementById('due-input').addEventListener('change', updateConditionalPrompts);

  function updateConditionalPrompts() {
    const dueVal = document.getElementById('due-input').value;
    const stepPromptEl = document.getElementById('step-split-prompt');
    const studyToggleEl = document.getElementById('study-reminder-toggle');
    const dailySchoolToggleEl = document.getElementById('daily-school-toggle');

    if (type === 'test') {
      stepPromptEl.style.display = 'none';
      dailySchoolToggleEl.style.display = 'none';
      makeDailySchoolItem = false;
      studyToggleEl.style.display = 'block';
      studyToggleEl.innerHTML = `
        <label class="checkbox-row">
          <input type="checkbox" id="study-reminder-checkbox" />
          Remind me to study a couple days before
        </label>
      `;
      document.getElementById('study-reminder-checkbox').addEventListener('change', (e) => {
        studyReminderOn = e.target.checked;
      });
      return;
    }

    studyToggleEl.style.display = 'none';

    dailySchoolToggleEl.style.display = 'block';
    dailySchoolToggleEl.innerHTML = `
      <label class="checkbox-row">
        <input type="checkbox" id="daily-school-checkbox" />
        Make this a daily habit (shows as a one-tap checklist item on Today every day — separate from Home Practice's daily list)
      </label>
    `;
    document.getElementById('daily-school-checkbox').addEventListener('change', (e) => {
      makeDailySchoolItem = e.target.checked;
    });

    if (dueVal && daysUntil(dueVal) >= STEP_SPLIT_THRESHOLD_DAYS) {
      stepPromptEl.style.display = 'block';
      stepPromptEl.innerHTML = `
        <div class="step-split-box">
          <p style="margin: 0 0 8px; font-size: 14px;">This is due in ${daysUntil(dueVal)} days — want to break it into steps?</p>
          <select id="template-select" style="margin-bottom: 8px;">
            <option value="">Don't split it</option>
            <option value="essay">Essay</option>
            <option value="project">Project</option>
            <option value="study">Study for a test</option>
            <option value="reading">Reading</option>
            <option value="generic">Just space it out</option>
          </select>
          <div id="step-preview"></div>
        </div>
      `;
      document.getElementById('template-select').addEventListener('change', (e) => {
        const key = e.target.value;
        const previewEl = document.getElementById('step-preview');
        if (!key) {
          chosenSteps = null;
          previewEl.innerHTML = '';
          return;
        }
        chosenSteps = buildStepsFromTemplate(key, settings.scaffoldingLevel, dueVal);
        previewEl.innerHTML = `
          <p style="font-size: 12px; color: var(--text-muted); margin: 4px 0;">Steps (editable later):</p>
          ${chosenSteps.map(s => `<p style="font-size: 13px; margin: 2px 0;">• ${escapeHtmlAdd(s.title)} — due ${s.dueDate}</p>`).join('')}
        `;
      });
    } else {
      stepPromptEl.style.display = 'none';
      chosenSteps = null;
    }
  }

  document.getElementById('cancel-btn').addEventListener('click', () => {
    window.PlannerApp.navigate('today');
  });

  document.getElementById('add-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const subject = document.getElementById('subject-input').value.trim();
    const title = document.getElementById('title-input').value.trim();
    const dueDate = document.getElementById('due-input').value;
    const errorEl = document.getElementById('form-error');

    if (!subject) { errorEl.textContent = 'Enter a subject first.'; errorEl.style.display = 'block'; return; }
    if (!title) { errorEl.textContent = 'Enter what the assignment is first.'; errorEl.style.display = 'block'; return; }
    if (!dueDate) { errorEl.textContent = 'Pick a due date first.'; errorEl.style.display = 'block'; return; }
    errorEl.style.display = 'none';

    const submitBtn = document.querySelector('#add-form .primary-btn');
    if (submitBtn) submitBtn.disabled = true;

    try {
      const assignments = await window.PlannerStorage.getAssignments();
      const newAssignment = {
        id: `a-${Date.now()}`,
        subject,
        title,
        dueDate,
        type,
        done: false,
        enteredBy,
        enteredAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        steps: chosenSteps || null,
        studyReminder: type === 'test' ? studyReminderOn : false,
        studySessionLogged: false,
      };
      assignments.push(newAssignment);
      await window.PlannerStorage.saveAssignments(assignments);
      await window.PlannerStorage.addKnownSubject(subject);

      if (makeDailySchoolItem) {
        const dailyItems = await window.PlannerStorage.getDailySchoolItems();
        const exists = dailyItems.some(d => d.subject.toLowerCase() === subject.toLowerCase() && d.title.toLowerCase() === title.toLowerCase());
        if (!exists) {
          dailyItems.push({ id: `ds-${Date.now()}`, subject, title, enteredBy });
          await window.PlannerStorage.saveDailySchoolItems(dailyItems);
        }
      }

      let milestoneBadge = null;
      if (enteredBy === 'kory') {
        const result = await window.PlannerAvatar.recordKoryEntry();
        if (result.isMilestone) milestoneBadge = { ...result.badge, totalSelfEntries: result.totalSelfEntries };
      }

      if (milestoneBadge) {
        sessionStorage.setItem('plannerMilestoneToast', JSON.stringify(milestoneBadge));
      }
      window.PlannerApp.navigate('today');
    } catch (err) {
      // Storage.set() throws on any save failure, and previously nothing
      // caught it here — the handler just died silently and the button
      // looked broken with no explanation. Now we surface it.
      console.error('Failed to save assignment:', err);
      errorEl.textContent = "Couldn't save that — check your connection and try again.";
      errorEl.style.display = 'block';
      if (submitBtn) submitBtn.disabled = false;
    }
  });

  updateConditionalPrompts();
}

function escapeHtmlAdd(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

window.PlannerViews = window.PlannerViews || {};
window.PlannerViews.addAssignment = renderAddAssignment;
