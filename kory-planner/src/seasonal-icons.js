// Richer static seasonal decoration for the Achievements screen ONLY.
// Replaces the old single-emoji marker with a small row of illustrated
// icons — still flat/simple like stage-icons.js, still STATIC (no drift,
// no animation, no motion of any kind — see seasonal.css header comment
// for why that's a hard rule, not a style choice).
//
// Each season gets exactly 3 icons, sized small (22px) and placed in a
// quiet row so they read as an accent, not a distraction from the avatar
// card / Trophy Case / Rafters below them.

const SEASONAL_ICON_SETS = {
  winter: [
    // Snowflake
    `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2V22M12 2L9.5 4.5M12 2L14.5 4.5M12 22L9.5 19.5M12 22L14.5 19.5
               M4 7L20 17M4 7L7 6.5M4 7L4.5 10M20 17L17 17.5M20 17L19.5 14
               M20 7L4 17M20 7L17 6.5M20 7L19.5 10M4 17L7 17.5M4 17L4.5 14"
            stroke="#85b7eb" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,
    // Mitten
    `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M7 9C7 6.5 8.8 5 11 5C13.2 5 15 6.5 15 9V12H16.5C17.3 12 18 12.7 18 13.5V18C18 19.7 16.7 21 15 21H9C7.3 21 6 19.7 6 18V13.5C6 12.7 6.7 12 7.5 12H7V9Z" fill="#c14e4e" stroke="#8f3535" stroke-width="1.3" stroke-linejoin="round"/>
      <rect x="6" y="17.5" width="12" height="2.2" rx="1.1" fill="#f4f3ef"/>
    </svg>`,
    // Hot cocoa mug
    `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M5 10H16V16C16 18.2 14.2 20 12 20H9C6.8 20 5 18.2 5 16V10Z" fill="#a8781c" stroke="#7a5612" stroke-width="1.3" stroke-linejoin="round"/>
      <path d="M16 12H17.5C18.6 12 19.5 12.9 19.5 14C19.5 15.1 18.6 16 17.5 16H16" stroke="#7a5612" stroke-width="1.3" fill="none"/>
      <path d="M8 5C8 6 9 6 9 7C9 8 8 8 8 9M12 5C12 6 13 6 13 7C13 8 12 8 12 9" stroke="#c9a05c" stroke-width="1.3" stroke-linecap="round" fill="none"/>
    </svg>`,
  ],
  summer: [
    // Sun
    `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="5" fill="#f0b429" stroke="#c98f1a" stroke-width="1.2"/>
      <path d="M12 2V4.5M12 19.5V22M22 12H19.5M4.5 12H2M19 5L17.2 6.8M6.8 17.2L5 19M19 19L17.2 17.2M6.8 6.8L5 5" stroke="#e0862e" stroke-width="1.6" stroke-linecap="round"/>
    </svg>`,
    // Beach ball
    `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="8" fill="#f4f3ef" stroke="#3aa9c9" stroke-width="1.3"/>
      <path d="M12 4C12 4 15 8 15 12C15 16 12 20 12 20C12 20 9 16 9 12C9 8 12 4 12 4Z" fill="#3aa9c9"/>
      <path d="M4.5 9C4.5 9 8.5 10.5 12 10.5C15.5 10.5 19.5 9 19.5 9M4.5 15C4.5 15 8.5 13.5 12 13.5C15.5 13.5 19.5 15 19.5 15" stroke="#e0862e" stroke-width="1.2" fill="none"/>
    </svg>`,
    // Pool float (ring)
    `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="8.5" fill="none" stroke="#e07ba0" stroke-width="3.2"/>
      <circle cx="12" cy="12" r="8.5" fill="none" stroke="#f4f3ef" stroke-width="3.2" stroke-dasharray="3 4.3"/>
    </svg>`,
  ],
  fall: [
    // Maple leaf
    `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 3L13.5 8L18 6L16 10.5L21 11L16.5 13.5L19 18L14 16.5L14.5 21L12 17.5L9.5 21L10 16.5L5 18L7.5 13.5L3 11L8 10.5L6 6L10.5 8L12 3Z" fill="#d85a30" stroke="#a53f1f" stroke-width="1"/>
      <path d="M12 11V19" stroke="#a53f1f" stroke-width="1.1"/>
    </svg>`,
    // Acorn
    `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 11C8 15 9.5 20 12 20C14.5 20 16 15 16 11C16 8.2 14.2 7 12 7C9.8 7 8 8.2 8 11Z" fill="#c9925a" stroke="#8f6236" stroke-width="1.2"/>
      <path d="M7.5 8C7.5 6 9.5 4.5 12 4.5C14.5 4.5 16.5 6 16.5 8C16.5 8.8 15.8 9.3 15 9C13.8 8.5 13 8.5 12 8.5C11 8.5 10.2 8.5 9 9C8.2 9.3 7.5 8.8 7.5 8Z" fill="#6e4f2a"/>
    </svg>`,
    // Pumpkin
    `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 3.5V6" stroke="#4f7942" stroke-width="1.4" stroke-linecap="round"/>
      <ellipse cx="12" cy="13" rx="8" ry="7" fill="#e0862e" stroke="#a85f1f" stroke-width="1.2"/>
      <path d="M12 6V20M8 6.5C7 8 6.5 10.5 6.5 13C6.5 15.5 7 18 8 19.5M16 6.5C17 8 17.5 10.5 17.5 13C17.5 15.5 17 18 16 19.5" stroke="#a85f1f" stroke-width="1" fill="none"/>
    </svg>`,
  ],
  spring: [
    // Flower
    `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="7" r="2.6" fill="#ed93b1"/>
      <circle cx="17" cy="12" r="2.6" fill="#ed93b1"/>
      <circle cx="12" cy="17" r="2.6" fill="#ed93b1"/>
      <circle cx="7" cy="12" r="2.6" fill="#ed93b1"/>
      <circle cx="12" cy="12" r="2.6" fill="#f0b429"/>
      <path d="M12 17V21" stroke="#4f7942" stroke-width="1.4" stroke-linecap="round"/>
    </svg>`,
    // Raindrop
    `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 3C12 3 6 11 6 15.5C6 18.5 8.7 21 12 21C15.3 21 18 18.5 18 15.5C18 11 12 3 12 3Z" fill="#7db8d6" stroke="#4a8bab" stroke-width="1.2" stroke-linejoin="round"/>
      <path d="M9.5 15.5C9.5 16.9 10.5 18 12 18" stroke="#f4f3ef" stroke-width="1.3" stroke-linecap="round" fill="none"/>
    </svg>`,
    // Umbrella
    `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 12C4 7.6 7.6 4 12 4C16.4 4 20 7.6 20 12H4Z" fill="#ed93b1" stroke="#c96a8d" stroke-width="1.2" stroke-linejoin="round"/>
      <path d="M12 12V19.5C12 20.3 11.3 21 10.5 21C9.7 21 9 20.3 9 19.5" stroke="#8f5a6f" stroke-width="1.3" stroke-linecap="round" fill="none"/>
    </svg>`,
  ],
  birthday: [
    // Cake
    `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="5" y="13" width="14" height="7" rx="1.5" fill="#f0997b" stroke="#c96a4a" stroke-width="1.2"/>
      <path d="M5 16H19" stroke="#c96a4a" stroke-width="1"/>
      <path d="M9 13V10M12 13V10M15 13V10" stroke="#c96a4a" stroke-width="1.2" stroke-linecap="round"/>
      <path d="M9 8C9 8 8.3 7.3 9 6.5C9.7 5.7 9 5 9 5M12 8C12 8 11.3 7.3 12 6.5C12.7 5.7 12 5 12 5M15 8C15 8 14.3 7.3 15 6.5C15.7 5.7 15 5 15 5" stroke="#e0862e" stroke-width="1.1" stroke-linecap="round" fill="none"/>
    </svg>`,
    // Balloon
    `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 3C8.5 3 6.5 6 6.5 9C6.5 12.5 9 15 12 15C15 15 17.5 12.5 17.5 9C17.5 6 15.5 3 12 3Z" fill="#e07ba0" stroke="#b8547a" stroke-width="1.2"/>
      <path d="M12 15L11 17L13 18L11 19.5L13 21" stroke="#8f5a6f" stroke-width="1" fill="none"/>
    </svg>`,
    // Candle
    `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="10" y="9" width="4" height="12" rx="1" fill="#f4f3ef" stroke="#c9c4b8" stroke-width="1.1"/>
      <path d="M12 9V6" stroke="#c9924a" stroke-width="1.2"/>
      <path d="M12 6C12 6 10.7 4.7 12 3C13.3 4.7 12 6 12 6Z" fill="#f0b429"/>
    </svg>`,
  ],
};

window.PlannerSeasonalIcons = SEASONAL_ICON_SETS;
