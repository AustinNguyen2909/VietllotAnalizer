function getNumberFrequencies(allDraws) {
    const allNumbers = allDraws.flatMap(draw => draw);
    const frequencyMap = {};
    for (const num of allNumbers) {
        frequencyMap[num] = (frequencyMap[num] || 0) + 1;
    }
    return frequencyMap;
}

function getSingleNumberFrequencies(allDraws, position = 0) {
    const allDrawsAtPosition = allDraws.map(draw => draw[position]);
    const allNumbers = allDrawsAtPosition.flatMap(draw => draw);
    const frequencyMap = {};
    for (const num of allNumbers) {
        frequencyMap[num] = (frequencyMap[num] || 0) + 1;
    }
    return frequencyMap;
}

function getTwoNumberFrequencies(allDraws, position = 0, position2 = 5) {
    const allDrawsAtPosition = allDraws.map(draw => `${draw[position]}-${draw[position2]}`);
    const allNumbers = allDrawsAtPosition.flatMap(draw => draw);
    const frequencyMap = {};
    for (const num of allNumbers) {
        frequencyMap[num] = (frequencyMap[num] || 0) + 1;
    }
    return frequencyMap;
}

// Call the function
module.exports = { getNumberFrequencies, getSingleNumberFrequencies, getTwoNumberFrequencies };
