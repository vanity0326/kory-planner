// Reports: Kory sees a simplified version. Export is on-demand (CSV + print).

async function renderReports(container) {
  const [assignments, streaks, homePractice] = await Promise.all([
    window.PlannerStorage.getAssignments(),
    window.PlannerStorage.getStreaks(),
    window.PlannerStorage.getHomePractice(),
  ]);

  const total = assignments.length;
  const completed = assignments.filter(a => a.done).length;
  const rate = total ? Math.round((completed / total) * 100) : 0;
  const koryEntries = assignments.filter(a => a.enteredBy === 'kory').length;
  const parentEntries = assignments.filter(a => a.enteredBy === 'parent').length;

  container.innerHTML = `
    <div class="doing-screen">
      <h1>Kory's Progress</h1>
      <div class="report-grid">
        <div class="metric-card"><p class="metric-label">Completed</p><p class="metric-value">${completed} / ${total}</p></div>
        <div class="metric-card"><p class="metric-label">Completion rate</p><p class="metric-value">${rate}%</p></div>
        <div class="metric-card"><p class="metric-label">Completion streak</p><p class="metric-value">${streaks.completion.current}d</p></div>
        <div class="metric-card"><p class="metric-label">Logging streak</p><p class="metric-value">${streaks.entry.current}d</p></div>
        <div class="metric-card"><p class="metric-label">Kory's entries</p><p class="metric-value">${koryEntries}</p></div>
        <div class="metric-card"><p class="metric-label">Home practice</p><p class="metric-value">${homePractice.length}</p></div>
      </div>
      <p class="field-hint" style="margin-top: 12px;">Race so far, all-time: Kory ${koryEntries} — Parent ${parentEntries}</p>
      <div class="form-actions" style="margin-top: 1rem;">
        <button class="secondary-btn" id="export-csv-btn"><i class="ti ti-download" aria-hidden="true"></i> Export CSV</button>
        <button class="secondary-btn" id="export-pdf-btn"><i class="ti ti-file" aria-hidden="true"></i> Print / save PDF</button>
      </div>
    </div>
  `;

  document.getElementById('export-csv-btn').addEventListener('click', () => exportCSV(assignments));
  document.getElementById('export-pdf-btn').addEventListener('click', () => exportPrintView(assignments, { completed, total, rate }, streaks));
}

function exportCSV(assignments) {
  const header = 'Subject,Title,Type,Due date,Status,Entered by,Completed at\n';
  const rows = assignments.map(a => [
    a.subject, a.title, a.type || 'assignment', a.dueDate,
    a.done ? 'Done' : 'Open', a.enteredBy || '', a.completedAt ? a.completedAt.slice(0, 10) : '',
  ].map(csvEscape).join(',')).join('\n');
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
  const rows = assignments.map(a => `<tr><td>${a.subject}</td><td>${a.title}</td><td>${a.type || 'assignment'}</td><td>${a.dueDate}</td><td>${a.done ? 'Done' : 'Open'}</td></tr>`).join('');
  win.document.write(`
    <html><head><title>Kory's Progress Report</title><style>
      body { font-family: -apple-system, sans-serif; padding: 24px; color: #1f1e1b; }
      h1 { font-size: 20px; } table { width: 100%; border-collapse: collapse; margin-top: 16px; }
      th, td { text-align: left; padding: 6px 8px; border-bottom: 1px solid #ddd; font-size: 13px; }
      .summary { display: flex; gap: 24px; margin-top: 12px; flex-wrap: wrap; } .summary div { font-size: 14px; }
    </style></head><body>
      <h1>Kory's Progress Report — ${new Date().toLocaleDateString()}</h1>
      <div class="summary">
        <div><strong>${summary.completed} / ${summary.total}</strong> completed</div>
        <div><strong>${summary.rate}%</strong> completion rate</div>
        <div><strong>${streaks.completion.current}d</strong> completion streak</div>
        <div><strong>${streaks.entry.current}d</strong> logging streak</div>
      </div>
      <table><thead><tr><th>Subject</th><th>Title</th><th>Type</th><th>Due date</th><th>Status</th></tr></thead><tbody>${rows}</tbody></table>
    </body></html>
  `);
  win.document.close();
  win.focus();
  win.print();
}

window.PlannerViews = window.PlannerViews || {};
window.PlannerViews.reports = renderReports;
