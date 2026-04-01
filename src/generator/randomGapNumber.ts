const DEFAULT_MAX_RETRIES = 1000;

export function generateFiveNumbersWithGapSum(
  gapSum: number,
  startNumber: number,
  gapList: string[],
  maxRetries: number = DEFAULT_MAX_RETRIES,
  _retryCount: number = 0
): { gap: number[]; number: number[] } {
  if (gapSum <= 5 || gapSum >= 55) {
    throw new Error("Input must be greater than 5 and less than 55");
  }

  if (_retryCount >= maxRetries) {
    throw new Error(
      `generateFiveNumbersWithGapSum exceeded max retries (${maxRetries})`
    );
  }

  const gap: number[] = [];
  let remaining = gapSum;

  for (let i = 0; i < 4; i++) {
    const max = remaining - (4 - i);
    const num = Math.floor(Math.random() * (max - 1 + 1)) + 1;
    gap.push(num);
    remaining -= num;
  }

  gap.push(remaining);

  const number: number[] = [startNumber];
  for (let i = 0; i < gap.length; i++) {
    number[i + 1] = number[i] + gap[i];
  }

  if (gapList.includes(gap.join(","))) {
    return generateFiveNumbersWithGapSum(
      gapSum, startNumber, gapList, maxRetries, _retryCount + 1
    );
  }

  return { gap, number };
}
