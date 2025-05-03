function getMostCommonGapPatterns(results, topCount = 3) {
  const gapPatternMap = {};
  const gapPatternValueMap = {};

  results.forEach(draw => {
    const sortedDraw = [...draw].sort((a, b) => a - b);
    const gaps = [];

    for (let i = 1; i < sortedDraw.length; i++) {
      gaps.push(sortedDraw[i] - sortedDraw[i - 1]);
    }

    const patternKey = gaps.join(',');
    gapPatternMap[patternKey] = (gapPatternMap[patternKey] || 0) + 1;

    const paternTotal = gaps.reduce((total, next) => {
      return total + next;
    }, 0);
    gapPatternValueMap[paternTotal] = (gapPatternValueMap[paternTotal] || 0) + 1;
  });

  const sortedPatterns = Object.entries(gapPatternMap)
    .map(([pattern, count]) => ({ pattern, count }))
    .sort((a, b) => b.count - a.count);

  return {
    gapPatternMap,
    gapPatternValueMap,
  };
}

function transformGapNumberToDot(result) {
  const mapValue = {}
  Object.entries(result).map(([numb, count]) => mapValue[numb] = Array(count).fill('.').join(''))
  return mapValue
}

// Call the function
module.exports = { getMostCommonGapPatterns, transformGapNumberToDot };
