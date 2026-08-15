// Today view: the default landing screen.
//
// Order: current/not-yet-due first, then past-due (furthest-overdue first,
// escalating visual weight), then completed. No due-today/tomorrow labels —
// position alone signals priority.
//
// Split assignments (steps) show ONLY their next-due, not-yet-done step —
// never the whole parent assignment — so a big project never looms as one
// scary line item. Once every step is done, the parent auto-completes.
//
// This is a "doing" screen: no seasonal decoration, no animated motion in
// its resting state.

function daysOverdue(dueDateStr) {
  const due = new Date(dueDateStr + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.floor((today - due) / (1000 * 60 * 60 * 24));
}

function daysUntil(dueDateStr) {
  return -daysOverdue(dueDateStr);
}

function subjectClass(subject) {
  return `subject-${subject.toLowerCase().replace(/\s+/g, '-')}`;
}

function overdueBarWidth(days) {
  if (days >= 5) return '6px';
  if (days >= 3) return '4px';
  return '2px';
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// Returns the "effective row" for an assignment: either the parent itself
// (no steps, or fully done) or its next incomplete step.
function effectiveRow(assignment) {
  if (assignment.steps && assignment.steps.length) {
    const nextStep = assignment.steps.find(s => !s.done);
    if (nextStep) {
      return {
        kind: 'step',
        parentId: assignment.id,
        stepId: nextStep.id,
        subject: assignment.subject,
        type: assignment.type,
        title: `${assignment.title}: ${nextStep.title}`,
        dueDate: nextStep.dueDate,
        done: false,
      };
    }
    // All steps done — parent counts as done.
    return { kind: 'parent-complete', id: assignment.id, subject: assignment.subject, type: assignment.type, title: assignment.title, dueDate: assignment.dueDate, done: true };
  }
  return { kind: 'plain', id: assignment.id, subject: assignment.subject, type: assignment.type, title: assignment.title, dueDate: assignment.dueDate, done: assignment.done };
}

function typeTag(type) {
  if (type === 'test') {
    return `<span class="type-tag"><i class="ti ti-clipboard-text" aria-hidden="true"></i> Test</span>`;
  }
  return '';
}

function renderRow(row) {
  const isDone = row.done;
  const overdue = !isDone && daysOverdue(row.dueDate) > 0;
  const days = overdue ? daysOverdue(row.dueDate) : 0;

  const rowStyle = overdue
    ? `border-left: ${overdueBarWidth(days)} solid var(--border-danger); border-radius: 0 var(--radius) var(--radius) 0;`
    : `border-radius: var(--radius);`;

  const checkCircle = isDone
    ? `<div class="done-circle" aria-hidden="true"><i class="ti ti-check"></i></div>`
    : `<button class="mark-done" data-kind="${row.kind}" data-id="${row.parentId || row.id}" data-step-id="${row.stepId || ''}" aria-label="Mark ${escapeHtml(row.title)} done"></button>`;

  const titleStyle = isDone ? 'color: var(--text-muted); text-decoration: line-through;' : '';
  const overdueTag = overdue
    ? `<span class="overdue-tag ${days >= 5 ? 'overdue-tag-strong' : ''}">past due${days >= 3 ? ` · ${days} days` : ''}</span>`
    : '';

  return `
    <div class="assignment-row" style="${rowStyle}">
      ${checkCircle}
      <div class="assignment-info">
        <p class="assignment-title" style="${titleStyle}">${escapeHtml(row.title)}</p>
        <span class="subject-pill ${subjectClass(row.subject)}">${escapeHtml(row.subject)}</span>
        ${typeTag(row.type)}
        ${overdueTag}
      </div>
    </div>
  `;
}

function sortRows(rows) {
  const active = rows.filter(r => !r.done && daysOverdue(r.dueDate) <= 0);
  const pastDue = rows.filter(r => !r.done && daysOverdue(r.dueDate) > 0)
    .sort((a, b) => daysOverdue(b.dueDate) - daysOverdue(a.dueDate));
  const done = rows.filter(r => r.done);
  return { active, pastDue, done };
}

function weekBounds() {
  const now = new Date();
  const day = now.getDay(); // 0 = Sunday
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((day + 6) % 7));
  monday.setHours(0, 0, 0, 0);
  return monday;
}

function raceTally(assignments) {
  const weekStart = weekBounds();
  let kory = 0, parent = 0;
  assignments.forEach(a => {
    if (!a.enteredAt) return;
    if (new Date(a.enteredAt) < weekStart) return;
    if (a.enteredBy === 'kory') kory++;
    else if (a.enteredBy === 'parent') parent++;
  });
  return { kory, parent };
}

// Passive recurring-pattern nudge: if a subject has appeared on this same
// weekday 3+ times historically (by entry date), and nothing's been logged
// for it today yet, suggest it. Zero setup, purely observational, dismissible.
function recurringNudge(assignments) {
  const todayWeekday = new Date().getDay();
  const todayStr = new Date().toISOString().slice(0, 10);
  const counts = {};
  assignments.forEach(a => {
    if (!a.createdAt) return;
    const wd = new Date(a.createdAt).getDay();
    if (wd !== todayWeekday) return;
    counts[a.subject] = (counts[a.subject] || 0) + 1;
  });
  const candidate = Object.entries(counts).find(([, count]) => count >= 3);
  if (!candidate) return null;
  const [subject] = candidate;
  const alreadyToday = assignments.some(a => a.subject === subject && a.createdAt && a.createdAt.slice(0, 10) === todayStr);
  if (alreadyToday) return null;
  return subject;
}

// School-side daily items (registered from Add Assignment) materialize into
// a real assignment entry due today, once per day. Idempotent: checks for
// an existing assignment tagged with this dailyItemId due today before
// creating another, so re-running on every Today load is safe. Separate
// entirely from Home Practice's daily list — no shared storage, no shared UI.
async function ensureDailySchoolInstances() {
  const dailyItems = await window.PlannerStorage.getDailySchoolItems();
  if (!dailyItems.length) return;

  const assignments = await window.PlannerStorage.getAssignments();
  const todayDateStr = new Date().toISOString().slice(0, 10);
  let changed = false;

  dailyItems.forEach(item => {
    const alreadyExists = assignments.some(a => a.dailyItemId === item.id && a.dueDate === todayDateStr);
    if (!alreadyExists) {
      assignments.push({
        id: `a-daily-${item.id}-${todayDateStr}`,
        subject: item.subject,
        title: item.title,
        dueDate: todayDateStr,
        type: 'assignment',
        done: false,
        enteredBy: item.enteredBy || 'kory',
        enteredAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        steps: null,
        studyReminder: false,
        studySessionLogged: false,
        dailyItemId: item.id,
      });
      changed = true;
    }
  });

  if (changed) await window.PlannerStorage.saveAssignments(assignments);
}

async function renderToday(container) {
  await ensureDailySchoolInstances();

  const [assignments, streaks] = await Promise.all([
    window.PlannerStorage.getAssignments(),
    window.PlannerStorage.getStreaks(),
  ]);

  // Auto-complete any parent assignment whose steps are all done.
  let changed = false;
  assignments.forEach(a => {
    if (a.steps && a.steps.length && a.steps.every(s => s.done) && !a.done) {
      a.done = true;
      a.completedAt = new Date().toISOString();
      changed = true;
    }
  });
  if (changed) await window.PlannerStorage.saveAssignments(assignments);

  const rows = assignments.map(effectiveRow);
  const { active, pastDue, done } = sortRows(rows);
  const tally = raceTally(assignments);
  const nudgeSubject = recurringNudge(assignments);

  const todayStr = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  const divider = `<div class="section-divider"></div>`;

  const milestoneJson = sessionStorage.getItem('plannerMilestoneToast');
  if (milestoneJson) sessionStorage.removeItem('plannerMilestoneToast');
  const milestone = milestoneJson ? JSON.parse(milestoneJson) : null;

  container.innerHTML = `
    <div class="doing-screen">
      <div class="today-header">
        <h1>Kory's Today</h1>
        <div class="streak-badge">
          <i class="ti ti-flame" aria-hidden="true"></i>
          <span>${streaks.completion.current} day${streaks.completion.current === 1 ? '' : 's'}</span>
        </div>
      </div>
      <p class="today-date">${todayStr}</p>

      <div class="race-tally">
        <i class="ti ti-trophy" aria-hidden="true"></i>
        <span>This week: Kory ${tally.kory} — Parent ${tally.parent}</span>
        ${streaks.entry.current > 0 ? `<span class="entry-streak-note">· ${streaks.entry.current}-day logging streak</span>` : ''}
      </div>

      ${milestone ? `
        <div class="milestone-toast" style="background: ${milestone.bg}; color: ${milestone.color};">
          <div class="milestone-badge-icon" style="background: ${milestone.color};"><i class="ti ${milestone.icon}" aria-hidden="true"></i></div>
          <span>New badge! ${milestone.totalSelfEntries} things logged — it's waiting in the Village.</span>
        </div>
      ` : ''}

      ${nudgeSubject ? `
        <button class="nudge-chip" id="nudge-chip">${escapeHtml(nudgeSubject)} today?</button>
      ` : ''}

      <div class="assignment-list">
        ${active.map(renderRow).join('')}
        ${pastDue.length ? divider + pastDue.map(renderRow).join('') : ''}
        ${done.length ? divider + done.map(renderRow).join('') : ''}
        ${!active.length && !pastDue.length && !done.length ? `<p class="empty-state">Nothing on the list yet. Tap "Add assignment" to get started.</p>` : ''}
      </div>

      <button class="add-assignment-btn" id="add-assignment-btn">
        <i class="ti ti-plus" aria-hidden="true"></i>
        Add assignment
      </button>
    </div>
  `;

  container.querySelectorAll('.mark-done').forEach(btn => {
    btn.addEventListener('click', () => markDone(btn.dataset.kind, btn.dataset.id, btn.dataset.stepId, container));
  });

  document.getElementById('add-assignment-btn').addEventListener('click', () => {
    window.PlannerApp.navigate('add-assignment');
  });

  const nudgeChip = document.getElementById('nudge-chip');
  if (nudgeChip) {
    nudgeChip.addEventListener('click', () => window.PlannerApp.navigate('add-assignment'));
  }
}

async function markDone(kind, id, stepId, container) {
  const assignments = await window.PlannerStorage.getAssignments();
  const target = assignments.find(a => a.id === id);
  if (!target) return;

  if (kind === 'step' && stepId) {
    const step = target.steps.find(s => s.id === stepId);
    if (step) {
      step.done = true;
      await window.PlannerAvatar.awardXP(window.PlannerAvatar.XP.STEP_COMPLETE);
      await recordStepOutcome(step.dueDate);
    }
  } else {
    target.done = true;
    target.completedAt = new Date().toISOString();
    await window.PlannerAvatar.awardXP(window.PlannerAvatar.XP.PLAIN_COMPLETE);
  }

  await window.PlannerStorage.saveAssignments(assignments);
  await window.PlannerAvatar.bumpCompletionStreak();
  await renderToday(container);
}

async function recordStepOutcome(dueDateStr) {
  const settings = await window.PlannerStorage.getSettings();
  const onTime = daysOverdue(dueDateStr) <= 0;
  settings.stepOutcomeHistory = settings.stepOutcomeHistory || [];
  settings.stepOutcomeHistory.push({ onTime, at: new Date().toISOString() });
  settings.stepOutcomeHistory = settings.stepOutcomeHistory.slice(-12);
  await window.PlannerStorage.saveSettings(settings);
}

window.PlannerViews = window.PlannerViews || {};
window.PlannerViews.today = renderToday;
