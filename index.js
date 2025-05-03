const { fetchVietlottData45, fetchVietlottData55 } = require("./src/fetcher/fetcher");
const { insertVietlottResult45, fetchAllVietlottResult45, insertVietlottResult55, fetchAllVietlottResult55 } = require("./src/storage/storage");
const { getNumberFrequencies } = require("./src/analizer/frequencyAnalize");
const { getMostCommonGapPatterns, transformGapNumberToDot } = require("./src/analizer/gapAnalize");
const { generateFiveNumbersWithGapSum } = require("./src/generator/randomGapNumber");
const { getNumberAppearance } = require("./src/analizer/appearanceAnalize");
const { calculateLikelihood } = require("./src/analizer/likelyhoodAnalize");
const { pick6NumbersByOrder } = require("./src/analizer/pickNumberRandom");

const fetchAndSaveResult45 = async () => {
  const callingFunction = async (drawNumb) => {
    const data = await fetchVietlottData45(drawNumb);
    if (data) {
      await insertVietlottResult45(data.drawDate, drawNumb, data.numbers);
    }
  }
  for (let i = 1347; i < 1349; i++) {
    await callingFunction(i)
  }
}

const fetchAndSaveResult55 = async () => {
  const callingFunction = async (drawNumb) => {
    const data = await fetchVietlottData55(drawNumb);
    if (data) {
      await insertVietlottResult55(data.drawDate, drawNumb, data.numbers, data.bonus);
    }
  }
  for (let i = 1184; i < 1185; i++) {
    await callingFunction(i)
  }
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
  const gapPaternList = Object.keys(topGapPatterns.gapPatternMap)
  const randomGap = generateFiveNumbersWithGapSum(35, 3, gapPaternList)
  console.log('randomGap', randomGap)

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
  const randomPickLikelyHood = pick6NumbersByOrder(likelyHoodResults, gapPaternList)
  console.log('randomPickLikelyHood', randomPickLikelyHood)

  console.log('--------45--------')
}

const generateNumberFor55 = async () => {
  console.log('--------55--------')
  const vietlottData = await fetchAllVietlottResult55()
  const topGapPatterns = getMostCommonGapPatterns(vietlottData);
  const gapPaternList = Object.keys(topGapPatterns.gapPatternMap)
  const randomGap = generateFiveNumbersWithGapSum(42, 4, gapPaternList)
  console.log('randomGap', randomGap)

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
  const randomPickLikelyHood = pick6NumbersByOrder(likelyHoodResults, gapPaternList)
  console.log('randomPickLikelyHood', randomPickLikelyHood)

  console.log('--------55--------')
}

const main = async () => {
  // await fetchAndSaveResult45()
  // await fetchAndSaveResult55()
  // await mega45Analize()
  // await mega55Analize()
  await generateNumberFor45()
  await generateNumberFor55()
};

main();
