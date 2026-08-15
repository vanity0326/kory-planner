// Top-level router. Kory's main nav: Today, Village, Reports.
// Settings is deliberately NOT in main nav — reached via the small gear icon,
// per the "decluttering, not locking" access model.

function detectSeason(overrideSettings) {
  if (overrideSettings && overrideSettings.seasonalOverride) {
    return overrideSettings.seasonalOverride;
  }
  const now = new Date();
  const month = now.getMonth() + 1; // 1-12
  const day = now.getDate();

  if (month === 11 && day === 23) return 'birthday';
  if ([12, 1, 2].includes(month)) return 'winter';
  if ([3, 4, 5].includes(month)) return 'spring';
  if ([6, 7, 8].includes(month)) return 'summer';
  return 'fall';
}

async function applySeason() {
  const settings = await window.PlannerStorage.getSettings();
  const season = detectSeason(settings);
  document.body.className = document.body.className
    .replace(/season-\w+/g, '')
    .trim();
  document.body.classList.add(`season-${season}`);
}

const routes = {
  today: () => window.PlannerViews.today(mainEl()),
  'add-assignment': () => window.PlannerViews.addAssignment(mainEl()),
  reports: () => window.PlannerViews.reports(mainEl()),
  village: () => window.PlannerViews.village(mainEl()),
  settings: () => window.PlannerViews.settings(mainEl()),
  'home-practice': () => window.PlannerViews.homePractice(mainEl()),
};

function mainEl() {
  return document.getElementById('main-content');
}

function setActiveNav(route) {
  document.querySelectorAll('.bottom-nav button[data-route]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.route === route);
  });
}

async function navigate(route) {
  if (!routes[route]) route = 'today';
  await routes[route]();
  setActiveNav(route);
  window.location.hash = route;
}

window.PlannerApp = { navigate, detectSeason };

document.addEventListener('DOMContentLoaded', async () => {
  await applySeason();
  const startRoute = (window.location.hash || '#today').slice(1);
  navigate(startRoute);
});
