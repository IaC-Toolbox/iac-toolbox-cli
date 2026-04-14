export type SelectionDirection = 'up' | 'down';

export function moveSelection(
  currentIndex: number,
  optionCount: number,
  direction: SelectionDirection
): number {
  if (optionCount <= 0) {
    return 0;
  }

  const normalizedIndex =
    ((currentIndex % optionCount) + optionCount) % optionCount;

  if (direction === 'up') {
    return normalizedIndex === 0 ? optionCount - 1 : normalizedIndex - 1;
  }

  return normalizedIndex === optionCount - 1 ? 0 : normalizedIndex + 1;
}
