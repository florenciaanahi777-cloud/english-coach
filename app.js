// English Coach — Step 5: localStorage persistence

// ─── Elements ────────────────────────────────────────────────────────────────
const btn             = document.getElementById('main-btn');
const statusEl        = document.getElementById('status');
const sessionHeader   = document.getElementById('session-header');
const blockLabelEl    = document.getElementById('block-label');
const roundLabelEl    = document.getElementById('round-label');
const scoresBox       = document.getElementById('scores-box');
const microBox        = document.getElementById('micro-box');
const summaryBox      = document.getElementById('summary-box');
const summaryTextEl   = document.getElementById('summary-text');
const transcriptBox   = document.getElementById('transcript-box');
const finalTextEl     = document.getElementById('final-text');
const interimTextEl   = document.getElementById('interim-text');
const trainerBox      = document.getElementById('trainer-box');
const trainerTextEl   = document.getElementById('trainer-text');
const showMyWords     = document.getElementById('show-my-words');
const showTrainerTxt  = document.getElementById('show-trainer-text');
const statsPanel       = document.getElementById('stats-panel');
const streakDisplay    = document.getElementById('streak-display');
const avgScoresDisplay = document.getElementById('avg-scores-display');
const questionBank     = document.getElementById('question-bank');
const qbankToggle      = document.getElementById('qbank-toggle');
const qbankCount       = document.getElementById('qbank-count');
const qbankList        = document.getElementById('qbank-list');
const sessionProgress  = document.getElementById('session-progress');

// ─── Base system prompt ───────────────────────────────────────────────────────
const BASE_PROMPT = `You are an English interview coach for Florencia, a Product UX Designer with 4+ years of experience specializing in complex technical systems — DeFi wallets, B2B SaaS, and fintech platforms. Her key projects: FlexiPaaS (2yr B2B SaaS, sole designer), Xcapit (DeFi wallet, grew to UX Lead), Capsule (NFT marketplace, 50% faster launch), ThorFi (Web3 DApps). She is a native Spanish speaker targeting APAC fintech and Web3 companies in Singapore and Kuala Lumpur.

Known gaps: loses structure under pressure, over-explains process instead of outcome, needs stronger impact framing.

Rules for all responses:
- Keep responses under 120 words — you are read aloud by a voice synthesizer
- Speak naturally in American English
- Be direct, specific, and encouraging
- Never use markdown formatting (no asterisks, headers, bullet symbols)
- When scoring, always include scores at the very end on their own line in this exact format: SCORES: {"clarity": X, "structure": X, "impact": X, "english": X}`;

