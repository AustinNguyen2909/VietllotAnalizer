// Rabinowitz-Wagon spigot for the n-th DECIMAL digit of pi (1-indexed).
// piDecimalDigit(1) === 3, piDecimalDigit(2) === 1, piDecimalDigit(3) === 4, ...
// Returned value is always a single decimal digit (0-9).
let cache = [];

const computePiDigits = (n) => {
  const len = Math.floor((10 * n) / 3) + 1;
  const A = new Array(len).fill(2);
  const output = [];
  let nines = 0;
  let predigit = 0;
  for (let j = 1; j <= n; j++) {
    let q = 0;
    for (let i = len; i > 0; i--) {
      const x = 10 * A[i - 1] + q * i;
      A[i - 1] = x % (2 * i - 1);
      q = Math.floor(x / (2 * i - 1));
    }
    A[0] = q % 10;
    q = Math.floor(q / 10);
    if (q === 9) {
      nines++;
    } else if (q === 10) {
      output.push(predigit + 1);
      for (let k = 0; k < nines; k++) output.push(0);
      predigit = 0;
      nines = 0;
    } else {
      output.push(predigit);
      predigit = q;
      for (let k = 0; k < nines; k++) output.push(9);
      nines = 0;
    }
  }
  output.push(predigit);
  // output[0] is the leading placeholder (0); real digits start at output[1] = 3.
  return output;
};

const piDecimalDigit = (n) => {
  if (cache.length < n + 1) cache = computePiDigits(n + 8);
  return cache[n];
};

module.exports = { piDecimalDigit };
