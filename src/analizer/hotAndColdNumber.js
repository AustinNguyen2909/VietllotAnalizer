function getHotAndColdNumbers(results, topCount = 6) {
  const frequencyMap = {};

  // Count frequency of each number
  results.flat().forEach(number => {
    frequencyMap[number] = (frequencyMap[number] || 0) + 1;
  });

  // Convert to sorted array
  const sorted = Object.entries(frequencyMap)
    .map(([number, count]) => ({ number: parseInt(number), count }))
    .sort((a, b) => b.count - a.count);

  const hotNumbers = sorted.slice(0, topCount);
  const coldNumbers = sorted.slice(-topCount).reverse();

  return { hotNumbers, coldNumbers };
}

// Call the function
module.exports = { getHotAndColdNumbers };
