import assert from 'node:assert/strict';
import test from 'node:test';

import { moveSelection } from '../src/navigation.js';

test('moveSelection wraps upward from the first option', () => {
  assert.equal(moveSelection(0, 3, 'up'), 2);
});

test('moveSelection wraps downward from the last option', () => {
  assert.equal(moveSelection(2, 3, 'down'), 0);
});

test('moveSelection normalizes an out-of-range current index', () => {
  assert.equal(moveSelection(5, 3, 'down'), 0);
});
