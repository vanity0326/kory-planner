// One-time guided tour, shown only the very first time the app opens on a
// given device. Deliberately per-DEVICE (plain localStorage), not shared —
// this is the one piece of state that should NOT sync through the shared
// Netlify Blobs storage, since "has this device seen the intro" has nothing
// to do with Kory/parent's shared data and syncing it would mean whichever
// of them opens the app first silently uses up the other's first-run tour.
//
// Design intent (see conversation: Kory is hesitant to try new things, not
// bored): short, skippable at every step, static positioning only — no
// animated movement between steps, consistent with the app's no-motion
// rule. The goal is lowering the barrier to a first tap, not a feature tour.

const TOUR_SEEN_KEY = 'koryPlannerTourSeen';

const STEPS = [
  {
    selector: '.doing-screen h1',
    text: "This is your Today list. Anything you need to do shows up right here.",
  },
  {
    selector: '#add-assignment-btn',
    text: "Tap here any time you want to add something — homework, a test, anything.",
  },
  {
    selector: '.bottom-nav',
    text: "These buttons take you to practice logging, your trophies, and reports. Nothing here can break — feel free to look around.",
  },
];

function hasSeenTour() {
  try {
    return localStorage.getItem(TOUR_SEEN_KEY) === '1';
  } catch (err) {
    return true; // if storage is blocked, don't force the tour on every load
  }
}

function markTourSeen() {
  try {
    localStorage.setItem(TOUR_SEEN_KEY, '1');
  } catch (err) {
    // ignore — worst case the tour reappears once more
  }
}

function buildOverlay() {
  const overlay = document.createElement('div');
  overlay.className = 'tour-overlay';
  overlay.innerHTML = `
    <div class="tour-highlight"></div>
    <div class="tour-card">
      <p class="tour-text"></p>
      <div class="tour-dots"></div>
      <div class="tour-actions">
        <button type="button" class="tour-skip">Skip</button>
        <button type="button" class="tour-next"></button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
  return overlay;
}

function positionHighlight(overlay, selector) {
  const target = document.querySelector(selector);
  const highlight = overlay.querySelector('.tour-highlight');
  const card = overlay.querySelector('.tour-card');
  if (!target) {
    highlight.style.display = 'none';
    card.style.top = '40%';
    card.style.left = '50%';
    card.style.transform = 'translate(-50%, -50%)';
    return;
  }
  const rect = target.getBoundingClientRect();
  const pad = 8;
  highlight.style.display = 'block';
  highlight.style.top = `${rect.top - pad}px`;
  highlight.style.left = `${rect.left - pad}px`;
  highlight.style.width = `${rect.width + pad * 2}px`;
  highlight.style.height = `${rect.height + pad * 2}px`;

  const spaceBelow = window.innerHeight - rect.bottom;
  card.style.transform = 'none';
  if (spaceBelow > 160) {
    card.style.top = `${rect.bottom + 16}px`;
    card.style.bottom = 'auto';
  } else {
    card.style.top = 'auto';
    card.style.bottom = `${window.innerHeight - rect.top + 16}px`;
  }
  card.style.left = '16px';
  card.style.right = '16px';
}

function renderStep(overlay, index) {
  const step = STEPS[index];
  const isLast = index === STEPS.length - 1;
  overlay.querySelector('.tour-text').textContent = step.text;
  overlay.querySelector('.tour-next').textContent = isLast ? 'Got it' : 'Next';
  overlay.querySelector('.tour-dots').innerHTML = STEPS.map((_, i) =>
    `<span class="tour-dot ${i === index ? 'active' : ''}"></span>`
  ).join('');
  positionHighlight(overlay, step.selector);
}

function startTour() {
  const overlay = buildOverlay();
  let stepIndex = 0;
  renderStep(overlay, stepIndex);

  const onResize = () => positionHighlight(overlay, STEPS[stepIndex].selector);
  window.addEventListener('resize', onResize);

  function end() {
    markTourSeen();
    window.removeEventListener('resize', onResize);
    overlay.remove();
  }

  overlay.querySelector('.tour-skip').addEventListener('click', end);
  overlay.querySelector('.tour-next').addEventListener('click', () => {
    stepIndex += 1;
    if (stepIndex >= STEPS.length) {
      end();
    } else {
      renderStep(overlay, stepIndex);
    }
  });
}

// Only ever called when the app has just landed on Today with no hash —
// i.e. a genuine fresh open, not a mid-session nav to Today.
function maybeStartTour() {
  if (hasSeenTour()) return;
  // Slight defer so the Today view has finished painting before we
  // measure element positions for the highlight box.
  setTimeout(startTour, 50);
}

window.PlannerTour = { maybeStartTour };
