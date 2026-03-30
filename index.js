const { fetchVietlottData45, fetchVietlottData55, fetchVietlottData35 } = require("./src/fetcher/fetcher");
const { insertVietlottResult45, fetchAllVietlottResult45, insertVietlottResult55, fetchAllVietlottResult55, fetchVietlottResultNumb, fetchHighestVietlottNumb, fetchHighestVietlottNumb35, insertVietlottResult35, fetchAllVietlottResult35 } = require("./src/storage/storage");
const { getNumberFrequencies, getSingleNumberFrequencies, getTwoNumberFrequencies } = require("./src/analizer/frequencyAnalize");
const { getMostCommonGapPatterns, transformGapNumberToDot } = require("./src/analizer/gapAnalize");
const { generateFiveNumbersWithGapSum } = require("./src/generator/randomGapNumber");
const { getNumberAppearance } = require("./src/analizer/appearanceAnalize");
const { calculateLikelihood } = require("./src/analizer/likelyhoodAnalize");
const { pick6NumbersByOrder } = require("./src/analizer/pickNumberRandom");
const { getNumberKeyList } = require("./src/analizer/numberKeyList");

const fetchAndSaveResult45 = async () => {
  let drawNumb = await fetchHighestVietlottNumb();
  let dataFetch = {}
  do {
    drawNumb++
    dataFetch = await fetchVietlottData45(drawNumb);
    if (dataFetch?.numbers) {
      await insertVietlottResult45(dataFetch.drawDate, drawNumb, dataFetch.numbers);
    }
  } while (dataFetch?.numbers)
}

const fetchAndSaveResult55 = async () => {
  let drawNumb = await fetchHighestVietlottNumb(true);
  let dataFetch = {}
  do {
    drawNumb++
    dataFetch = await fetchVietlottData55(drawNumb);
    if (dataFetch?.numbers) {
      await insertVietlottResult55(dataFetch.drawDate, drawNumb, dataFetch.numbers, dataFetch.bonus);
    }

  } while (dataFetch?.numbers)
}

const fetchAndSaveResult35 = async () => {
  let drawNumb = await fetchHighestVietlottNumb35();
  let dataFetch = {}
  do {
    drawNumb++
    dataFetch = await fetchVietlottData35(drawNumb);
    if (dataFetch?.numbers) {
      await insertVietlottResult35(dataFetch.drawDate, drawNumb, dataFetch.numbers, dataFetch.bonus);
    }
  } while (dataFetch?.numbers)
}

const fetAndSaveAllResults = async () => {
  await fetchAndSaveResult45()
  await fetchAndSaveResult55()
  await fetchAndSaveResult35()
}

const checkIfNumberIsDrawnOn35 = async () => {
  const vietlottData = await fetchAllVietlottResult35()
  const numberKeyList = getNumberKeyList(vietlottData);
  const mySpecialNumber = [5, 13, 19, 23, 30];
  const mySpecialNumberString = mySpecialNumber.join(',');
  const mySpecialNumber2 = [7, 9, 11, 15, 30];
  const mySpecialNumber2String = mySpecialNumber2.join(',');
  console.log(`Has my number - ${mySpecialNumber.toString()} been called?`, numberKeyList.includes(mySpecialNumberString));
  console.log(`Has my number - ${mySpecialNumber2.toString()} been called?`, numberKeyList.includes(mySpecialNumber2String));
  
  // const listRandomPick = [
  //   [2,14,17,18,28],
  //   [6,10,14,18,31],
  //   [1,9,15,17,20],
  //   [2,9,10,19,30],
  //   [20,22,23,33,34],
  // ]
  // const checkNumberShown = (numberList) => {
  //   const numberToString = numberList.join(',');
  //   console.log(`Has my number - ${numberList.toString()} been called?`, numberKeyList.includes(numberToString));
  // }
  // listRandomPick.forEach(numberList => checkNumberShown(numberList))
}

const mega45Analize = async () => {
  console.log('--------45--------')

  const vietlottData = await fetchAllVietlottResult45()

  const topGapPatterns = getMostCommonGapPatterns(vietlottData)
  console.log("🔥 Most Common Gap Patterns:", transformGapNumberToDot(topGapPatterns.gapPatternValueMap))

  const frequenciesValues = getNumberFrequencies(vietlottData)
  console.log('frequenciesValues', transformGapNumberToDot(frequenciesValues))

  const frequenciesValues0 = getSingleNumberFrequencies(vietlottData, 0)
  console.log('frequenciesValues 1', transformGapNumberToDot(frequenciesValues0))

  const frequenciesValues5 = getSingleNumberFrequencies(vietlottData, 5)
  console.log('frequenciesValues 6', transformGapNumberToDot(frequenciesValues5))

  const frequenciesValues2Num = getTwoNumberFrequencies(vietlottData, 0, 5)
  const keyByDots = transformGapNumberToDot(frequenciesValues2Num)
  // Convert the object to an array of [key, value] pairs
  const sortedEntries = Object.entries(keyByDots).sort((a, b) => {
    return b[1].length - a[1].length; // Sort by number of dots (descending)
  });
  // Convert it back to an object
  const sortedObject = Object.fromEntries(sortedEntries)
  console.log('frequenciesValues2Num 1-6', sortedObject)
  /* 
   * This shown that key pair with at least 1% of the number of total draws (13 times appearance)
   * are at most 7 on lower threshold
   * with exeption of 9-41
   * and 41 on higher threshold
   * with exeption of 2-38, 1-40
   */

  console.log('--------45--------')
}