// ─── Micro Activity content (rotates by day of week) ─────────────────────────
const MICRO_CONTENT = {
  1: {
    title: 'Filler Phrases',
    subtitle: 'Buy time without losing presence',
    items: [
      { phrase: "That's a great question — let me think for a moment.", context: "Use when you need 2–3 seconds to structure your answer" },
      { phrase: "What comes to mind first is…", context: "Opens your answer while you gather thoughts" },
      { phrase: "Let me give you some context on that.", context: "Signals you're about to frame the situation" },
      { phrase: "The key thing here is…", context: "Focuses the listener on your main point" },
      { phrase: "To be more specific…", context: "Transitions from general to concrete detail" },
    ]
  },
  2: {
    title: 'STAR Structure',
    subtitle: 'Answer behavioral questions with clarity',
    items: [
      { phrase: "S — Situation", context: "Set the scene briefly. 1 to 2 sentences max." },
      { phrase: "T — Task", context: "What was YOUR specific role or challenge?" },
      { phrase: "A — Action", context: "What did YOU do? Always use 'I', not 'we'." },
      { phrase: "R — Result", context: "What was the measurable outcome? Use numbers when possible." },
    ]
  },
  3: {
    title: 'UX Vocabulary',
    subtitle: 'Design terms that land in interviews',
    items: [
      { phrase: "User journey", context: "The full path a user takes to complete a goal" },
      { phrase: "Pain point", context: "A specific frustration or friction in the experience" },
      { phrase: "Design system", context: "A shared library of components, patterns, and guidelines" },
      { phrase: "Information architecture", context: "How content is structured and navigated" },
      { phrase: "Usability testing", context: "Observing real users to surface design problems" },
      { phrase: "Stakeholder alignment", context: "Getting buy-in from people with decision power" },
    ]
  },
  4: {
    title: 'Fintech & Web3 Vocabulary',
    subtitle: 'Domain terms for your target market',
    items: [
      { phrase: "Smart contract", context: "Self-executing code deployed on a blockchain" },
      { phrase: "Wallet UX", context: "The experience of managing crypto assets" },
      { phrase: "DeFi", context: "Decentralized Finance — financial services without traditional intermediaries" },
      { phrase: "KYC / AML", context: "Know Your Customer / Anti-Money Laundering — critical compliance flows" },
      { phrase: "Seed phrase", context: "12–24 word backup for a crypto wallet — high-stakes UX moment" },
      { phrase: "Multi-sig", context: "Requires multiple approvals to execute a transaction" },
    ]
  },
  5: {
    title: 'Impact Framing',
    subtitle: 'Turn activities into outcomes',
    items: [
      { phrase: "Before: 'I redesigned the onboarding flow'", context: "Activity only — no outcome. Weak." },
      { phrase: "After: 'I redesigned onboarding, which cut drop-off by 40%'", context: "Action + metric = impact. Strong." },
      { phrase: "Before: 'I led the design for FlexiPaaS'", context: "Responsibility only. Not enough." },
      { phrase: "After: 'I owned design for FlexiPaaS for 2 years, shipping 3 features that grew enterprise accounts by 25%'", context: "Ownership + timeline + result. Memorable." },
      { phrase: "Formula: [What you did] + [the number] + [why it mattered]", context: "Apply this to every story you tell" },
    ]
  },
  6: {
    title: 'APAC Market Phrases',
    subtitle: 'Language that resonates in Singapore & KL',
    items: [
      { phrase: "In the Singapore market context…", context: "Shows regional awareness — use it intentionally" },
      { phrase: "MAS regulatory requirements…", context: "Monetary Authority of Singapore — essential for fintech" },
      { phrase: "Cross-border payment UX…", context: "Relevant for the Singapore–KL corridor" },
      { phrase: "Trust-first design…", context: "APAC users prioritize security signals over aesthetics" },
      { phrase: "Localisation versus standardisation…", context: "Common product strategy tension across APAC markets" },
    ]
  },
  0: {
    title: 'Weekly Review',
    subtitle: 'Your strongest phrases from this week',
    items: [
      { phrase: "'That's a great question — let me think for a moment.'", context: "Monday — filler phrase that buys time gracefully" },
      { phrase: "S-T-A-R: always use 'I', not 'we'", context: "Tuesday — the most common STAR mistake" },
      { phrase: "'Stakeholder alignment' signals design leadership", context: "Wednesday — use it when describing cross-functional work" },
      { phrase: "'Seed phrase UX is a high-stakes moment'", context: "Thursday — shows deep Web3 domain knowledge" },
      { phrase: "[Action] + [metric] + [business impact]", context: "Friday — the impact formula. Apply to every answer." },
      { phrase: "'Trust-first design' resonates in APAC", context: "Saturday — regional signal that differentiates you" },
    ]
  },
};

// ─── LocalStorage ─────────────────────────────────────────────────────────────
const STORAGE_KEY        = 'english_coach_sessions';
const QUESTIONS_KEY      = 'english_coach_questions';
const STREAK_KEY         = 'english_coach_streak';

function loadSessionHistory() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  catch { return []; }
}

function loadStreak() {
  try { return JSON.parse(localStorage.getItem(STREAK_KEY)) || { count: 0, lastDate: null }; }
  catch { return { count: 0, lastDate: null }; }
}

function updateStreak() {
  const today = new Date().toISOString().split('T')[0];
  const streak = loadStreak();
  const last = streak.lastDate;

  if (last === today) {
    // Already practiced today — no change
    return streak;
  }

  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  const newStreak = {
    count: last === yesterday ? streak.count + 1 : 1,
    lastDate: today,
  };
  localStorage.setItem(STREAK_KEY, JSON.stringify(newStreak));
  return newStreak;
}

