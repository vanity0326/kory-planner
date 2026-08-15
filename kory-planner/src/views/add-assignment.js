// Add Assignment: intentionally minimal. Subject, title, due date — nothing else.
// Every extra field is friction that causes the task to never get entered.

const SUBJECTS = [
  'Math', 'Reading', 'Piano', 'English', 'Science',
  'Korean', 'Critical Thinking', 'Cursive', 'Typing', 'Chore',
];

function renderAddAssignment(container) {
  container.innerHTML = `
    <div class="doing-screen">
      <h1>Add assignment</h1>

      <form id="add-form" novalidate>
        <label for="subject-select">Subject</label>
        <select id="subject-select" required>
          ${SUBJECTS.map(s => `<option value="${s}">${s}</option>`).join('')}
        </select>

        <label for="title-input">What is it?</label>
        <input id="title-input" type="text" placeholder="Worksheet 4.2" required />

        <label for="due-input">Due date</label>
        <input id="due-input" type="date" required />

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

  document.getElementById('cancel-btn').addEventListener('click', () => {
    window.PlannerApp.navigate('today');
  });

  document.getElementById('add-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const subject = document.getElementById('subject-select').value;
    const title = document.getElementById('title-input').value.trim();
    const dueDate = document.getElementById('due-input').value;
    const errorEl = document.getElementById('form-error');

    if (!title) {
      errorEl.textContent = 'Enter what the assignment is first.';
      errorEl.style.display = 'block';
      return;
    }
    if (!dueDate) {
      errorEl.textContent = 'Pick a due date first.';
      errorEl.style.display = 'block';
      return;
    }
    errorEl.style.display = 'none';

    const assignments = await window.PlannerStorage.getAssignments();
    assignments.push({
      id: `a-${Date.now()}`,
      subject,
      title,
      dueDate,
      done: false,
      createdAt: new Date().toISOString(),
    });
    await window.PlannerStorage.saveAssignments(assignments);
    window.PlannerApp.navigate('today');
  });
}

window.PlannerViews = window.PlannerViews || {};
window.PlannerViews.addAssignment = renderAddAssignment;
