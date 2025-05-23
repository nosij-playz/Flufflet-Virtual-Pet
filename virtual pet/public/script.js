const MAX_UNITS = 10;
const MIN_UNITS = 0;
let petVoices = [];
let availableVoices = [];

speechSynthesis.onvoiceschanged = () => {
  availableVoices = speechSynthesis.getVoices();
};

function fetchPetVoices() {
  fetch("voice.json")
    .then(res => res.json())
    .then(data => {
      petVoices = data;
      startVoiceInterval();
    })
    .catch(err => {
      console.error("Failed to load voice.json:", err);
    });
}

function displayVoiceMessage(message) {
  const bubble = document.getElementById("speech-bubble");
  if (!bubble) return;

  bubble.textContent = message;
  bubble.style.opacity = 1;

  const utterance = new SpeechSynthesisUtterance(message);
  const preferredVoice = availableVoices.find(v => v.lang === 'en-US' && v.name.includes("Google"));
  if (preferredVoice) {
    utterance.voice = preferredVoice;
  }

  speechSynthesis.cancel();
  speechSynthesis.speak(utterance);

  setTimeout(() => {
    bubble.style.opacity = 0;
  }, 5000);
}

function speakFromVoiceJson() {
  if (!petVoices.length) return;

  const randomIndex = Math.floor(Math.random() * petVoices.length);
  const message = petVoices[randomIndex];
  displayVoiceMessage(message);
}

function startVoiceInterval() {
  speakFromVoiceJson();
  setInterval(speakFromVoiceJson, 120000);
}

const emojiMap = {
  feed: {
    id: "hunger",
    symbol: "🍗",
    sound: "sounds/feed.mp3",
    decrease: []
  },
  play: {
    id: "happiness",
    symbol: "❤️",
    sound: "sounds/play.mp3",
    decrease: [
      { id: "energy", symbol: "⚡" },
      { id: "hunger", symbol: "🍗" }
    ]
  },
  sleep: {
    id: "energy",
    symbol: "⚡",
    sound: "sounds/sleep.mp3",
    decrease: [
      { id: "hunger", symbol: "🍗" },
      { id: "happiness", symbol: "❤️", half: true }
    ]
  }
};

function getEmojiCount(text, emoji) {
  return text.split(emoji).length - 1;
}

function setEmojiCount(span, emoji, count) {
  const clamped = Math.max(MIN_UNITS, Math.min(MAX_UNITS, count));
  span.textContent = emoji.repeat(clamped);
}

function playSound(src) {
  const audio = new Audio(src);
  audio.play().catch(err => {
    console.error("Failed to play sound:", src, err);
  });
}

function handleAction(action) {
  const actionData = emojiMap[action];
  if (!actionData) return;

  const { id, symbol, sound, decrease } = actionData;
  playSound(sound);

  const mainSpan = document.getElementById(id);
  if (!mainSpan) return;

  let mainCount = getEmojiCount(mainSpan.textContent, symbol);
  if (mainCount < MAX_UNITS) {
    mainCount += 1;
    setEmojiCount(mainSpan, symbol, mainCount);
  }

  decrease.forEach(({ id: decId, symbol: decSymbol, half }) => {
    const decSpan = document.getElementById(decId);
    if (!decSpan) return;
    let decCount = getEmojiCount(decSpan.textContent, decSymbol);
    if (half) {
      decCount = Math.floor(decCount / 2);
    } else if (decCount > 0) {
      decCount -= 1;
    }
    setEmojiCount(decSpan, decSymbol, decCount);
  });

  checkZeroStats();
}
function petSing() {
  const songFiles = [
    "sounds/songs/song1.mp3",
    "sounds/songs/song2.mp3",
    "sounds/songs/song3.mp3"
    // Add more songs as needed
  ];

  const randomSong = songFiles[Math.floor(Math.random() * songFiles.length)];
  const bubble = document.getElementById("speech-bubble");
  if (!bubble) return;

  // Optional: Show bubble text while playing
  bubble.textContent = "🎵 Singing a song for you!";
  bubble.style.opacity = 1;

  const audio = new Audio(randomSong);
  audio.play()
    .then(() => {
      console.log("Playing:", randomSong);
    })
    .catch(err => {
      console.error("Failed to play song:", err);
    });

  // Hide bubble after song ends
  audio.onended = () => {
    bubble.style.opacity = 0;
  };

  // Cancel any ongoing TTS
  speechSynthesis.cancel();
}
function checkZeroStats() {
  const stats = [
    { id: "hunger", symbol: "🍗", alertSound: "sounds/feedme.mp3" },
    { id: "happiness", symbol: "❤️", alertSound: "sounds/sadme.mp3" },
    { id: "energy", symbol: "⚡", alertSound: "sounds/tiredme.mp3" }
  ];

  stats.forEach(({ id, symbol, alertSound }) => {
    const span = document.getElementById(id);
    if (!span) return;
    const count = getEmojiCount(span.textContent, symbol);
    if (count === 0) {
      playSound(alertSound);
    }
  });
}

const babySounds = [
  "sounds/baby1.mp3",
  "sounds/baby2.mp3",
  "sounds/baby3.mp3",
  "sounds/baby4.mp3",
  "sounds/baby5.mp3"
];

function getRandomFloat(min, max) {
  return Math.random() * (max - min) + min;
}

function petSpeak() {
  if (!babySounds.length) return;

  const soundSrc = babySounds[Math.floor(Math.random() * babySounds.length)];
  const audio = new Audio(soundSrc);
  audio.play().catch(err => {
    console.error("Failed to play baby sound:", err);
  });

  const viewer = document.getElementById("pet");
  if (viewer) {
    const randomX = getRandomFloat(-3, 3);
    const randomY = getRandomFloat(-3, 3);
    const randomZ = getRandomFloat(-3, 3);

    viewer.postMessage(
      {
        action: "update",
        updates: [
          {
            name: "PetObject",
            position: { x: randomX, y: randomY, z: randomZ }
          }
        ]
      },
      "*"
    );
  }
}

function setupMobileShakeListener() {
  let lastShakeTime = 0;
  const shakeThreshold = 15;
  const shakeCooldown = 1000;

  window.addEventListener("devicemotion", (event) => {
    const acc = event.accelerationIncludingGravity;
    if (!acc) return;

    const magnitude = Math.sqrt(acc.x ** 2 + acc.y ** 2 + acc.z ** 2);
    const now = Date.now();

    if (magnitude > shakeThreshold && now - lastShakeTime > shakeCooldown) {
      lastShakeTime = now;
      petSpeak();
    }
  });
}

// DeviceMotion permission logic
if (typeof DeviceMotionEvent.requestPermission === "function") {
  DeviceMotionEvent.requestPermission()
    .then(state => {
      if (state === "granted") setupMobileShakeListener();
    })
    .catch(console.error);
} else {
  setupMobileShakeListener();
}
document.getElementById("sing-btn")?.addEventListener("click", petSing);
// DOM Initialization
document.addEventListener("DOMContentLoaded", () => {
  const petElement = document.getElementById("pet");
  if (petElement) {
    petElement.addEventListener("click", petSpeak);
  }

  ["feed", "play", "sleep"].forEach(action => {
    const btn = document.getElementById(`${action}-btn`);
    if (btn) {
      btn.addEventListener("click", () => handleAction(action));
    }
  });

  fetchPetVoices();
});