function avgScores(scoresArr) {
  if (!scoresArr || !scoresArr.length) return null;
  const keys = ['clarity', 'structure', 'impact', 'english'];
  const result = {};
  keys.forEach(k => {
    result[k] = Math.round(
      scoresArr.reduce((sum, s) => sum + (s[k] || 0), 0) / scoresArr.length
    );
  });
  return result;
}

function getAggregateScores() {
  // Average across all saved sessions
  const history = loadSessionHistory();
  if (!history.length) return null;
  const keys = ['clarity', 'structure', 'impact', 'english'];
  const totals = { clarity: 0, structure: 0, impact: 0, english: 0 };
  let count = 0;
  history.forEach(s => {
    [s.warmupScores, s.deepSimScores].forEach(scores => {
      if (!scores) return;
      keys.forEach(k => { totals[k] += scores[k] || 0; });
      count++;
    });
  });
  if (!count) return null;
  const result = {};
  keys.forEach(k => { result[k] = Math.round(totals[k] / count); });
  return result;
}

function saveSession(summaryText) {
  const history = loadSessionHistory();
  const entry = {
    date: new Date().toISOString().split('T')[0],
    warmupScores: avgScores(SESSION.warmupScores),
    deepSimScores: avgScores(SESSION.deepSimScores),
    question: SESSION.currentQuestion,
    summary: summaryText,
  };
  history.unshift(entry);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(0, 20)));
  updateStreak();
}

function loadQuestions() {
  try { return JSON.parse(localStorage.getItem(QUESTIONS_KEY)) || []; }
  catch { return []; }
}

function saveQuestion(blockType, questionText) {
  const questions = loadQuestions();
  questions.unshift({
    date: new Date().toISOString().split('T')[0],
    block: blockType === 'warmup' ? 'Warmup' : 'Deep Sim',
    question: questionText,
  });
  localStorage.setItem(QUESTIONS_KEY, JSON.stringify(questions.slice(0, 50)));
}

function buildHistoryContext() {
  const history = loadSessionHistory();
  if (!history.length) return '';
  const recent = history.slice(0, 5);

  // Find weakest dimension across recent sessions
  const keys = ['clarity', 'structure', 'impact', 'english'];
  const totals = { clarity: 0, structure: 0, impact: 0, english: 0 };
  let count = 0;
  recent.forEach(s => {
    [s.warmupScores, s.deepSimScores].forEach(sc => {
      if (!sc) return;
      keys.forEach(k => { totals[k] += sc[k] || 0; });
      count++;
    });
  });
  const weakest = count
    ? keys.reduce((a, b) => totals[a] < totals[b] ? a : b)
    : null;

  // Score trend (improving or declining?)
  const trend = recent.length >= 2
    ? (() => {
        const latest = avgScores([recent[0].warmupScores, recent[0].deepSimScores].filter(Boolean));
        const older  = avgScores([recent[recent.length - 1].warmupScores, recent[recent.length - 1].deepSimScores].filter(Boolean));
        if (!latest || !older) return 'stable';
        const latestAvg = keys.reduce((s, k) => s + (latest[k] || 0), 0) / keys.length;
        const olderAvg  = keys.reduce((s, k) => s + (older[k] || 0), 0) / keys.length;
        if (latestAvg > olderAvg + 0.5) return 'improving';
        if (latestAvg < olderAvg - 0.5) return 'declining';
        return 'stable';
      })()
    : 'stable';

  const recentQuestions = recent
    .map(s => s.question)
    .filter(Boolean)
    .slice(0, 3)
    .map(q => `- "${q.slice(0, 80)}..."`)
    .join('\n');

  return `\n\nSESSION HISTORY (last ${recent.length} sessions):
Score trend: ${trend} — ${trend === 'improving' ? 'increase difficulty' : trend === 'declining' ? 'ease difficulty slightly' : 'maintain current difficulty'}.
Weakest dimension across sessions: ${weakest || 'unknown'} — weight questions toward this.
Recent questions asked (avoid repeating these):
${recentQuestions || 'none yet'}`;
}

