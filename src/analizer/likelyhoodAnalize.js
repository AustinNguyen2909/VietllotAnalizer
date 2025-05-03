function calculateLikelihood(results) {
    const entries = Object.entries(results);
  
    // Step 1: Sort by frequency ASC, then hasNot DESC
    entries.sort((a, b) => {
      const freqA = a[1].frequency;
      const freqB = b[1].frequency;
      const hasNotA = a[1].hasNot;
      const hasNotB = b[1].hasNot;
  
      if (freqA !== freqB) return freqA - freqB;          // lower frequency first
      return hasNotB - hasNotA;                            // higher hasNot first
    });
  
    // Step 2: Assign order from 1 to 45|55
    const ordered = {};
    for (let i = 0; i < entries.length; i++) {
      const [num] = entries[i];
      ordered[num] = i + 1;
    }
  
    return ordered;
}

// Call the function
module.exports = { calculateLikelihood };
