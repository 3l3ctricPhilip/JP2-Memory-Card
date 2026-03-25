// ---- CardController ----

class CardController {
  constructor(onMatchCallback) {
    this.turnedCards = [];
    this.locked = false;
    this.onMatch = onMatchCallback;
  }

  turnUp(card) {
    if (this.locked || this.turnedCards.length >= 2) return false;

    this.turnedCards.push(card);

    if (this.turnedCards.length === 2) {
      const [first, second] = this.turnedCards;

      if (first.num === second.num) {
        first.setMatched();
        second.setMatched();
        this.turnedCards = [];
        this.onMatch();
      } else {
        this.locked = true;
        setTimeout(() => {
          first.turnDown();
          second.turnDown();
          this.turnedCards = [];
          this.locked = false;
        }, 2000);
      }
    }

    return true;
  }
}

// ---- Card ----

class Card {
  constructor(num, controller) {
    this.num = num;
    this.controller = controller;
    this.faceUp = false;
    this.matched = false;

    this.element = document.createElement('div');
    this.element.className = 'card';
    this.element.innerHTML = `
      <div class="card-inner">
        <div class="card-back">
          <img src="images/default/card8.jpg" alt="rewers">
        </div>
        <div class="card-face">
          <img src="images/default/card${num}.jpg" alt="karta ${num}">
        </div>
      </div>
    `;

    this.element.addEventListener('click', () => this.turnUp());
  }

  turnUp() {
    if (this.faceUp || this.matched) return;
    const accepted = this.controller.turnUp(this);
    if (accepted) {
      this.faceUp = true;
      this.element.classList.add('flipped');
    }
  }

  turnDown() {
    if (!this.faceUp) return;
    this.faceUp = false;
    this.element.classList.remove('flipped');
  }

  setMatched() {
    this.matched = true;
    this.element.classList.add('matched');
  }
}

// ---- Game state ----

let timerInterval = null;
let seconds = 0;
let matchedPairs = 0;
const TOTAL_PAIRS = 8;

function initGame() {
  clearInterval(timerInterval);
  seconds = 0;
  matchedPairs = 0;
  updateTimerDisplay();

  const grid = document.getElementById('card-grid');
  grid.innerHTML = '';

  const controller = new CardController(onMatch);

  const nums = [];
  for (let i = 0; i < TOTAL_PAIRS; i++) nums.push(i, i);
  shuffle(nums);

  nums.forEach(num => {
    const card = new Card(num, controller);
    grid.appendChild(card.element);
  });

  timerInterval = setInterval(() => {
    seconds++;
    updateTimerDisplay();
  }, 1000);
}

function onMatch() {
  matchedPairs++;
  if (matchedPairs === TOTAL_PAIRS) {
    clearInterval(timerInterval);
    saveScore(seconds);
    setTimeout(showWinModal, 600);
  }
}

// ---- Timer ----

function updateTimerDisplay() {
  const m = String(Math.floor(seconds / 60)).padStart(2, '0');
  const s = String(seconds % 60).padStart(2, '0');
  document.getElementById('timer').textContent = `${m}:${s}`;
}

function formatTime(totalSeconds) {
  const m = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
  const s = String(totalSeconds % 60).padStart(2, '0');
  return `${m}:${s}`;
}

// ---- Win modal ----

function showWinModal() {
  document.getElementById('win-time').textContent = formatTime(seconds);
  document.getElementById('win-modal').classList.remove('hidden');
}

// ---- High scores ----

const SCORES_KEY = 'jp2scores';

function saveScore(time) {
  let scores = getScores();
  scores.push(time);
  scores.sort((a, b) => a - b);
  scores = scores.slice(0, 10);
  localStorage.setItem(SCORES_KEY, JSON.stringify(scores));
}

function getScores() {
  return JSON.parse(localStorage.getItem(SCORES_KEY) || '[]');
}

function showScores() {
  const scores = getScores();
  const list = document.getElementById('scores-list');

  if (scores.length === 0) {
    list.innerHTML = '<li>Brak wyników</li>';
  } else {
    list.innerHTML = scores
      .map((s, i) => `<li>${i + 1}. &nbsp; ${formatTime(s)}</li>`)
      .join('');
  }

  document.getElementById('scores-modal').classList.remove('hidden');
}

function clearScores() {
  localStorage.removeItem(SCORES_KEY);
  document.getElementById('scores-list').innerHTML = '<li>Brak wyników</li>';
}

// ---- Utils ----

function shuffle(arr) {
  for (let i = 0; i < arr.length; i++) {
    const j = Math.floor(Math.random() * arr.length);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

function closeModal(id) {
  document.getElementById(id).classList.add('hidden');
}