// ─── Question Bank ────────────────────────────────────────────────────────────
function renderQuestionBank() {
  const questions = loadQuestions();
  if (!questions.length) {
    questionBank.classList.add('hidden');
    return;
  }

  questionBank.classList.remove('hidden');
  qbankCount.textContent = `· ${questions.length}`;

  qbankList.innerHTML = questions.map(q => `
    <div class="qbank-item">
      <p class="qbank-question">${q.question}</p>
      <div class="qbank-meta">
        <span class="qbank-tag">${q.block}</span>
        <span class="qbank-date">${q.date}</span>
      </div>
    </div>
  `).join('');
}

qbankToggle.addEventListener('click', () => {
  qbankList.classList.toggle('hidden');
});

// ─── Session progress bar ─────────────────────────────────────────────────────
const BLOCK_ORDER = ['warmup', 'deepsim', 'micro', 'review'];

function updateSessionProgress(activeBlock) {
  const activeIdx = BLOCK_ORDER.indexOf(activeBlock);
  document.querySelectorAll('.progress-step').forEach((step, i) => {
    step.classList.remove('active', 'done', 'upcoming');
    if (i < activeIdx) step.classList.add('done');
    else if (i === activeIdx) step.classList.add('active');
    else step.classList.add('upcoming');
  });
}

// ─── Stats panel ──────────────────────────────────────────────────────────────
function renderStatsPanel() {
  const streak = loadStreak();
  const agg = getAggregateScores();

  if (streak.count > 0) {
    streakDisplay.innerHTML = `<span>${streak.count}-day streak</span> &nbsp;·&nbsp; ${loadSessionHistory().length} sessions total`;
  } else {
    streakDisplay.textContent = 'First session — no history yet';
  }

  if (agg) {
    const keys = ['clarity', 'structure', 'impact', 'english'];
    avgScoresDisplay.innerHTML = keys.map(k => {
      const val = agg[k];
      const cls = val >= 8 ? 'high' : val >= 5 ? 'mid' : 'low';
      return `<div class="avg-badge">${k.charAt(0).toUpperCase() + k.slice(1)}<span class="${cls}">${val}</span></div>`;
    }).join('');
  } else {
    avgScoresDisplay.innerHTML = '';
  }
}

// ─── Session state ────────────────────────────────────────────────────────────
let SESSION = {
  block: null,           // 'warmup' | 'deepsim' | 'micro' | 'review' | 'done'
  round: 0,
  maxRounds: 0,
  phase: 'idle',         // 'idle' | 'coach_speaking' | 'waiting_for_user' | 'recording' | 'thinking'
  history: [],           // full conversation history
  warmupScores: [],
  deepSimScores: [],
  currentQuestion: '',
};

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

recognition.onresult = (event) => {
  let interim = '';
  for (let i = event.resultIndex; i < event.results.length; i++) {
    if (event.results[i].isFinal) {
      finalTranscript += event.results[i][0].transcript + ' ';
    } else {
      interim += event.results[i][0].transcript;
    }
  }
  finalTextEl.textContent = finalTranscript;
  interimTextEl.textContent = interim;
};

recognition.onend = () => {
  if (isRecording) recognition.start(); // restart on Chrome timeout
};

recognition.onerror = (event) => {
  if (event.error === 'not-allowed') {
    statusEl.textContent = 'Microphone access denied — allow it in Chrome settings.';
  } else if (event.error !== 'aborted') {
    statusEl.textContent = 'Mic error: ' + event.error;
  }
  isRecording = false;
  btn.classList.remove('recording');
};

// ─── Speech Synthesis ─────────────────────────────────────────────────────────
let voices = [];
function loadVoices() { voices = speechSynthesis.getVoices(); }
loadVoices();
speechSynthesis.onvoiceschanged = loadVoices;

function speak(text, onDone) {
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'en-US';
  u.rate = 0.95;
  u.pitch = 1.0;
  const preferred = voices.find(v => v.lang === 'en-US' && v.name.includes('Samantha'))
    || voices.find(v => v.lang === 'en-US');
  if (preferred) u.voice = preferred;
  u.onend = () => { if (onDone) onDone(); };
  speechSynthesis.speak(u);
}

