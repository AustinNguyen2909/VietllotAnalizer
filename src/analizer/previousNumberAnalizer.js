const {
  fetchVietlottResultsInRange,
  fetchHighestVietlottNumb,
} = require("../storage/storage");

async function  previousNumberAnalizer(
  type,
  number,
  range = 100
) {
  const is55 = type === '55';
  const currentDrawNumb = number ?? (await fetchHighestVietlottNumb(is55));
  const minDrawNumb = Math.max(1, currentDrawNumb - range);

  const drawsByNumb = await fetchVietlottResultsInRange(
    minDrawNumb,
    currentDrawNumb,
    is55
  );

  const currentDraw = drawsByNumb[currentDrawNumb];
  if (!currentDraw?.length) return [];

  const results = [];
  for (let i = 1; i <= range; i++) {
    const previousDrawNumb = currentDrawNumb - i;
    if (previousDrawNumb < minDrawNumb) break;
    const previousDraw = drawsByNumb[previousDrawNumb];
    if (!previousDraw?.length) continue;
    const diffs = currentDraw.map((n, idx) => n - previousDraw[idx]);
    const totalDiff = diffs.reduce((acc, diff) => acc + diff, 0);
    results.push(`${i}_[${diffs.join(",")}]_${totalDiff}`);
  }
  return results;
};

// Call the function
module.exports = { previousNumberAnalizer };
