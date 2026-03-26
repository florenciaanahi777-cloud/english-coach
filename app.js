// Step 2: Web Speech API transcription

const btn = document.getElementById('main-btn');
const statusEl = document.getElementById('status');
const finalTextEl = document.getElementById('final-text');
const interimTextEl = document.getElementById('interim-text');

// Check browser support
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

// Toggle recording on button press
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
  statusEl.textContent = finalTranscript.trim()
    ? 'Here\'s what I heard:'
    : 'Nothing captured — try again.';
}

// Update transcript as speech comes in
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

// If recognition stops mid-session (Chrome timeout), restart it
recognition.onend = () => {
  if (isRecording) {
    recognition.start();
  }
};

// Handle errors
recognition.onerror = (event) => {
  if (event.error === 'not-allowed') {
    statusEl.textContent = 'Microphone access denied — allow it in Chrome settings.';
  } else {
    statusEl.textContent = 'Error: ' + event.error;
  }
  isRecording = false;
  btn.textContent = 'Start';
  btn.classList.remove('recording');
};
