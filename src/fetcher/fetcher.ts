import { GameConfig, FetchedDraw, VietlottApiResponse } from "../types";
import { parseStandardDraw, parseBonusDraw } from "./parser";

function padDrawNumber(drawNumb: number): string {
  return String(drawNumb).padStart(5, "0");
}

function buildRequestBody(
  config: GameConfig,
  drawNumbString: string
): string {
  return JSON.stringify({
    ORenderInfo: {
      SiteId: "main.frontend.vi",
      SiteAlias: "main.vi",
      UserSessionId: "",
      SiteLang: "vi",
      IsPageDesign: false,
      ExtraParam1: "",
      ExtraParam2: "",
      ExtraParam3: "",
      SiteURL: "",
      WebPage: null,
      SiteName: "Vietlott",
      OrgPageAlias: null,
      PageAlias: null,
      FullPageAlias: null,
      RefKey: null,
      System: 1,
    },
    Key: config.requestKey,
    DrawId: drawNumbString,
  });
}

// TODO: These headers contain hardcoded session cookies and CSRF tokens
// that will expire. Consider fetching them dynamically or loading from env.
function buildHeaders(config: GameConfig): Record<string, string> {
  return {
    accept: "*/*",
    "accept-language": "en-US,en;q=0.9",
    "content-type": "text/plain; charset=UTF-8",
    priority: "u=0, i",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin",
    "x-ajaxpro-method": "ServerSideDrawResult",
    "x-requested-with": "XMLHttpRequest",
    Referer: config.referer,
    "Referrer-Policy": "strict-origin-when-cross-origin",
  };
}

export async function fetchVietlottData(
  config: GameConfig,
  drawNumb: number
): Promise<FetchedDraw | null> {
  const drawNumbString = padDrawNumber(drawNumb);
  try {
    const response = await fetch(config.url, {
      method: "POST",
      headers: buildHeaders(config),
      body: buildRequestBody(config, drawNumbString),
    });

    const data = (await response.json()) as VietlottApiResponse;
    if (data) {
      return config.hasBonus
        ? parseBonusDraw(data)
        : parseStandardDraw(data);
    }
    return null;
  } catch (error) {
    console.error("Error fetching Vietlott data:", error);
    return null;
  }
}