const generateNumberFor45 = async () => {
  console.log('--------45--------')

  const vietlottData = await fetchAllVietlottResult45()
  const topGapPatterns = getMostCommonGapPatterns(vietlottData);
  const gapPaternList = Object.keys(topGapPatterns.gapPatternMap);
  const numberKeyList = getNumberKeyList(vietlottData);
  // const randomGap = generateFiveNumbersWithGapSum(35, 3, gapPaternList)
  // console.log('randomGap', randomGap)

  const frequenciesValues = getNumberFrequencies(vietlottData)
  const numberAppearence = getNumberAppearance(vietlottData);
  const mapFrequencyAndAppearanceValue = {}
  Object.keys(frequenciesValues).forEach(key => {
    mapFrequencyAndAppearanceValue[key] = {
      frequency: frequenciesValues[key]
    }
  })
  Object.keys(numberAppearence).forEach(key => {
    mapFrequencyAndAppearanceValue[key] = {
      ...mapFrequencyAndAppearanceValue[key],
      hasNot: numberAppearence[key]
    }
  })

  const rangesToChoose = [24, 42]

  const lowNumberBottomLine = 7
  const highNumberBottomLine = 41

  const exeptionList = ['9-41', '2-38', '1-40']

  const likelyHoodResults = calculateLikelihood(mapFrequencyAndAppearanceValue)
  const randomPickLikelyHood1 = pick6NumbersByOrder(likelyHoodResults, gapPaternList, numberKeyList, rangesToChoose) // , lowNumberBottomLine, highNumberBottomLine, exeptionList)
  console.log('randomPickLikelyHood 1', randomPickLikelyHood1)
  // const randomPickLikelyHood2 = pick6NumbersByOrder(likelyHoodResults, gapPaternList, numberKeyList, rangesToChoose, lowNumberBottomLine, highNumberBottomLine, exeptionList)
  // console.log('randomPickLikelyHood 2', randomPickLikelyHood2)
  const mySpecialNumber = [5, 7, 9, 15, 19, 30];
  const mySpecialNumberString = mySpecialNumber.join(',');
  console.log(`Has my number - ${mySpecialNumber.toString()} been called?`, numberKeyList.includes(mySpecialNumberString));
  console.log('--------45--------')
}

const mega55Analize = async () => {
  console.log('--------55--------')

  const vietlottData = await fetchAllVietlottResult55()

  // const topGapPatterns = getMostCommonGapPatterns(vietlottData)
  // console.log("🔥 Most Common Gap Patterns:", transformGapNumberToDot(topGapPatterns.gapPatternValueMap))

  // const frequenciesValues = getNumberFrequencies(vietlottData)
  // console.log('frequenciesValues',  transformGapNumberToDot(frequenciesValues))

  // const frequenciesValues0 = getSingleNumberFrequencies(vietlottData, 0)
  // console.log('frequenciesValues 1', transformGapNumberToDot(frequenciesValues0))

  // const frequenciesValues5 = getSingleNumberFrequencies(vietlottData, 5)
  // console.log('frequenciesValues 6', transformGapNumberToDot(frequenciesValues5))

  const frequenciesValues2Num = getTwoNumberFrequencies(vietlottData, 0, 5)
  const keyByDots = transformGapNumberToDot(frequenciesValues2Num)
  // Convert the object to an array of [key, value] pairs
  const sortedEntries = Object.entries(keyByDots).sort((a, b) => {
    return b[1].length - a[1].length; // Sort by number of dots (descending)
  });
  // Convert it back to an object
  const sortedObject = Object.fromEntries(sortedEntries)
  console.log('frequenciesValues2Num 1-6', sortedObject)
  /* 
   * This shown that key pair with at least 0.67% of the number of total draws (8 times appearance)
   * are at most 7 on lower threshold
   * with exeption of 8-54, 9-54, 12-52, 12-53
   * and 49 on higher threshold
   * with exeption of 1-50
   */

  console.log('--------55--------')
}

