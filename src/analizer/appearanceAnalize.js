function getNumberAppearance(allDraws, is55 = false) {
    const mapValue = {}
    new Array(is55 ? 55 : 45).fill('').map((_, index) => {
        mapValue[index + 1] = 0
    })
    const mapValueKeyList = Object.keys(mapValue)
    allDraws.forEach(drawRow => {
        drawRow.forEach(number => {
            mapValue[number] = 0
        })
        mapValueKeyList.forEach(key => {
            if (!drawRow.includes(key)) {
                mapValue[key] = mapValue[key] + 1
            }
        })
    });
    return mapValue;
}

// Call the function
module.exports = { getNumberAppearance };
