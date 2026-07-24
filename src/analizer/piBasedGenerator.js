const { previousNumberAnalizer } = require("./previousNumberAnalizer");
const { getNumberKeyList } = require("./numberKeyList");
const { piDecimalDigit } = require("./piDigit");
const {
  fetchHighestVietlottNumb,
  fetchVietlottResultsInRange,
  fetchAllVietlottResult45,
  fetchAllVietlottResult55,
} = require("../storage/storage");

const mySpecialNumber = [5, 7, 9, 15, 19, 30];
const mySpecialNumberString = mySpecialNumber.join(',');

const MAX_NUMBER = { '45': 45, '55': 55 };

const parseEntry = (entry) => {
  const match = entry.match(/^(\d+)_\[([^\]]+)\]_(-?\d+)$/);
  if (!match) return null;
  return {
    offset: parseInt(match[1], 10),
    diffs: match[2].split(',').map(Number),
    totalDiff: parseInt(match[3], 10),
  };
};

const randomIntInclusive = (max) => Math.floor(Math.random() * (max + 1));

const generateNumberByPi = async (type, range = 400, maxAttempts = 200) => {
  console.log(`--------${type}--------`)
  const is55 = type === '55';
  const maxValue = MAX_NUMBER[type];

  const currentDrawNumb = await fetchHighestVietlottNumb(is55);
  const nextDrawNumb = currentDrawNumb + 1;
  const piDigit = piDecimalDigit(nextDrawNumb);
  console.log(`next draw #${nextDrawNumb} → pi decimal digit = ${piDigit}`);

  const entries = (await previousNumberAnalizer(type, currentDrawNumb, range))
    .map(parseEntry)
    .filter(Boolean);
  if (!entries.length) return null;

  entries.sort((a, b) => Math.abs(a.totalDiff - piDigit) - Math.abs(b.totalDiff - piDigit));
  const closest = entries[0];
  const oldDrawNumb = currentDrawNumb - closest.offset;
  console.log(`closest match: draw #${oldDrawNumb}, totalDiff=${closest.totalDiff}`);

  const rangeMap = await fetchVietlottResultsInRange(oldDrawNumb, oldDrawNumb, is55);
  const oldNumbers = rangeMap[oldDrawNumb];
  if (!oldNumbers?.length) return null;

  const fetchAll = is55 ? fetchAllVietlottResult55 : fetchAllVietlottResult45;
  const vietlottData = await fetchAll();
  const numberKeyList = getNumberKeyList(vietlottData);

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const perturbed = oldNumbers.map(n => {
      const delta = randomIntInclusive(piDigit);
      const sign = Math.random() < 0.5 ? -1 : 1;
      let v = n + sign * delta;
      if (v < 1) v = 1;
      if (v > maxValue) v = maxValue;
      return v;
    });
    const unique = [...new Set(perturbed)].sort((a, b) => a - b);
    if (unique.length !== 6) continue;
    const key = unique.join(',');
    if (numberKeyList.includes(key)) continue;
    console.log(`generated after ${attempt + 1} attempt(s)`);
    console.log(`Has my number - ${mySpecialNumber.toString()} been called?`, numberKeyList.includes(mySpecialNumberString));
    return unique;
  }
  console.log(`no unseen combination found after ${maxAttempts} attempts`);
  console.log(`Has my number - ${mySpecialNumber.toString()} been called?`, numberKeyList.includes(mySpecialNumberString));
  return null;
};

module.exports = { generateNumberByPi };