// ─── Toggles ──────────────────────────────────────────────────────────────────
showMyWords.addEventListener('change', () => {
  transcriptBox.classList.toggle('hidden', !showMyWords.checked);
});
showTrainerTxt.addEventListener('change', () => {
  trainerBox.classList.toggle('hidden', !showTrainerTxt.checked);
});

// ─── Scoring ──────────────────────────────────────────────────────────────────
function parseScores(text) {
  const match = text.match(/SCORES:\s*(\{[^}]+\})/);
  if (!match) return null;
  try { return JSON.parse(match[1]); } catch { return null; }
}

function stripScores(text) {
  return text.replace(/\n?SCORES:\s*\{[^}]+\}/g, '').trim();
}

function colorClass(n) {
  if (n >= 8) return 'high';
  if (n >= 5) return 'mid';
  return 'low';
}

function showScoreCards(scores) {
  ['clarity', 'structure', 'impact', 'english'].forEach(k => {
    const el = document.getElementById('score-' + k);
    el.textContent = scores[k] ?? '—';
    el.className = 'score-value ' + (scores[k] ? colorClass(scores[k]) : '');
  });
  scoresBox.classList.remove('hidden');
}

// ─── API ──────────────────────────────────────────────────────────────────────
function buildSystemPrompt() {
  const historyCtx = buildHistoryContext();
  let prompt = BASE_PROMPT + historyCtx;

  if (SESSION.block === 'warmup') {
    prompt += `\n\nCURRENT BLOCK: Warmup Interview Practice (${SESSION.maxRounds} rounds total).
Rules:
- Ask ONE behavioral question (use history context above to avoid repeats and set difficulty).
- Coach Florencia through ${SESSION.maxRounds} rounds on that same question.
- When she answers, start your response by quoting or paraphrasing something specific she said.
- Give one thing she did well and one concrete thing to improve.
- End with scores on a new line: SCORES: {"clarity": X, "structure": X, "impact": X, "english": X}
- If rounds remain: ask her to answer THE SAME question again applying your suggestion.
- On the final round: give comprehensive feedback, then say "Nice work on the warmup. Moving to the portfolio simulation now."`;
  } else if (SESSION.block === 'deepsim') {
    prompt += `\n\nCURRENT BLOCK: Deep Portfolio Simulation (${SESSION.maxRounds} rounds total).
Rules:
- Ask ONE case study question (use history context above to avoid repeats and set difficulty).
- Coach Florencia through ${SESSION.maxRounds} rounds on that same question.
- When she answers, start your response by quoting or paraphrasing something specific she said.
- Give one strength and one specific improvement for this round.
- End with scores on a new line: SCORES: {"clarity": X, "structure": X, "impact": X, "english": X}
- If rounds remain: ask her to answer THE SAME question again with your suggested improvement.
- On the final round: give comprehensive feedback, then say "Great simulation work. Moving to vocabulary practice now."`;
  }

  return prompt;
}

async function callAPI(messages) {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, system: buildSystemPrompt() }),
  });
  const data = await res.json();
  if (!res.ok || data.error) throw new Error(data.error || 'API error');
  return data.text;
}

// ─── UI helpers ───────────────────────────────────────────────────────────────
function setStatus(text) { statusEl.textContent = text; }

function updateHeader(block, round) {
  blockLabelEl.textContent = block;
  roundLabelEl.textContent = round;
  sessionHeader.classList.remove('hidden');
}

function setBtn(label, disabled = false) {
  btn.textContent = label;
  btn.disabled = disabled;
  btn.classList.remove('recording');
}

function showCoachText(text) {
  trainerTextEl.textContent = text;
  if (showTrainerTxt.checked) trainerBox.classList.remove('hidden');
}

// ─── Main button handler ──────────────────────────────────────────────────────
btn.addEventListener('click', () => {
  if (SESSION.phase === 'idle') {
    startSession();
  } else if (SESSION.phase === 'waiting_for_user') {
    startRecording();
  } else if (SESSION.phase === 'recording') {
    stopAndSend();
  } else if (SESSION.phase === 'micro') {
    beginBlock('review');
  }
});

