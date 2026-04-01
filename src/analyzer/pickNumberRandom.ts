import { GenerationConfig, LikelihoodMap } from "../types";

const DEFAULT_MAX_RETRIES = 1000;

export function pick6NumbersByOrder(
  orderMap: LikelihoodMap,
  gapList: string[],
  numberKeyList: string[],
  generationConfig?: GenerationConfig,
  _retryCount: number = 0
): number[] {
  const maxRetries = generationConfig?.maxRetries ?? DEFAULT_MAX_RETRIES;
  if (_retryCount >= maxRetries) {
    throw new Error(
      `pick6NumbersByOrder exceeded max retries (${maxRetries})`
    );
  }

  const orderToNumber: number[] = [];
  for (const [num, order] of Object.entries(orderMap)) {
    orderToNumber[order - 1] = parseInt(num, 10);
  }

  const result: number[] = [];

  const randomStr = Math.random().toString().split(".")[1] || "";
  let index = 0;

  while (result.length < 6 && index + 2 <= randomStr.length) {
    const percentage = parseInt(randomStr.slice(index, index + 2), 10);
    index += 2;

    const clamped = Math.max(1, Math.min(percentage, 99));
    const mappedOrder = Math.ceil((clamped / 100) * orderToNumber.length);
    const pickedNumber = orderToNumber[mappedOrder - 1];

    if (!result.includes(pickedNumber)) {
      result.push(pickedNumber);
    }
  }

  let fallbackIndex = 1;
  while (result.length < 6) {
    const fallbackNumber = orderToNumber[fallbackIndex++];
    if (!result.includes(fallbackNumber)) {
      result.push(fallbackNumber);
    }
  }

  result.sort((a, b) => a - b);

  const gaps: number[] = [];
  for (let i = 1; i < result.length; i++) {
    gaps.push(result[i] - result[i - 1]);
  }
  const patternKey = gaps.join(",");

  if (gapList?.length && gapList.includes(patternKey)) {
    return pick6NumbersByOrder(
      orderMap, gapList, numberKeyList, generationConfig, _retryCount + 1
    );
  }

  const resultKey = result.join(",");
  if (numberKeyList?.length && numberKeyList.includes(resultKey)) {
    return pick6NumbersByOrder(
      orderMap, gapList, numberKeyList, generationConfig, _retryCount + 1
    );
  }

  const gapTotal = gaps.reduce((total, next) => total + next, 0);
  if (
    generationConfig?.rangesToChoose &&
    (gapTotal < generationConfig.rangesToChoose[0] ||
      gapTotal > generationConfig.rangesToChoose[1])
  ) {
    return pick6NumbersByOrder(
      orderMap, gapList, numberKeyList, generationConfig, _retryCount + 1
    );
  }

  const lowNumberBottomLine = generationConfig?.lowNumberBottomLine;
  const highNumberBottomLine = generationConfig?.highNumberBottomLine;
  if (
    typeof lowNumberBottomLine === "number" &&
    typeof highNumberBottomLine === "number" &&
    (result[0] > lowNumberBottomLine || result[5] < highNumberBottomLine)
  ) {
    if (
      generationConfig?.exceptionList?.length &&
      generationConfig.exceptionList.includes(`${result[0]}-${result[5]}`)
    ) {
      return result;
    }
    return pick6NumbersByOrder(
      orderMap, gapList, numberKeyList, generationConfig, _retryCount + 1
    );
  }

  return result;
}
