function getNumberFrequencies(allDraws) {
    const allNumbers = allDraws.flatMap(draw => draw);
    const frequencyMap = {};
    for (const num of allNumbers) {
        frequencyMap[num] = (frequencyMap[num] || 0) + 1;
    }
    return frequencyMap;
}

// Call the function
module.exports = { getNumberFrequencies };
