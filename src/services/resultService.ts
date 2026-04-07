import { supabase, requireAuth } from "../utils/supabase";
import {
  DrawHistory,
  FetchedDraw,
  GameConfig,
  GameType,
  SyncStatus,
  VietlottApiResponse,
} from "../types";
import { GAME_CONFIGS } from "../config/gameConfig";

export async function fetchAllResults(
  gameConfig: GameConfig,
): Promise<DrawHistory> {
  await requireAuth();

  const columns = [...gameConfig.numberColumns, "draw_numb"].join(", ");
  const PAGE_SIZE = 1000;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let allRows: any[] = [];
  let from = 0;

  // Supabase limits queries to 1000 rows by default — paginate to get all
  while (true) {
    const { data, error } = await supabase
      .from(gameConfig.tableName)
      .select(columns)
      .order("draw_numb", { ascending: true })
      .range(from, from + PAGE_SIZE - 1);

    if (error) {
      throw new Error(`Failed to fetch results: ${error.message}`);
    }

    if (!data || data.length === 0) break;
    allRows = allRows.concat(data);
    if (data.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }

  return allRows.map((row: Record<string, number>) => {
    const { draw_numb: _drawNumb, ...rest } = row;
    return Object.values(rest) as number[];
  });
}

export async function fetchHighestDrawNumb(
  gameConfig: GameConfig,
): Promise<number> {
  await requireAuth();

  const { data, error } = await supabase
    .from(gameConfig.tableName)
    .select("draw_numb")
    .order("draw_numb", { ascending: false })
    .limit(1);

  if (error) {
    throw new Error(`Failed to fetch highest draw: ${error.message}`);
  }

  return data && data.length > 0 ? data[0].draw_numb : 0;
}

export async function fetchResultByDrawNumb(
  gameConfig: GameConfig,
  drawNumb: number,
): Promise<number[]> {
  await requireAuth();

  const columns = gameConfig.numberColumns.join(", ");

  const { data, error } = await supabase
    .from(gameConfig.tableName)
    .select(columns)
    .eq("draw_numb", drawNumb)
    .limit(1);

  if (error) {
    throw new Error(`Failed to fetch draw: ${error.message}`);
  }

  if (data && data.length > 0) {
    return Object.values(data[0]) as unknown as number[];
  }
  return [];
}

// ---------------------------------------------------------------------------
// Vietlott fetch helpers (runs client-side, replaces the Edge Function)
// ---------------------------------------------------------------------------

function buildVietlottBody(config: GameConfig, drawNumb: number): string {
  const drawNumbString = String(drawNumb).padStart(5, "0");
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

function parseDateFromDoc(doc: Document): string | null {
  const titleEl = doc.querySelector(".chitietketqua_title h5");
  if (!titleEl) return null;
  const dateText = titleEl.textContent || "";
  const match = dateText.match(/(\d{2})\/(\d{2})\/(\d{4})/);
  if (match) {
    return `${match[3]}/${match[2]}/${match[1]}`;
  }
  return null;
}

function parseVietlottHtml(
  htmlString: string,
  hasBonus: boolean,
): FetchedDraw | null {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, "text/html");

  const balls = doc.querySelectorAll(".day_so_ket_qua_v2 .bong_tron");
  const numbers: number[] = [];
  let bonus: number | null = null;

  balls.forEach((el) => {
    const num = parseInt(el.textContent?.trim() || "0", 10);
    if (hasBonus && el.classList.contains("active")) {
      bonus = num;
    } else {
      numbers.push(num);
    }
  });

  if (numbers.length === 0) return null;

  return { numbers, bonus, drawDate: parseDateFromDoc(doc) };
}

async function fetchVietlottDraw(
  config: GameConfig,
  drawNumb: number,
): Promise<FetchedDraw | null> {
  try {
    const drawNumbString = '00000'.slice(0, 5 - `${drawNumb}`.length) + `${drawNumb}`;
    const response = await fetch(config.url, {
      "headers": {
        "accept": "*/*",
        "accept-language": "en-US,en;q=0.9",
        "content-type": "text/plain; charset=UTF-8",
        "sec-ch-ua": "\"Chromium\";v=\"134\", \"Not:A-Brand\";v=\"24\", \"Google Chrome\";v=\"134\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "cookie": "__uidac=0167d8207937674f2cc409fbadca1027; __admUTMtime=1742217337; __iid=; __iid=; __su=0; __su=0; __RC=5; __R=3; _gcl_au=1.1.802954987.1742217349; __uif=__uid%3A7897583983098189594%7C__ui%3A-1%7C__create%3A1719758398; __tb=0; __IP=712411498; _ga_L090WRF6YK=GS1.1.1742217336.1.1.1742217379.0.0.0; _ga=GA1.2.645949106.1742217336; session-cookie=182f7728f6be20a4c1d647acbeb261f5c763d240945155b5fc3dee43d62237bb0c1bc10ca839fed619a26e263ca32e03; _gid=GA1.2.1096728683.1742742615; _gat_gtag_UA_42453093_1=1; csrf-token-name=csrftoken; csrf-token-value=182f772f1dded68f153fceeae1a6f002ca162a5855545126581a7d9ab274edceff5af9d7497ec44f",
        "Referer": "https://www.vietlott.vn/vi/trung-thuong/ket-qua-trung-thuong/645"
      },
      "body": JSON.stringify({"ORenderInfo":{"SiteId":"main.frontend.vi","SiteAlias":"main.vi","UserSessionId":"","SiteLang":"vi","IsPageDesign":false,"ExtraParam1":"","ExtraParam2":"","ExtraParam3":"","SiteURL":"","WebPage":null,"SiteName":"Vietlott","OrgPageAlias":null,"PageAlias":null,"FullPageAlias":null,"RefKey":null,"System":1},"Key":"f87967fb","DrawId":drawNumbString}),
      "method": "POST"
    });
    // const response = await fetch(config.url, {
    //   method: "POST",
    //   credentials: "omit",
    //   headers: {
    //     accept: "*/*",
    //     "accept-language": "en-US,en;q=0.9",
    //     "content-type": "text/plain; charset=UTF-8",
    //     "sec-ch-ua":
    //       '"Chromium";v="146", "Not-A.Brand";v="24", "Google Chrome";v="146"',
    //     "sec-ch-ua-mobile": "?0",
    //     "sec-ch-ua-platform": '"macOS"',
    //     "sec-fetch-dest": "empty",
    //     "sec-fetch-mode": "cors",
    //     "sec-fetch-site": "same-origin",
    //     Referer: config.referer,
    //   },
    //   body: buildVietlottBody(config, drawNumb),
    // });
    console.log("response", response);
    console.log("response.body", response.body);
    const text = await response.text();
    if (!text) {
      console.warn(`Draw ${drawNumb}: empty response body`);
      return null;
    }

    const data = JSON.parse(text) as VietlottApiResponse;
    const htmlString = data?.value?.RetExtraParam1;
    if (!htmlString) {
      console.warn(`Draw ${drawNumb}: No RetExtraParam1 in response`);
      return null;
    }

    return parseVietlottHtml(htmlString, config.hasBonus);
  } catch (err) {
    console.error(`Draw ${drawNumb}: fetch error —`, err);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Sync — fetches new draws from Vietlott and inserts them into Supabase
// ---------------------------------------------------------------------------

export async function syncResults(gameType: GameType): Promise<SyncStatus> {
  await requireAuth();

  const gameConfig = GAME_CONFIGS[gameType];
  const startDrawNumb = await fetchHighestDrawNumb(gameConfig);

  let drawNumb = startDrawNumb;
  let lastSuccessfulDrawNumb = startDrawNumb;
  let consecutiveMisses = 0;
  const MAX_CONSECUTIVE_MISSES = 3;

  while (consecutiveMisses < MAX_CONSECUTIVE_MISSES) {
    drawNumb++;
    const fetchedDraw = await fetchVietlottDraw(gameConfig, drawNumb);

    if (fetchedDraw && fetchedDraw.numbers.length > 0) {
      consecutiveMisses = 0;
      lastSuccessfulDrawNumb = drawNumb;

      const insertObj: Record<string, string | number> = {
        draw_date: fetchedDraw.drawDate ?? "",
        draw_numb: drawNumb,
      };
      fetchedDraw.numbers.forEach((num, i) => {
        insertObj[gameConfig.numberColumns[i]] = num;
      });
      if (gameConfig.hasBonus && fetchedDraw.bonus != null) {
        insertObj["numberextra"] = fetchedDraw.bonus;
      }

      const { error } = await supabase
        .from(gameConfig.tableName)
        .insert(insertObj);
      if (error) {
        console.error(`Insert error for draw ${drawNumb}:`, error);
      }
    } else {
      consecutiveMisses++;
    }
  }

  return {
    gameType,
    newDraws: lastSuccessfulDrawNumb - startDrawNumb,
    highestDrawNumb: lastSuccessfulDrawNumb,
  };
}

export async function syncAllResults(): Promise<SyncStatus[]> {
  await requireAuth();

  const results: SyncStatus[] = [];
  for (const gameType of Object.keys(GAME_CONFIGS) as GameType[]) {
    const status = await syncResults(gameType);
    results.push(status);
  }
  return results;
}