const generateNumberFor55 = async () => {
  console.log('--------55--------')
  const vietlottData = await fetchAllVietlottResult55()
  const topGapPatterns = getMostCommonGapPatterns(vietlottData);
  const gapPaternList = Object.keys(topGapPatterns.gapPatternMap);
  const numberKeyList = getNumberKeyList(vietlottData);
  // const randomGap = generateFiveNumbersWithGapSum(42, 4, gapPaternList)
  // console.log('randomGap', randomGap)

  const frequenciesValues = getNumberFrequencies(vietlottData)
  const numberAppearence = getNumberAppearance(vietlottData);
  const mapFrequencyAndAppearanceValue = {}
  Object.keys(frequenciesValues).forEach(key => {
    mapFrequencyAndAppearanceValue[key] = {
      frequency: frequenciesValues[key]
    }
  })
  Object.keys(numberAppearence).forEach(key => {
    mapFrequencyAndAppearanceValue[key] = {
      ...mapFrequencyAndAppearanceValue[key],
      hasNot: numberAppearence[key]
    }
  })

  const rangesToChoose = [34, 51]

  const lowNumberBottomLine = 7
  const highNumberBottomLine = 49

  const exeptionList = ['8-54', '9-54', '12-52', '12-53', '1-50']

  const likelyHoodResults = calculateLikelihood(mapFrequencyAndAppearanceValue)
  const randomPickLikelyHood1 = pick6NumbersByOrder(likelyHoodResults, gapPaternList, numberKeyList, rangesToChoose) // , lowNumberBottomLine, highNumberBottomLine, exeptionList)
  console.log('randomPickLikelyHood 1', randomPickLikelyHood1)
  // const randomPickLikelyHood2 = pick6NumbersByOrder(likelyHoodResults, gapPaternList, numberKeyList, rangesToChoose, lowNumberBottomLine, highNumberBottomLine, exeptionList)
  // console.log('randomPickLikelyHood 2', randomPickLikelyHood2)
  const mySpecialNumber = [5, 7, 9, 15, 19, 30];
  const mySpecialNumberString = mySpecialNumber.join(',');
  console.log(`Has my number - ${mySpecialNumber.toString()} been called?`, numberKeyList.includes(mySpecialNumberString));
  console.log('--------55--------')
}

const testNumberOfRandomPick = async (number = 10, draw = 1000) => {
  const vietlottData = await fetchAllVietlottResult45()
  const vietlottDataToDraw = vietlottData.slice(0, draw)
  const topGapPatterns = getMostCommonGapPatterns(vietlottData);
  const gapPaternList = Object.keys(topGapPatterns.gapPatternMap);
  const numberKeyList = getNumberKeyList(vietlottData);
  // const randomGap = generateFiveNumbersWithGapSum(42, 4, gapPaternList)
  // console.log('randomGap', randomGap)

  const frequenciesValues = getNumberFrequencies(vietlottData)
  const numberAppearence = getNumberAppearance(vietlottData);
  const mapFrequencyAndAppearanceValue = {}
  Object.keys(frequenciesValues).forEach(key => {
    mapFrequencyAndAppearanceValue[key] = {
      frequency: frequenciesValues[key]
    }
  })
  Object.keys(numberAppearence).forEach(key => {
    mapFrequencyAndAppearanceValue[key] = {
      ...mapFrequencyAndAppearanceValue[key],
      hasNot: numberAppearence[key]
    }
  })

  const likelyHoodResults = calculateLikelihood(mapFrequencyAndAppearanceValue)
  const randomPickLikelyHood1 = pick6NumbersByOrder(likelyHoodResults, gapPaternList, numberKeyList)
  // console.log('randomPickLikelyHood 1', randomPickLikelyHood1)
  const randomPickLikelyHood2 = pick6NumbersByOrder(likelyHoodResults, gapPaternList, numberKeyList)
  // console.log('randomPickLikelyHood 2', randomPickLikelyHood2)
  const listTestResult = []
  listTestResult.push(randomPickLikelyHood1)
  listTestResult.push(randomPickLikelyHood2)
  for (i = 0; i < number - 2; i++) {
    listTestResult.push(pick6NumbersByOrder(likelyHoodResults, gapPaternList, numberKeyList))
  }
  // console.log('listTestResult', listTestResult)
  const result = await fetchVietlottResultNumb(draw + 1);
  // console.log('result', result)
  const isMatch = listTestResult.map(item => item.join(',')).includes(result.join(','))
  // console.log('is matched:', isMatch)
  return isMatch;
}

const runTest = async () => {
  // let times = 0;
  // let hasTrue = false;
  // while (!hasTrue) {
  //   times++
  //   let listResults = []
  //   for (newI = 0; newI < 100; newI++) {
  //     const oneTime = await testNumberOfRandomPick(10, 1300)
  //     listResults.push(oneTime)
  //   }
  //   if (listResults.some(result => !!result)) {
  //     console.log('YAY - time:', times)
  //     hasTrue = true
  //   } else {
  //     console.log('SHIT - time:', times)
  //     listResults = []
  //   }
  // }
}

const main = async () => {
  // await runTest()
  await fetAndSaveAllResults()
  await checkIfNumberIsDrawnOn35()
  // await mega45Analize()
  // await mega55Analize()
  await generateNumberFor45()
  await generateNumberFor55()
};

main();
