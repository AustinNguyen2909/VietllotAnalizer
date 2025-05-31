function pick6NumbersByOrder(orderMap, gapList, numberKeyList, rangesToChoose) {
  // Invert orderMap to get a list: index = order, value = number
  const orderToNumber = [];
  for (const [num, order] of Object.entries(orderMap)) {
    orderToNumber[order - 1] = parseInt(num, 10);
  }

  const result = [];

  // Step 1: Add the number with order 1 (most likely)
  // result.push(orderToNumber[0]);

  // Step 2: Use Math.random to pick 5 more numbers
  const randomStr = Math.random().toString().split('.')[1]; // Get decimal part as string
  let index = 0;

  while (result.length < 6 && index + 2 <= randomStr.length) {
    const percentage = parseInt(randomStr.slice(index, index + 2), 10); // Two digits
    index += 2;

    // Clamp to range 1-99
    const clamped = Math.max(1, Math.min(percentage, 99));
    const mappedOrder = Math.ceil((clamped / 100) * orderToNumber.length);
    const pickedNumber = orderToNumber[mappedOrder - 1];

    // Avoid duplicates
    if (!result.includes(pickedNumber)) {
      result.push(pickedNumber);
    }
  }

  // If not enough numbers generated (e.g. due to duplicates), fill with next best orders
  let fallbackIndex = 1;
  while (result.length < 6) {
    const fallbackNumber = orderToNumber[fallbackIndex++];
    if (!result.includes(fallbackNumber)) {
      result.push(fallbackNumber);
    }
  }

  result.sort((a, b) => a - b);
  const gaps = [];
  for (let i = 1; i < result.length; i++) {
    gaps.push(result[i] - result[i - 1]);
  }
  const patternKey = gaps.join(',');

  // If gap pattern already existed => choose again
  if (gapList?.length && gapList.includes(patternKey)) {
    return pick6NumbersByOrder(orderMap, gapList, numberKeyList)
  }

  const resultKey = result.join(',');
   // If result already existed => choose again
   if (numberKeyList?.length && numberKeyList?.includes(resultKey)) {
    return pick6NumbersByOrder(orderMap, gapList, numberKeyList)
  }

  const gapTotal = gaps.reduce((total, next) => {
    return total + next;
  }, 0);
  // If gap total value is larger than the ranges of frequently appear gap (Get from Most Common Gap Patterns)
  // Then we choose again
  if (rangesToChoose?.length === 2 && (gapTotal < rangesToChoose?.[0] || gapTotal > rangesToChoose?.[1])) {
    return pick6NumbersByOrder(orderMap, gapList, numberKeyList)
  }

  return result;
}

// Call the function
module.exports = { pick6NumbersByOrder };
