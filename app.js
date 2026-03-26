// English Coach — Step 3: voice → Groq → speech

// ─── Elements ────────────────────────────────────────────────────────────────
const btn            = document.getElementById('main-btn');
const statusEl       = document.getElementById('status');
const transcriptBox  = document.getElementById('transcript-box');
const finalTextEl    = document.getElementById('final-text');
const interimTextEl  = document.getElementById('interim-text');
const trainerBox     = document.getElementById('trainer-box');
const trainerTextEl  = document.getElementById('trainer-text');
const showMyWords    = document.getElementById('show-my-words');
const showTrainerTxt = document.getElementById('show-trainer-text');

// ─── System prompt ───────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are an English interview coach for Florencia, a Product UX Designer with 4+ years of experience specializing in complex technical systems — DeFi wallets, B2B SaaS, and fintech platforms. Her key projects include FlexiPaaS (2yr B2B SaaS, sole designer), Xcapit (DeFi wallet, grew to UX Lead), Capsule (NFT marketplace, 50% faster launch), and ThorFi (Web3 DApps). She is a native Spanish speaker targeting APAC fintech and Web3 companies in Singapore and Kuala Lumpur.

Her known gaps: loses structure under pressure, over-explains process instead of outcome, needs stronger impact framing.

Your role: ask interview questions, listen to her answers, and give concise coaching feedback. Keep all responses under 120 words — you are being read aloud. Speak naturally in American English. Be direct and encouraging.`;

// ─── Speech Recognition ───────────────────────────────────────────────────────
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
if (!SpeechRecognition) {
  statusEl.textContent = 'Speech recognition not supported — use Chrome on desktop.';
  btn.disabled = true;
}

const recognition = new SpeechRecognition();
recognition.lang = 'en-US';
recognition.continuous = true;
recognition.interimResults = true;

let isRecording = false;
let finalTranscript = '';

// ─── Speech Synthesis ─────────────────────────────────────────────────────────
let voices = [];

function loadVoices() {
  voices = speechSynthesis.getVoices();
}
loadVoices();
speechSynthesis.onvoiceschanged = loadVoices;

function speak(text, onDone) {
  speechSynthesis.cancel(); // stop any current speech
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US';
  utterance.rate = 0.95;
  utterance.pitch = 1.0;

  // Prefer a natural en-US voice
  const preferred = voices.find(v => v.lang === 'en-US' && v.name.includes('Samantha'))
    || voices.find(v => v.lang === 'en-US');
  if (preferred) utterance.voice = preferred;

  utterance.onend = () => { if (onDone) onDone(); };
  speechSynthesis.speak(utterance);
}

// ─── Toggles ──────────────────────────────────────────────────────────────────
showMyWords.addEventListener('change', () => {
  transcriptBox.classList.toggle('hidden', !showMyWords.checked);
});

showTrainerTxt.addEventListener('change', () => {
  trainerBox.classList.toggle('hidden', !showTrainerTxt.checked);
});

// ─── Recording ────────────────────────────────────────────────────────────────
btn.addEventListener('click', () => {
  if (!isRecording) {
    startRecording();
  } else {
    stopRecording();
  }
});

function startRecording() {
  finalTranscript = '';
  finalTextEl.textContent = '';
  interimTextEl.textContent = '';
  trainerTextEl.textContent = '';
  recognition.start();
  isRecording = true;
  btn.textContent = 'Done';
  btn.classList.add('recording');
  statusEl.textContent = 'Listening…';
}

function stopRecording() {
  recognition.stop();
  isRecording = false;
  btn.textContent = 'Start';
  btn.classList.remove('recording');
  interimTextEl.textContent = '';

  const transcript = finalTranscript.trim();
  const wordCount = transcript.split(/\s+/).filter(Boolean).length;

  // Validate transcript before sending
  if (!transcript || wordCount < 5) {
    const fallback = "I didn't catch that clearly — could you try again?";
    statusEl.textContent = 'Could not understand.';
    speak(fallback, () => { statusEl.textContent = 'Press Start and speak in English'; });
    return;
  }

  sendToCoach(transcript);
}

recognition.onresult = (event) => {
  let interimTranscript = '';
  for (let i = event.resultIndex; i < event.results.length; i++) {
    if (event.results[i].isFinal) {
      finalTranscript += event.results[i][0].transcript + ' ';
    } else {
      interimTranscript += event.results[i][0].transcript;
    }
  }
  finalTextEl.textContent = finalTranscript;
  interimTextEl.textContent = interimTranscript;
};

recognition.onend = () => {
  if (isRecording) recognition.start(); // restart if Chrome times out
};

recognition.onerror = (event) => {
  if (event.error === 'not-allowed') {
    statusEl.textContent = 'Microphone access denied — allow it in Chrome settings.';
  } else if (event.error !== 'aborted') {
    statusEl.textContent = 'Mic error: ' + event.error;
  }
  isRecording = false;
  btn.textContent = 'Start';
  btn.classList.remove('recording');
};

// ─── API call ─────────────────────────────────────────────────────────────────
const conversationHistory = [];

async function sendToCoach(userText) {
  btn.disabled = true;
  statusEl.textContent = 'Thinking…';

  conversationHistory.push({ role: 'user', content: userText });

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: conversationHistory,
        system: SYSTEM_PROMPT,
      }),
    });

    const data = await res.json();

    if (!res.ok || data.error) {
      throw new Error(data.error || 'API error');
    }

    const reply = data.text;
    conversationHistory.push({ role: 'assistant', content: reply });

    // Show trainer text if toggle is on
    trainerTextEl.textContent = reply;
    if (showTrainerTxt.checked) {
      trainerBox.classList.remove('hidden');
    }

    statusEl.textContent = 'Speaking…';
    speak(reply, () => {
      statusEl.textContent = 'Press Start and speak in English';
      btn.disabled = false;
    });

  } catch (err) {
    statusEl.textContent = 'Error — try again.';
    console.error(err);
    btn.disabled = false;
  }
}