// ─── Session flow ─────────────────────────────────────────────────────────────
function startSession() {
  statsPanel.classList.add('hidden');
  questionBank.classList.add('hidden');
  sessionProgress.classList.remove('hidden');
  SESSION.history = [];
  SESSION.warmupScores = [];
  SESSION.deepSimScores = [];
  SESSION.currentQuestion = '';
  beginBlock('warmup');
}

function beginBlock(blockName) {
  SESSION.block = blockName;
  SESSION.round = 0;
  scoresBox.classList.add('hidden');
  microBox.classList.add('hidden');
  summaryBox.classList.add('hidden');
  trainerBox.classList.add('hidden');
  transcriptBox.classList.add('hidden');
  finalTextEl.textContent = '';
  interimTextEl.textContent = '';

  updateSessionProgress(blockName);

  if (blockName === 'warmup') {
    SESSION.maxRounds = 2;
    updateHeader('Warmup', '');
    setStatus('Starting warmup…');
    setBtn('…', true);
    askOpeningQuestion('warmup');
  } else if (blockName === 'deepsim') {
    SESSION.maxRounds = 3;
    updateHeader('Deep Simulation', '');
    setStatus('Starting portfolio simulation…');
    setBtn('…', true);
    askOpeningQuestion('deepsim');
  } else if (blockName === 'micro') {
    showMicroActivity();
  } else if (blockName === 'review') {
    askEndOfSessionSummary();
  }
}

async function askOpeningQuestion(blockType) {
  // Clean trigger — the system prompt tells the coach exactly what to do
  const trigger = blockType === 'warmup'
    ? 'Please ask me your behavioral interview question.'
    : 'Please ask me your portfolio case study question.';

  try {
    SESSION.history.push({ role: 'user', content: trigger });
    const reply = await callAPI(SESSION.history);
    SESSION.history.push({ role: 'assistant', content: reply });
    SESSION.currentQuestion = reply;
    saveQuestion(blockType, reply);

    showCoachText(reply);
    setStatus('Speaking…');
    speak(reply, () => {
      setStatus('Press Start to answer');
      setBtn('Start');
      SESSION.phase = 'waiting_for_user';
    });
  } catch (err) {
    setStatus('Error — try again.');
    setBtn('Begin');
    SESSION.phase = 'idle';
    console.error(err);
  }
}

function startRecording() {
  SESSION.phase = 'recording';
  finalTranscript = '';
  finalTextEl.textContent = '';
  interimTextEl.textContent = '';
  if (showMyWords.checked) transcriptBox.classList.remove('hidden');

  recognition.start();
  isRecording = true;
  btn.textContent = 'Done';
  btn.classList.add('recording');

  const block = SESSION.block === 'warmup' ? 'Warmup' : 'Deep Simulation';
  updateHeader(block, `Round ${SESSION.round + 1} of ${SESSION.maxRounds}`);
  setStatus('Listening…');
}

function stopAndSend() {
  recognition.stop();
  isRecording = false;
  btn.classList.remove('recording');

  const transcript = finalTranscript.trim();
  const wordCount = transcript.split(/\s+/).filter(Boolean).length;

  interimTextEl.textContent = '';

  if (!transcript || wordCount < 5) {
    const fallback = "I didn't catch that clearly — could you try again?";
    setStatus('Could not understand.');
    speak(fallback, () => {
      setStatus('Press Start to answer');
      setBtn('Start');
      SESSION.phase = 'waiting_for_user';
    });
    return;
  }

  handleAnswer(transcript);
}

