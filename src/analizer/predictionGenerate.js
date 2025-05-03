const { getNumberFrequencies } = require("./frequencyAnalize");
const { getFrequentPairs } = require("./frequencyPair");
const { getFrequentTriplets } = require("./frequencyTriplet");
const { getMostCommonGapPatterns } = require("./gapAnalize");
const { getHotAndColdNumbers } = require("./hotAndColdNumber");

function predictNextNumbers(results, options = {}) {
    const frequency = getNumberFrequencies(results);
    const { hotNumbers, coldNumbers } = getHotAndColdNumbers(results, options.hotCount || 10, options.coldCount || 10);
    const commonPairs = getFrequentPairs(results, options.pairThreshold || 2);
    const commonTriplets = getFrequentTriplets(results, options.tripletThreshold || 2);
    const commonGaps = getMostCommonGapPatterns(results);
    const wheelBase = hotNumbers.slice(0, 12); // for wheeling
  
    const pickFrom = (arr, count) =>
      arr.sort(() => 0.5 - Math.random()).slice(0, count);
  
    const selectedNumbers = new Set();
  
    // 1. Add 2 numbers from hot numbers
    pickFrom(hotNumbers, 2).forEach(num => selectedNumbers.add(num));
  
    // 2. Add 1 number from cold numbers
    pickFrom(coldNumbers, 1).forEach(num => selectedNumbers.add(num));
  
    // 3. Add 1 number from common pairs
    pickFrom(Object.keys(commonPairs).map(Number), 1).forEach(num => selectedNumbers.add(num));
  
    // 4. Add 1 number from common triplets
    pickFrom(Object.keys(commonTriplets).map(Number), 1).forEach(num => selectedNumbers.add(num));
  
    // 5. Use gap analysis to try one likely gap
    const gapsSorted = Object.entries(commonGaps).sort((a, b) => b[1] - a[1]).map(([gap]) => parseInt(gap));
    if (gapsSorted.length > 0 && selectedNumbers.size > 0) {
      const last = [...selectedNumbers][selectedNumbers.size - 1];
      const candidate = last + gapsSorted[0];
      if (candidate <= 45) selectedNumbers.add(candidate);
    }
  
    // Fill to 6 numbers with wheel base if needed
    while (selectedNumbers.size < 6) {
      const pick = pickFrom(wheelBase, 1)[0];
      selectedNumbers.add(pick);
    }
  
    return Array.from(selectedNumbers).sort((a, b) => a - b);
  }

// Call the function
module.exports = { predictNextNumbers };
