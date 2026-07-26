import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DIRECTIONS,
  createInitialState,
  placeFood,
  setDirection,
  step,
} from '../src/gameLogic.js';

function randomSequence(values) {
  let i = 0;
  return () => {
    const value = values[i % values.length];
    i += 1;
    return value;
  };
}

test('snake moves one cell per step in current direction', () => {
  const state = createInitialState(10, randomSequence([0]));
  const before = state.snake[0];

  step(state, randomSequence([0]));

  assert.equal(state.snake[0].x, before.x + 1);
  assert.equal(state.snake[0].y, before.y);
});

test('snake cannot reverse direction immediately', () => {
  const state = createInitialState(10, randomSequence([0]));

  setDirection(state, DIRECTIONS.LEFT);
  step(state, randomSequence([0]));

  assert.deepEqual(state.direction, DIRECTIONS.RIGHT);
});

test('snake grows and score increases after eating food', () => {
  const state = createInitialState(10, randomSequence([0]));
  const head = state.snake[0];
  state.food = { x: head.x + 1, y: head.y };

  const initialLength = state.snake.length;
  step(state, randomSequence([0]));

  assert.equal(state.score, 1);
  assert.equal(state.snake.length, initialLength + 1);
});

test('game over when snake hits boundary', () => {
  const state = createInitialState(5, randomSequence([0]));
  state.snake = [{ x: 4, y: 2 }];
  state.direction = DIRECTIONS.RIGHT;
  state.pendingDirection = DIRECTIONS.RIGHT;

  step(state, randomSequence([0]));

  assert.equal(state.isGameOver, true);
});

test('game over when snake hits itself', () => {
  const state = createInitialState(8, randomSequence([0]));
  state.snake = [
    { x: 3, y: 3 },
    { x: 3, y: 4 },
    { x: 2, y: 4 },
    { x: 2, y: 3 },
  ];
  state.direction = DIRECTIONS.DOWN;
  state.pendingDirection = DIRECTIONS.DOWN;

  step(state, randomSequence([0]));

  assert.equal(state.isGameOver, true);
});

test('moving into previous tail cell is allowed when not growing', () => {
  const state = createInitialState(8, randomSequence([0]));
  state.snake = [
    { x: 3, y: 3 },
    { x: 3, y: 4 },
    { x: 2, y: 4 },
    { x: 2, y: 3 },
  ];
  state.direction = DIRECTIONS.LEFT;
  state.pendingDirection = DIRECTIONS.LEFT;

  step(state, randomSequence([0]));

  assert.equal(state.isGameOver, false);
  assert.deepEqual(state.snake[0], { x: 2, y: 3 });
});

test('placeFood never spawns on snake body', () => {
  const state = createInitialState(4, randomSequence([0]));
  state.snake = [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 2, y: 0 },
  ];

  const food = placeFood(state, randomSequence([0.99]));
  const occupied = state.snake.some((segment) => segment.x === food.x && segment.y === food.y);

  assert.equal(occupied, false);
});
