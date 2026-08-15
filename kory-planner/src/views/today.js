// Today view: the default landing screen.
// Order (per spec, no due-today/tomorrow labels — position alone signals priority):
//   1. current / not-yet-due assignments, in the order they were added
//   2. a past-due section, sorted furthest-overdue first, visual weight escalating
//   3. completed items, always last
//
// This is a "doing" screen: no seasonal decoration, no animated motion in its
// resting state. The only motion allowed is the done-tap confirmation itself.

function daysOverdue(dueDateStr) {
  const due = new Date(dueDateStr + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffMs = today - due;
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

function subjectClass(subject) {
  const key = subject.toLowerCase().replace(/\s+/g, '-');
  return `subject-${key}`;
}

function overdueBarWidth(days) {
  if (days >= 5) return '6px';
  if (days >= 3) return '4px';
  return '2px';
}

function renderAssignmentRow(a) {
  const isDone = a.done;
  const overdue = !isDone && daysOverdue(a.dueDate) > 0;
  const days = overdue ? daysOverdue(a.dueDate) : 0;

  const rowStyle = overdue
    ? `border-left: ${overdueBarWidth(days)} solid var(--border-danger); border-radius: 0 var(--radius) var(--radius) 0;`
    : `border-radius: var(--radius);`;

  const checkCircle = isDone
    ? `<div class="done-circle" aria-hidden="true"><i class="ti ti-check"></i></div>`
    : `<button class="mark-done" data-id="${a.id}" aria-label="Mark ${escapeHtml(a.title)} done"></button>`;

  const titleStyle = isDone
    ? 'color: var(--text-muted); text-decoration: line-through;'
    : '';

  const overdueTag = overdue
    ? `<span class="overdue-tag ${days >= 5 ? 'overdue-tag-strong' : ''}">past due${days >= 3 ? ` · ${days} days` : ''}</span>`
    : '';

  return `
    <div class="assignment-row" style="${rowStyle}">
      ${checkCircle}
      <div class="assignment-info">
        <p class="assignment-title" style="${titleStyle}">${escapeHtml(a.title)}</p>
        <span class="subject-pill ${subjectClass(a.subject)}">${escapeHtml(a.subject)}</span>
        ${overdueTag}
      </div>
    </div>
  `;
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function sortAssignments(assignments) {
  const active = assignments.filter(a => !a.done && daysOverdue(a.dueDate) <= 0);
  const pastDue = assignments
    .filter(a => !a.done && daysOverdue(a.dueDate) > 0)
    .sort((a, b) => daysOverdue(b.dueDate) - daysOverdue(a.dueDate)); // furthest overdue first
  const done = assignments.filter(a => a.done);
  return { active, pastDue, done };
}

async function renderToday(container) {
  const [assignments, streaks] = await Promise.all([
    window.PlannerStorage.getAssignments(),
    window.PlannerStorage.getStreaks(),
  ]);

  const { active, pastDue, done } = sortAssignments(assignments);

  const todayStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  });

  const divider = `<div class="section-divider"></div>`;

  container.innerHTML = `
    <div class="doing-screen">
      <div class="today-header">
        <h1>Kory's Today</h1>
        <div class="streak-badge">
          <i class="ti ti-flame" aria-hidden="true"></i>
          <span>${streaks.current} day${streaks.current === 1 ? '' : 's'}</span>
        </div>
      </div>
      <p class="today-date">${todayStr}</p>

      <div class="assignment-list">
        ${active.map(renderAssignmentRow).join('')}
        ${pastDue.length ? divider + pastDue.map(renderAssignmentRow).join('') : ''}
        ${done.length ? divider + done.map(renderAssignmentRow).join('') : ''}
        ${!active.length && !pastDue.length && !done.length ? `
          <p class="empty-state">Nothing on the list yet. Tap "Add assignment" to get started.</p>
        ` : ''}
      </div>

      <button class="add-assignment-btn" id="add-assignment-btn">
        <i class="ti ti-plus" aria-hidden="true"></i>
        Add assignment
      </button>
    </div>
  `;

  container.querySelectorAll('.mark-done').forEach(btn => {
    btn.addEventListener('click', () => markDone(btn.dataset.id, container));
  });

  document.getElementById('add-assignment-btn').addEventListener('click', () => {
    window.PlannerApp.navigate('add-assignment');
  });
}

async function markDone(id, container) {
  const assignments = await window.PlannerStorage.getAssignments();
  const target = assignments.find(a => a.id === id);
  if (!target) return;
  target.done = true;
  target.completedAt = new Date().toISOString();

  await window.PlannerStorage.saveAssignments(assignments);
  await bumpStreak();
  await window.PlannerAvatar.awardXP();
  await renderToday(container);
}

async function bumpStreak() {
  const streaks = await window.PlannerStorage.getStreaks();
  const todayStr = new Date().toISOString().slice(0, 10);

  if (streaks.lastCompletedDate === todayStr) {
    // already counted today
    return;
  }

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().slice(0, 10);

  streaks.current = streaks.lastCompletedDate === yesterdayStr ? streaks.current + 1 : 1;
  streaks.lastCompletedDate = todayStr;
  streaks.history = streaks.history || [];
  streaks.history.push(todayStr);

  await window.PlannerStorage.saveStreaks(streaks);
}

window.PlannerViews = window.PlannerViews || {};
window.PlannerViews.today = renderToday;
