// Bailey-Borwein-Plouffe (BBP) spigot for the n-th hexadecimal digit of pi.
// Position is 1-indexed against the fractional part: piHexDigit(1) === 2 (pi ≈ 3.243F6A88...).
const piHexDigit = (n) => {
  const pos = n - 1;
  const modPow = (base, exp, mod) => {
    let result = 1;
    let b = base % mod;
    let e = exp;
    while (e > 0) {
      if (e & 1) result = (result * b) % mod;
      e = Math.floor(e / 2);
      b = (b * b) % mod;
    }
    return result;
  };
  const series = (j) => {
    let sum = 0;
    for (let k = 0; k <= pos; k++) {
      sum = (sum + modPow(16, pos - k, 8 * k + j) / (8 * k + j)) % 1;
    }
    for (let k = pos + 1; k < pos + 100; k++) {
      sum += Math.pow(16, pos - k) / (8 * k + j);
    }
    return sum;
  };
  let x = (4 * series(1) - 2 * series(4) - series(5) - series(6)) % 1;
  if (x < 0) x += 1;
  return Math.floor(x * 16);
};

module.exports = { piHexDigit };
