/**
 * Generate 5 random positive integers that sum to a given total
 * @param {number} gapSum - A number > 5 and < 55
 * @param {number} startNumber - A number between 1 and 55
 * @returns {number[]} - Array of 5 positive integers summing to targetSum
 */
function generateFiveNumbersWithGapSum(gapSum, startNumber, gapList) {
  if (gapSum <= 5 || gapSum >= 55) {
    throw new Error("Input must be greater than 5 and less than 55");
  }

  const gap = [];
  let remaining = gapSum;

  // Generate 4 random numbers, each at least 1
  for (let i = 0; i < 4; i++) {
    const max = remaining - (4 - i); // ensure at least 1 left for each remaining number
    const num = Math.floor(Math.random() * (max - 1 + 1)) + 1;
    gap.push(num);
    remaining -= num;
  }

  // Add the final number to make the sum correct
  gap.push(remaining);
  const number = [startNumber];
  for (let i = 0; i < gap.length; i++) {
    number[i + 1] = number[i] + gap[i]
  }

  if (gapList.includes(gap.join(','))) {
    return generateFiveNumbersWithGapSum(gapSum, startNumber, gapList)
  }

  return {
    gap,
    number,
  };
}

module.exports = { generateFiveNumbersWithGapSum };
