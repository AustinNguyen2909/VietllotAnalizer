function getFrequentPairs(results) {
    const pairCounts = {};
  
    for (const draw of results) {
      const sorted = draw.slice().sort((a, b) => a - b);
      for (let i = 0; i < sorted.length; i++) {
        for (let j = i + 1; j < sorted.length; j++) {
          const key = `${sorted[i]}-${sorted[j]}`;
          pairCounts[key] = (pairCounts[key] || 0) + 1;
        }
      }
    }
  
    const pairsSorted = Object.entries(pairCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10); // top 10 frequent pairs
  
    return pairsSorted;
}

// Call the function
module.exports = { getFrequentPairs };
