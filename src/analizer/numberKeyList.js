function getNumberKeyList(results) {
  const numberKeyMap = [];

  results.forEach(draw => {
    const sortedDraw = [...draw].sort((a, b) => a - b);

    const patternKey = sortedDraw.join(',');
    numberKeyMap.push(patternKey);
  });

  return numberKeyMap;
}

// Call the function
module.exports = { getNumberKeyList };
