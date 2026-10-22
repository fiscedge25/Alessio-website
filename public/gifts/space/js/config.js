/**
 * Interstellar Journey — Configuration
 * A ship, a route, seven worlds. Edit anything below.
 */
window.SPACE_DATE_CONFIG = {
  // Left empty on purpose: the names are typed in on the opening screen
  // (and remembered in the browser). Fill these in to pre-set a default.
  recipientName: "",
  senderName: "",
  namePlaceholders: { recipient: "Her name", sender: "Your name" },

  shipName: "S.S. STARLIGHT",

  introSequence: [
    { text: "She asked me to take her out…", delay: 800, duration: 2800 },
    { text: "…so I built us a ship instead.", delay: 700, duration: 3000 },
    { text: "Seven worlds. One trip. Ready?", delay: 700, duration: 2800 }
  ],
  ctaButtonText: "I'm ready",

  // The journey flies itself: how long we linger in orbit before the next jump
  autoPilot: { enabled: true, holdMs: 7000 },

  distanceUnits: "km",

  // Flight duration of each warp jump (ms) — must match the engine constant
  warpDuration: 2800,

  planetStops: [
    {
      id: "earth", name: "Earth", type: "earth",
      subTitle: "Departure Point", label: "Set course: Moon",
      distance: 0, travelTime: "T-00:00", velocity: "0.00 c",
      caption: "Every good trip starts with a yes.",
      quote: "Engines warm. The ordinary world is behind us.",
      logEntry: "Orbital departure confirmed. Atmosphere clear. Two passengers locked into the journey.",
      accentColor: "#38bdf8", glowColor: "rgba(56,189,248,0.45)", atmosphereHue: "#3b9dff",
      scale: 1.05, rotationSpeed: 0.0016
    },
    {
      id: "moon", name: "The Moon", type: "moon",
      subTitle: "First Stop", label: "Set course: Venus",
      distance: 384400, travelTime: "00:41", velocity: "0.09 c",
      caption: "First stop: somewhere quiet enough to hear your heartbeat.",
      quote: "Silver dust, no wind, and the Earth hanging behind us.",
      logEntry: "Lunar orbit established. Grey seas of dust below. The universe suddenly feels very intimate.",
      accentColor: "#e2e8f0", glowColor: "rgba(226,232,240,0.35)", atmosphereHue: "#a8b6c8",
      scale: 0.85, rotationSpeed: 0.0011
    },
    {
      id: "venus", name: "Venus", type: "venus",
      subTitle: "Second Stop", label: "Set course: Mars",
      distance: 41000000, travelTime: "02:18", velocity: "0.31 c",
      caption: "The brightest thing in the sky. Second brightest, now.",
      quote: "Golden acid clouds turning slowly, burning slowly.",
      logEntry: "Cloud deck entry aborted — 460°C outside, warm enough already inside. Holding high orbit.",
      accentColor: "#fbbf24", glowColor: "rgba(251,191,36,0.42)", atmosphereHue: "#e8a33d",
      scale: 1.0, rotationSpeed: 0.0009
    },
    {
      id: "mars", name: "Mars", type: "mars",
      subTitle: "Third Stop", label: "Set course: Jupiter",
      distance: 225000000, travelTime: "05:40", velocity: "0.48 c",
      caption: "A little further than dinner plans.",
      quote: "Crimson horizons and warm red dust.",
      logEntry: "Approaching the Red Planet. Olympus Mons on the terminator. Definitely beats a table for two.",
      accentColor: "#fb923c", glowColor: "rgba(251,146,60,0.45)", atmosphereHue: "#e2703a",
      scale: 0.95, rotationSpeed: 0.0015
    },
    {
      id: "jupiter", name: "Jupiter", type: "jupiter",
      subTitle: "The Giant", label: "Set course: Saturn",
      distance: 628730000, travelTime: "11:02", velocity: "0.67 c",
      caption: "For a trip this big, one small planet wasn't enough.",
      quote: "Endless amber storms, wider than our whole world.",
      logEntry: "Great Red Spot in full view — a hurricane older than every love song ever written.",
      accentColor: "#f59e0b", glowColor: "rgba(245,158,11,0.45)", atmosphereHue: "#d99a4e",
      scale: 1.45, rotationSpeed: 0.0022
    },
    {
      id: "saturn", name: "Saturn", type: "saturn",
      subTitle: "The Hero Stop", label: "Set course: Neptune",
      distance: 1275000000, travelTime: "18:24", velocity: "0.81 c",
      caption: "Turns out Saturn makes a pretty good window view.",
      quote: "A billion ice crystals, all catching the same light.",
      logEntry: "Gliding through the Cassini gap. Rings tilted 27°. Best view in the solar system, held for you.",
      accentColor: "#fde047", glowColor: "rgba(253,224,71,0.5)", atmosphereHue: "#e3c07a",
      hasRings: true, scale: 1.3, rotationSpeed: 0.002
    },
    {
      id: "neptune", name: "Neptune", type: "neptune",
      subTitle: "The Outer Edge", label: "Final approach",
      distance: 4351400000, travelTime: "31:57", velocity: "0.94 c",
      caption: "The edge of everything. Still not far enough.",
      quote: "Deep cobalt silence where the sunlight finally gives up.",
      logEntry: "Final coordinates reached. 4.3 billion kilometres from home, and the best part is still sitting next to me.",
      accentColor: "#60a5fa", glowColor: "rgba(96,165,250,0.5)", atmosphereHue: "#3d7fe0",
      scale: 1.2, rotationSpeed: 0.0024
    },
    {
      id: "sun", name: "The Sun", type: "sun", secret: true,
      subTitle: "The Surprise", label: "Surprise me",
      distance: 149600000, travelTime: "44:09", velocity: "0.99 c",
      caption: "Turns out everything out here orbits one burning heart.",
      quote: "Look closely — it has been drawn on the sky the whole time.",
      logEntry: "Unlisted destination. Course set for the centre of everything, 149,600,000 km and one heartbeat away.",
      accentColor: "#fbbf24", glowColor: "rgba(251,191,36,0.55)", atmosphereHue: "#ff9a3d",
      scale: 1.55, rotationSpeed: 0.0006
    }
  ],

  journeyEnd: {
    badge: "END OF THE LINE",
    title: "4,351,400,000 km",
    message: "That's how far we just went. The ship holds course, the engines are quiet, and there's nothing out here but us and the light.",
    footer: "Made for you, because a normal trip wasn't enough.",
    btnReplay: "Start over ↺",
    btnSurprise: "Surprise me ✦"
  },

  // Shown once the secret stop is reached. {her} and {me} become the crew names.
  surprise: {
    badge: "THE LAST STOP",
    title: "The heart of it",
    message: "Eight worlds, four billion kilometres of cold, and every single one of them quietly circling the same burning heart. I know exactly how they feel, {her}.",
    footer: "Look at the sun. That shape isn't an accident."
  },

  audio: { enabledByDefault: true, volume: 0.5 }
};
