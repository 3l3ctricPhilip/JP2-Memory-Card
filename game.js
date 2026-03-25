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

async function onMatch() {
  matchedPairs++;
  if (matchedPairs === TOTAL_PAIRS) {
    clearInterval(timerInterval);
    setTimeout(() => showWinModal(), 600);
    saveScore(currentPlayer, seconds);
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

async function showWinModal() {
  document.getElementById('win-player').textContent = currentPlayer;
  document.getElementById('win-time').textContent = formatTime(seconds);
  document.getElementById('win-rank').textContent = '';
  document.getElementById('win-ranking').innerHTML = '<li class="loading">Ładowanie rankingu...</li>';
  document.getElementById('win-modal').classList.remove('hidden');

  await renderRanking('win-ranking', currentPlayer, seconds);

  const rank = getRankFromList('win-ranking', currentPlayer, seconds);
  document.getElementById('win-rank').textContent =
    rank <= 10 ? `Miejsce #${rank} w rankingu!` : `Twoje miejsce: #${rank}`;
}

function restartGame() {
  closeModal('win-modal');
  initGame();
}

function changePlayer() {
  closeModal('win-modal');
  const input = document.getElementById('player-name');
  input.value = '';
  document.getElementById('name-screen').classList.remove('hidden');
  input.focus();
}

// ---- Scores modal ----

async function showScores() {
  document.getElementById('scores-ranking').innerHTML = '<li class="loading">Ładowanie...</li>';
  document.getElementById('scores-modal').classList.remove('hidden');
  await renderRanking('scores-ranking', null, null);
}

// ---- Ranking renderer ----

async function renderRanking(containerId, highlightName, highlightTime) {
  const container = document.getElementById(containerId);

  const snapshot = await window.db
    .collection('scores')
    .orderBy('time')
    .get();

  const all = snapshot.docs.map(d => d.data());

  if (all.length === 0) {
    container.innerHTML = '<li class="no-scores">Brak wyników</li>';
    return;
  }

  const top10 = all.slice(0, 10);
  const playerRank = highlightName !== null
    ? all.findIndex(e => e.name === highlightName && e.time === highlightTime) + 1
    : null;

  let html = top10.map((entry, i) => {
    const rank = i + 1;
    const isCurrent = rank === playerRank;
    const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `${rank}.`;
    return `<li class="${isCurrent ? 'current-player' : ''}" data-rank="${rank}">
      <span class="rank">${medal}</span>
      <span class="player-name">${entry.name}</span>
      <span class="player-time">${formatTime(entry.time)}</span>
    </li>`;
  }).join('');

  if (playerRank !== null && playerRank > 10) {
    const playerEntry = all[playerRank - 1];
    html += `<li class="ellipsis">...</li>`;
    html += `<li class="current-player" data-rank="${playerRank}">
      <span class="rank">${playerRank}.</span>
      <span class="player-name">${playerEntry.name}</span>
      <span class="player-time">${formatTime(playerEntry.time)}</span>
    </li>`;
  }

  container.innerHTML = html;
}

function getRankFromList(containerId, name, time) {
  const items = document.querySelectorAll(`#${containerId} li.current-player`);
  if (items.length === 0) return 999;
  return parseInt(items[0].dataset.rank) || 999;
}

// ---- Firestore: save ----

async function saveScore(name, time) {
  await window.db.collection('scores').add({
    name,
    time,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  });
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
