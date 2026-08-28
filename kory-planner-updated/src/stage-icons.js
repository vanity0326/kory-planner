// Illustrated stage icons for the athlete-arc avatar system.
// Flat, multi-color SVG (not photorealistic) so it stays crisp at any size,
// needs no external image assets, and matches the app's existing lightweight
// single-file-source approach. Each icon lives at viewBox 0 0 64 64.
//
// Stage keys correspond 1:1 with PlannerAvatar's stage names:
//   rookie | starter | rising-star | all-star | mvp
// Two avatar levels share each stage (see STAGE_NAMES in avatar.js), and
// this file mirrors that with STAGE_KEYS so both label and icon stay in sync.

const STAGE_KEYS = ['rookie', 'rookie', 'starter', 'starter', 'rising-star', 'rising-star', 'all-star', 'all-star', 'mvp', 'mvp'];

function stageKeyForLevel(level) {
  return STAGE_KEYS[Math.min(level - 1, STAGE_KEYS.length - 1)];
}

// Each stage also carries a background tint (for the avatar-visual circle
// and rafter banners) so the color story reads at a glance even before
// anyone reads the label.
const STAGE_COLORS = {
  'rookie': { bg: '#e7edf2', accent: '#5b7891' },
  'starter': { bg: '#dde6f0', accent: '#2c4a6e' },
  'rising-star': { bg: '#fdecd4', accent: '#e0862e' },
  'all-star': { bg: '#f7e3d8', accent: '#a83f2b' },
  'mvp': { bg: '#faedc9', accent: '#b8811c' },
};

const ICONS = {
  // Plain jersey, muted slate-blue, single small star — just starting out.
  rookie: `
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M22 10L14 16V26H20V52C20 53.1 20.9 54 22 54H42C43.1 54 44 53.1 44 52V26H50V16L42 10L36 14H28L22 10Z" fill="#7c98b3" stroke="#4a6c8c" stroke-width="2" stroke-linejoin="round"/>
      <path d="M28 14C28 14 29.5 17 32 17C34.5 17 36 14 36 14" stroke="#4a6c8c" stroke-width="2" fill="none" stroke-linecap="round"/>
      <path d="M32 30L33.8 34.4L38.5 34.9L34.9 37.9L36 42.5L32 40L28 42.5L29.1 37.9L25.5 34.9L30.2 34.4L32 30Z" fill="#f4f3ef" stroke="#4a6c8c" stroke-width="1.2" stroke-linejoin="round"/>
    </svg>
  `,
  // Numbered jersey, navy + gold — a real position on the team now.
  starter: `
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M22 10L14 16V26H20V52C20 53.1 20.9 54 22 54H42C43.1 54 44 53.1 44 52V26H50V16L42 10L36 14H28L22 10Z" fill="#2c4a6e" stroke="#1c3350" stroke-width="2" stroke-linejoin="round"/>
      <path d="M28 14C28 14 29.5 17 32 17C34.5 17 36 14 36 14" stroke="#e0a940" stroke-width="2" fill="none" stroke-linecap="round"/>
      <path d="M22 10L14 16V26H20V20" stroke="#e0a940" stroke-width="1.5" fill="none" stroke-linecap="round"/>
      <path d="M42 10L50 16V26H44V20" stroke="#e0a940" stroke-width="1.5" fill="none" stroke-linecap="round"/>
      <text x="32" y="42" font-family="-apple-system, sans-serif" font-size="15" font-weight="700" fill="#e0a940" text-anchor="middle">23</text>
    </svg>
  `,
  // Jersey with a rising sunburst star — momentum, heating up.
  'rising-star': `
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M22 12L14 18V28H20V52C20 53.1 20.9 54 22 54H42C43.1 54 44 53.1 44 52V28H50V18L42 12L36 16H28L22 12Z" fill="#e8823c" stroke="#b65f22" stroke-width="2" stroke-linejoin="round"/>
      <path d="M32 6V12M24 8L26.5 13M40 8L37.5 13" stroke="#f0b429" stroke-width="2.2" stroke-linecap="round"/>
      <path d="M32 26L34.3 31.5L40 32.1L35.7 35.9L37 41.5L32 38.5L27 41.5L28.3 35.9L24 32.1L29.7 31.5L32 26Z" fill="#fbe7c6" stroke="#b65f22" stroke-width="1.2" stroke-linejoin="round"/>
    </svg>
  `,
  // Medal on ribbon — a real result to show for it.
  'all-star': `
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M24 8L32 26L40 8" stroke="#a83f2b" stroke-width="8" stroke-linejoin="round"/>
      <path d="M24 8L32 26L24 8Z" fill="#c14e35"/>
      <circle cx="32" cy="40" r="16" fill="#e0a940" stroke="#a8781c" stroke-width="2"/>
      <circle cx="32" cy="40" r="11" fill="#f4c96a" stroke="#a8781c" stroke-width="1.2"/>
      <path d="M32 33L34.2 38.3L40 38.9L35.6 42.6L37 48.3L32 45.1L27 48.3L28.4 42.6L24 38.9L29.8 38.3L32 33Z" fill="#a8781c"/>
    </svg>
  `,
  // Trophy with laurel — the top of this year's climb.
  mvp: `
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M22 14H42V26C42 32.6 37.5 38 32 38C26.5 38 22 32.6 22 26V14Z" fill="#f0b429" stroke="#a8781c" stroke-width="2" stroke-linejoin="round"/>
      <path d="M22 16H14V20C14 24 17.5 27 22 27.5" stroke="#a8781c" stroke-width="2" fill="none" stroke-linecap="round"/>
      <path d="M42 16H50V20C50 24 46.5 27 42 27.5" stroke="#a8781c" stroke-width="2" fill="none" stroke-linecap="round"/>
      <rect x="29" y="38" width="6" height="8" fill="#a8781c"/>
      <path d="M20 54H44L41 46H23L20 54Z" fill="#a8781c"/>
      <path d="M14 46C14 46 17 42 22 44C20 40 22 36 22 36C22 36 25 40 24 44" stroke="#4f7942" stroke-width="2" fill="#8fb96b" stroke-linejoin="round"/>
      <path d="M50 46C50 46 47 42 42 44C44 40 42 36 42 36C42 36 39 40 40 44" stroke="#4f7942" stroke-width="2" fill="#8fb96b" stroke-linejoin="round"/>
    </svg>
  `,
};

window.PlannerStageIcons = { ICONS, STAGE_COLORS, stageKeyForLevel };
