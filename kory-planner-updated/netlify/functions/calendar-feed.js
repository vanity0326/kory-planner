const { openStore } = require('./blobs-client');

// Serves a subscribable .ics feed of Kory's active (not-done) assignment due dates.
// Google Calendar (or any calendar app) subscribes to this URL once and
// auto-refreshes periodically. One-way: editing here doesn't touch Calendar,
// and Calendar can't write back here.
//
// Subscribe URL: https://<your-site>.netlify.app/.netlify/functions/calendar-feed

function toICSDate(dateStr) {
  // dueDate is stored as YYYY-MM-DD; render as an all-day VALUE=DATE event
  return dateStr.replace(/-/g, '');
}

function escapeICS(str) {
  return String(str).replace(/([,;\\])/g, '\\$1');
}

exports.handler = async () => {
  try {
    const store = openStore();
    const assignments = (await store.get('assignments', { type: 'json' })) || [];
    const active = assignments.filter(a => !a.done);

    const now = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

    const events = active.map(a => [
      'BEGIN:VEVENT',
      `UID:${a.id}@kory-planner`,
      `DTSTAMP:${now}`,
      `DTSTART;VALUE=DATE:${toICSDate(a.dueDate)}`,
      `SUMMARY:${escapeICS(a.subject)}: ${escapeICS(a.title)}`,
      'END:VEVENT',
    ].join('\r\n')).join('\r\n');

    const body = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Kory Planner//EN',
      'CALSCALE:GREGORIAN',
      'X-WR-CALNAME:Kory\'s assignments',
      events,
      'END:VCALENDAR',
    ].filter(Boolean).join('\r\n');

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': 'inline; filename="kory-planner.ics"',
        // Calendar apps poll this URL themselves — don't let a CDN/browser cache it stale.
        'Cache-Control': 'no-cache',
      },
      body,
    };
  } catch (err) {
    return { statusCode: 500, body: `Failed to build calendar feed: ${err.message}` };
  }
};
