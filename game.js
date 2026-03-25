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
let currentPlayer = '';
const TOTAL_PAIRS = 8;

// ---- Name screen ----

function startGame() {
  const input = document.getElementById('player-name');
  const name = input.value.trim();
  if (!name) {
    input.focus();
    input.classList.add('shake');
    setTimeout(() => input.classList.remove('shake'), 400);
    return;
  }
  currentPlayer = name;
  document.getElementById('name-screen').classList.add('hidden');
  initGame();
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('player-name').addEventListener('keydown', e => {
    if (e.key === 'Enter') startGame();
  });
});

// ---- Game init ----

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
    const rank = saveScore(currentPlayer, seconds);
    setTimeout(() => showWinModal(rank), 600);
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

function showWinModal(playerRank) {
  document.getElementById('win-player').textContent = currentPlayer;
  document.getElementById('win-time').textContent = formatTime(seconds);
  document.getElementById('win-rank').textContent =
    playerRank <= 10 ? `Miejsce #${playerRank} w rankingu!` : `Twoje miejsce: #${playerRank}`;

  renderRanking('win-ranking', playerRank);
  document.getElementById('win-modal').classList.remove('hidden');
}

function restartGame() {
  closeModal('win-modal');
  // Show name screen again for a new player, or just restart for the same player
  initGame();
}

// ---- Scores modal ----

function showScores() {
  renderRanking('scores-ranking', null);
  document.getElementById('scores-modal').classList.remove('hidden');
}

// ---- Ranking renderer ----

function renderRanking(containerId, highlightRank) {
  const scores = getScores();
  const container = document.getElementById(containerId);

  if (scores.length === 0) {
    container.innerHTML = '<li class="no-scores">Brak wyników</li>';
    return;
  }

  const top10 = scores.slice(0, 10);
  let html = top10.map((entry, i) => {
    const rank = i + 1;
    const isCurrent = highlightRank !== null && rank === highlightRank;
    const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `${rank}.`;
    return `<li class="${isCurrent ? 'current-player' : ''}">
      <span class="rank">${medal}</span>
      <span class="player-name">${entry.name}</span>
      <span class="player-time">${formatTime(entry.time)}</span>
    </li>`;
  }).join('');

  // If player is outside top 10, show their position below
  if (highlightRank !== null && highlightRank > 10) {
    const playerEntry = scores[highlightRank - 1];
    html += `<li class="ellipsis">...</li>`;
    html += `<li class="current-player">
      <span class="rank">${highlightRank}.</span>
      <span class="player-name">${playerEntry.name}</span>
      <span class="player-time">${formatTime(playerEntry.time)}</span>
    </li>`;
  }

  container.innerHTML = html;
}

// ---- High scores ----

const SCORES_KEY = 'jp2scores';

function saveScore(name, time) {
  let scores = getScores();
  scores.push({ name, time });
  scores.sort((a, b) => a.time - b.time);
  localStorage.setItem(SCORES_KEY, JSON.stringify(scores));
  return scores.findIndex(e => e.name === name && e.time === time) + 1;
}

function getScores() {
  return JSON.parse(localStorage.getItem(SCORES_KEY) || '[]');
}

function clearScores() {
  localStorage.removeItem(SCORES_KEY);
  renderRanking('scores-ranking', null);
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