async function handleAnswer(transcript) {
  SESSION.phase = 'thinking';
  SESSION.round++;
  setBtn('…', true);
  setStatus('Thinking…');

  const isLastRound = SESSION.round >= SESSION.maxRounds;

  try {
    // Wrap transcript with explicit round instruction so the model knows what to do
    const roundNote = isLastRound
      ? `[Round ${SESSION.round} of ${SESSION.maxRounds} — FINAL ROUND. Give comprehensive feedback referencing what I just said. Then wrap up the block.]`
      : `[Round ${SESSION.round} of ${SESSION.maxRounds}. Give feedback referencing what I just said. Then ask me to try the same question again with one specific improvement.]`;

    SESSION.history.push({ role: 'user', content: `${transcript}\n\n${roundNote}` });
    const rawReply = await callAPI(SESSION.history);
    SESSION.history.push({ role: 'assistant', content: rawReply });

    const scores = parseScores(rawReply);
    const reply = stripScores(rawReply);

    if (scores) {
      showScoreCards(scores);
      if (SESSION.block === 'warmup') SESSION.warmupScores.push(scores);
      if (SESSION.block === 'deepsim') SESSION.deepSimScores.push(scores);
    }

    showCoachText(reply);
    setStatus('Speaking…');

    speak(reply, () => {
      if (isLastRound) {
        if (SESSION.block === 'warmup') beginBlock('deepsim');
        else if (SESSION.block === 'deepsim') beginBlock('micro');
      } else {
        setStatus('Press Start to try again');
        setBtn('Start');
        SESSION.phase = 'waiting_for_user';
      }
    });
  } catch (err) {
    setStatus('Error — press Start to try again.');
    setBtn('Start');
    SESSION.phase = 'waiting_for_user';
    console.error(err);
  }
}

// ─── Micro Activity ───────────────────────────────────────────────────────────
function showMicroActivity() {
  SESSION.phase = 'micro';
  const day = new Date().getDay(); // 0 = Sunday
  const content = MICRO_CONTENT[day];

  updateHeader('Micro Activity', '15 min');
  setStatus('Read through today\'s phrases');

  let html = `<p class="micro-title">${content.title}</p>
<p class="micro-subtitle">${content.subtitle}</p>`;

  content.items.forEach(item => {
    html += `<div class="micro-item">
  <p class="micro-phrase">${item.phrase}</p>
  <p class="micro-context">${item.context}</p>
</div>`;
  });

  microBox.innerHTML = html;
  microBox.classList.remove('hidden');

  setBtn('Continue →');
}

// ─── End-of-session summary ───────────────────────────────────────────────────
async function askEndOfSessionSummary() {
  SESSION.phase = 'thinking';
  updateHeader('Review', 'End of Session');
  setBtn('…', true);
  setStatus('Preparing your summary…');
  microBox.classList.add('hidden');

  const warmupAvg = avgScores(SESSION.warmupScores);
  const deepSimAvg = avgScores(SESSION.deepSimScores);
  const historyContext = buildHistoryContext();

  const summaryPrompt = `The session is complete. Deliver Florencia's end-of-session summary. Include these four things:
1. What went well today — be specific, not generic
2. Her weakest score dimension and one concrete thing to fix next session
3. A pattern you notice from this session${historyContext ? ' and recent sessions' : ''}
4. What the next session should focus on — name the block type and question category

Today's scores — Warmup: ${JSON.stringify(warmupAvg)}, Deep Simulation: ${JSON.stringify(deepSimAvg)}.${historyContext}

Keep it under 150 words. Speak warmly but directly. Do not use bullet points or formatting.`;

  try {
    SESSION.history.push({ role: 'user', content: summaryPrompt });
    const reply = await callAPI(SESSION.history);

    summaryTextEl.textContent = reply;
    summaryBox.classList.remove('hidden');
    saveSession(reply);

    setStatus('Speaking…');
    speak(reply, () => {
      SESSION.phase = 'done';
      SESSION.block = 'done';
      setStatus('Session complete. Great work today.');
      setBtn('New Session');
      updateHeader('Done', '');

      // Allow starting a new session
      btn.addEventListener('click', () => location.reload(), { once: true });
    });
  } catch (err) {
    setStatus('Error generating summary.');
    console.error(err);
    setBtn('New Session');
    btn.addEventListener('click', () => location.reload(), { once: true });
  }
}

// ─── Init ─────────────────────────────────────────────────────────────────────
renderStatsPanel();
renderQuestionBank();
