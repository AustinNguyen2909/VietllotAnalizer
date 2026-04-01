import * as cheerio from "cheerio";
import { FetchedDraw, VietlottApiResponse } from "../types";

function parseDateFromHtml($: cheerio.CheerioAPI): string | null {
  const dateText = $(".chitietketqua_title h5").text();
  const dateMatch = dateText.match(/(\d{2})\/(\d{2})\/(\d{4})/);
  if (dateMatch) {
    return `${dateMatch[3]}/${dateMatch[2]}/${dateMatch[1]}`;
  }
  return null;
}

export function parseStandardDraw(
  apiResponse: VietlottApiResponse
): FetchedDraw | null {
  const htmlString = apiResponse.value.RetExtraParam1;
  if (!htmlString) {
    console.error("No HTML content found.");
    return null;
  }

  const $ = cheerio.load(htmlString);

  const numbers = $(".day_so_ket_qua_v2 .bong_tron")
    .map((_, el) => parseInt($(el).text().trim(), 10))
    .get();

  const drawDate = parseDateFromHtml($);

  return { numbers, drawDate, bonus: null };
}

export function parseBonusDraw(
  apiResponse: VietlottApiResponse
): FetchedDraw | null {
  const htmlString = apiResponse.value.RetExtraParam1;
  if (!htmlString) {
    console.error("No HTML content found.");
    return null;
  }

  const $ = cheerio.load(htmlString);

  const allBalls = $(".day_so_ket_qua_v2 .bong_tron");
  const numbers: number[] = [];
  let bonus: number | null = null;

  allBalls.each((_, el) => {
    const num = parseInt($(el).text().trim(), 10);
    if ($(el).hasClass("active")) {
      bonus = num;
    } else {
      numbers.push(num);
    }
  });

  const drawDate = parseDateFromHtml($);

  return { numbers, bonus, drawDate };
}
