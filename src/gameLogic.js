export const DIRECTIONS = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 },
};

export const DEFAULT_GRID_SIZE = 20;

export function createInitialState(gridSize = DEFAULT_GRID_SIZE, randomFn = Math.random) {
  const mid = Math.floor(gridSize / 2);
  const snake = [
    { x: mid, y: mid },
    { x: mid - 1, y: mid },
    { x: mid - 2, y: mid },
  ];

  const state = {
    gridSize,
    snake,
    direction: DIRECTIONS.RIGHT,
    pendingDirection: DIRECTIONS.RIGHT,
    food: { x: 0, y: 0 },
    score: 0,
    isGameOver: false,
    isPaused: false,
    growBy: 0,
  };

  state.food = placeFood(state, randomFn);
  return state;
}

export function nextDirection(currentDirection, requestedDirection) {
  if (!requestedDirection) return currentDirection;

  const isReverse =
    currentDirection.x + requestedDirection.x === 0 &&
    currentDirection.y + requestedDirection.y === 0;

  return isReverse ? currentDirection : requestedDirection;
}

export function setDirection(state, requestedDirection) {
  state.pendingDirection = nextDirection(state.direction, requestedDirection);
}

export function step(state, randomFn = Math.random) {
  if (state.isGameOver || state.isPaused) {
    return state;
  }

  const direction = nextDirection(state.direction, state.pendingDirection);
  const head = state.snake[0];
  const newHead = { x: head.x + direction.x, y: head.y + direction.y };
  const bodyToCheck = state.growBy > 0 ? state.snake : state.snake.slice(0, -1);

  if (hitsBoundary(newHead, state.gridSize) || hitsSnake(newHead, bodyToCheck)) {
    state.isGameOver = true;
    return state;
  }

  state.snake.unshift(newHead);
  state.direction = direction;

  if (newHead.x === state.food.x && newHead.y === state.food.y) {
    state.score += 1;
    state.growBy += 1;
    state.food = placeFood(state, randomFn);
  }

  if (state.growBy > 0) {
    state.growBy -= 1;
  } else {
    state.snake.pop();
  }

  return state;
}

export function hitsBoundary(position, gridSize) {
  return (
    position.x < 0 ||
    position.y < 0 ||
    position.x >= gridSize ||
    position.y >= gridSize
  );
}

export function hitsSnake(position, snake) {
  return snake.some((segment) => segment.x === position.x && segment.y === position.y);
}

export function placeFood(state, randomFn = Math.random) {
  const freeCells = [];

  for (let y = 0; y < state.gridSize; y += 1) {
    for (let x = 0; x < state.gridSize; x += 1) {
      const occupied = state.snake.some((segment) => segment.x === x && segment.y === y);
      if (!occupied) {
        freeCells.push({ x, y });
      }
    }
  }

  if (freeCells.length === 0) {
    return { x: -1, y: -1 };
  }

  const index = Math.floor(randomFn() * freeCells.length);
  return freeCells[index];
}
