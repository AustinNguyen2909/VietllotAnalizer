const { fetchVietlottData45, fetchVietlottData55 } = require("./src/fetcher/fetcher");
const { insertVietlottResult45, fetchAllVietlottResult45, insertVietlottResult55, fetchAllVietlottResult55, fetchVietlottResultNumb, fetchHighestVietlottNumb } = require("./src/storage/storage");
const { getNumberFrequencies } = require("./src/analizer/frequencyAnalize");
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

const fetAndSaveAllResults = async () => {
  await fetchAndSaveResult45()
  await fetchAndSaveResult55()
}

const mega45Analize = async () => {
  console.log('--------45--------')
  const vietlottData = await fetchAllVietlottResult45()
  const frequenciesValues = getNumberFrequencies(vietlottData)
  const topGapPatterns = getMostCommonGapPatterns(vietlottData);
  console.log("🔥 Most Common Gap Patterns:", transformGapNumberToDot(topGapPatterns.gapPatternValueMap));
  console.log('frequenciesValues', transformGapNumberToDot(frequenciesValues))
  console.log('--------45--------')

}

const mega55Analize = async () => {
  console.log('--------55--------')
  const vietlottData = await fetchAllVietlottResult55()
  const frequenciesValues = getNumberFrequencies(vietlottData)
  const topGapPatterns = getMostCommonGapPatterns(vietlottData);
  console.log("🔥 Most Common Gap Patterns:", transformGapNumberToDot(topGapPatterns.gapPatternValueMap));
  console.log('frequenciesValues',  transformGapNumberToDot(frequenciesValues))
  console.log('--------55--------')
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
  const likelyHoodResults = calculateLikelihood(mapFrequencyAndAppearanceValue)
  const randomPickLikelyHood1 = pick6NumbersByOrder(likelyHoodResults, gapPaternList, numberKeyList, rangesToChoose)
  console.log('randomPickLikelyHood 1', randomPickLikelyHood1)
  const randomPickLikelyHood2 = pick6NumbersByOrder(likelyHoodResults, gapPaternList, numberKeyList, rangesToChoose)
  console.log('randomPickLikelyHood 2', randomPickLikelyHood2)
  console.log('--------45--------')
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
  const likelyHoodResults = calculateLikelihood(mapFrequencyAndAppearanceValue)
  const randomPickLikelyHood1 = pick6NumbersByOrder(likelyHoodResults, gapPaternList, numberKeyList, rangesToChoose)
  console.log('randomPickLikelyHood 1', randomPickLikelyHood1)
  const randomPickLikelyHood2 = pick6NumbersByOrder(likelyHoodResults, gapPaternList, numberKeyList, rangesToChoose)
  console.log('randomPickLikelyHood 2', randomPickLikelyHood2)
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
  // await mega45Analize()
  // await mega55Analize()
  await generateNumberFor45()
  await generateNumberFor55()
};

main();
