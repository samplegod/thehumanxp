import {
  DIRECTIONS,
  createInitialState,
  setDirection,
  step,
} from './gameLogic.js';

const TICK_MS = 140;

const boardEl = document.getElementById('board');
const scoreEl = document.getElementById('score');
const statusEl = document.getElementById('status');
const pauseEl = document.getElementById('pause');

let state = createInitialState();

function directionFromKey(key) {
  switch (key) {
    case 'ArrowUp':
    case 'w':
    case 'W':
      return DIRECTIONS.UP;
    case 'ArrowDown':
    case 's':
    case 'S':
      return DIRECTIONS.DOWN;
    case 'ArrowLeft':
    case 'a':
    case 'A':
      return DIRECTIONS.LEFT;
    case 'ArrowRight':
    case 'd':
    case 'D':
      return DIRECTIONS.RIGHT;
    default:
      return null;
  }
}

function render() {
  boardEl.style.setProperty('--grid-size', String(state.gridSize));
  boardEl.innerHTML = '';

  for (let y = 0; y < state.gridSize; y += 1) {
    for (let x = 0; x < state.gridSize; x += 1) {
      const cell = document.createElement('div');
      cell.className = 'cell';

      if (state.food.x === x && state.food.y === y) {
        cell.classList.add('food');
      }

      if (state.snake.some((segment) => segment.x === x && segment.y === y)) {
        cell.classList.add('snake');
      }

      boardEl.appendChild(cell);
    }
  }

  scoreEl.textContent = String(state.score);

  if (state.isGameOver) {
    statusEl.textContent = 'Game over. Press Restart to play again.';
  } else if (state.isPaused) {
    statusEl.textContent = 'Paused. Press Space or Pause to continue.';
  } else {
    statusEl.textContent = 'Use Arrow Keys or WASD to move. Space pauses.';
  }

  pauseEl.textContent = state.isPaused ? 'Resume' : 'Pause';
}

function tick() {
  step(state);
  render();
}

function togglePause() {
  if (state.isGameOver) {
    return;
  }

  state.isPaused = !state.isPaused;
  render();
}

function restart() {
  state = createInitialState();
  render();
}

document.addEventListener('keydown', (event) => {
  if (event.key === ' ') {
    event.preventDefault();
    togglePause();
    return;
  }

  const requestedDirection = directionFromKey(event.key);
  if (!requestedDirection) {
    return;
  }

  event.preventDefault();
  setDirection(state, requestedDirection);
});

function bindDirectionButton(id, direction) {
  const button = document.getElementById(id);
  button.addEventListener('click', () => setDirection(state, direction));
}

bindDirectionButton('up', DIRECTIONS.UP);
bindDirectionButton('down', DIRECTIONS.DOWN);
bindDirectionButton('left', DIRECTIONS.LEFT);
bindDirectionButton('right', DIRECTIONS.RIGHT);

document.getElementById('pause').addEventListener('click', togglePause);
document.getElementById('restart').addEventListener('click', restart);

setInterval(tick, TICK_MS);
render();
