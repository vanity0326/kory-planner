// Reports: Kory sees a simplified version (completion rate, streak history).
// A fuller export (CSV and a print-to-PDF view) is on-demand here.

async function renderReports(container) {
  const [assignments, streaks] = await Promise.all([
    window.PlannerStorage.getAssignments(),
    window.PlannerStorage.getStreaks(),
  ]);

  const total = assignments.length;
  const completed = assignments.filter(a => a.done).length;
  const rate = total ? Math.round((completed / total) * 100) : 0;

  container.innerHTML = `
    <div class="doing-screen">
      <h1>Kory's progress</h1>
      <div class="report-grid">
        <div class="metric-card">
          <p class="metric-label">Completed</p>
          <p class="metric-value">${completed} / ${total}</p>
        </div>
        <div class="metric-card">
          <p class="metric-label">Completion rate</p>
          <p class="metric-value">${rate}%</p>
        </div>
        <div class="metric-card">
          <p class="metric-label">Current streak</p>
          <p class="metric-value">${streaks.current} day${streaks.current === 1 ? '' : 's'}</p>
        </div>
      </div>
      <div class="form-actions" style="margin-top: 1rem;">
        <button class="secondary-btn" id="export-csv-btn">
          <i class="ti ti-download" aria-hidden="true"></i>
          Export CSV
        </button>
        <button class="secondary-btn" id="export-pdf-btn">
          <i class="ti ti-file" aria-hidden="true"></i>
          Print / save PDF
        </button>
      </div>
    </div>
  `;

  document.getElementById('export-csv-btn').addEventListener('click', () => exportCSV(assignments));
  document.getElementById('export-pdf-btn').addEventListener('click', () => exportPrintView(assignments, { completed, total, rate }, streaks));
}

function exportCSV(assignments) {
  const header = 'Subject,Title,Due date,Status,Completed at\n';
  const rows = assignments.map(a => {
    const status = a.done ? 'Done' : 'Open';
    const completedAt = a.completedAt ? a.completedAt.slice(0, 10) : '';
    return [a.subject, a.title, a.dueDate, status, completedAt]
      .map(csvEscape).join(',');
  }).join('\n');

  const blob = new Blob([header + rows], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `kory-report-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function csvEscape(val) {
  const str = String(val ?? '');
  return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
}

function exportPrintView(assignments, summary, streaks) {
  const win = window.open('', '_blank');
  const rows = assignments.map(a => `
    <tr>
      <td>${a.subject}</td>
      <td>${a.title}</td>
      <td>${a.dueDate}</td>
      <td>${a.done ? 'Done' : 'Open'}</td>
    </tr>
  `).join('');

  win.document.write(`
    <html>
      <head>
        <title>Kory's progress report</title>
        <style>
          body { font-family: -apple-system, sans-serif; padding: 24px; color: #1f1e1b; }
          h1 { font-size: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 16px; }
          th, td { text-align: left; padding: 6px 8px; border-bottom: 1px solid #ddd; font-size: 13px; }
          .summary { display: flex; gap: 24px; margin-top: 12px; }
          .summary div { font-size: 14px; }
        </style>
      </head>
      <body>
        <h1>Kory's progress report — ${new Date().toLocaleDateString()}</h1>
        <div class="summary">
          <div><strong>${summary.completed} / ${summary.total}</strong> completed</div>
          <div><strong>${summary.rate}%</strong> completion rate</div>
          <div><strong>${streaks.current}</strong> day streak</div>
        </div>
        <table>
          <thead><tr><th>Subject</th><th>Title</th><th>Due date</th><th>Status</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </body>
    </html>
  `);
  win.document.close();
  win.focus();
  win.print();
}

window.PlannerViews = window.PlannerViews || {};
window.PlannerViews.reports = renderReports;
