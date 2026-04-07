// Supabase Edge Function: sync-results
// Scrapes Vietlott for new draw results and inserts them into the database.
// Invoked from the React app via supabase.functions.invoke("sync-results", { body: { gameType } })

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.43/deno-dom-wasm.ts";

type GameType = "45" | "55" | "35";

interface GameConfig {
  gameType: GameType;
  tableName: string;
  url: string;
  requestKey: string;
  referer: string;
  numberCount: number;
  hasBonus: boolean;
  numberColumns: string[];
  // Session tokens — expire periodically; update via Supabase secrets:
  //   VIETLOTT_COOKIE_45    / _55 / _35
  cookieEnvKey: string;
  secChUa: string;
}

const GAME_CONFIGS: Record<GameType, GameConfig> = {
  "45": {
    gameType: "45",
    tableName: "vietlott_results_45",
    url: "https://www.vietlott.vn/ajaxpro/Vietlott.PlugIn.WebParts.Game645ResultDetailWebPart,Vietlott.PlugIn.WebParts.ashx",
    requestKey: "e9e80c0f",
    referer: "https://www.vietlott.vn/vi/trung-thuong/ket-qua-trung-thuong/645",
    numberCount: 6,
    hasBonus: false,
    numberColumns: ["number1", "number2", "number3", "number4", "number5", "number6"],
    cookieEnvKey: "VIETLOTT_COOKIE_45",
    secChUa: '"Chromium";v="134", "Not:A-Brand";v="24", "Google Chrome";v="134"',
  },
  "55": {
    gameType: "55",
    tableName: "vietlott_results_55",
    url: "https://www.vietlott.vn/ajaxpro/Vietlott.PlugIn.WebParts.Game655ResultDetailWebPart,Vietlott.PlugIn.WebParts.ashx",
    requestKey: "248d0e8f",
    referer: "https://www.vietlott.vn/vi/trung-thuong/ket-qua-trung-thuong/655",
    numberCount: 6,
    hasBonus: true,
    numberColumns: ["number1", "number2", "number3", "number4", "number5", "number6"],
    cookieEnvKey: "VIETLOTT_COOKIE_55",
    secChUa: '"Google Chrome";v="135", "Not-A.Brand";v="8", "Chromium";v="135"',
  },
  "35": {
    gameType: "35",
    tableName: "vietlott_results_35",
    url: "https://www.vietlott.vn/ajaxpro/Vietlott.PlugIn.WebParts.Game535ResultDetailWebPart,Vietlott.PlugIn.WebParts.ashx",
    requestKey: "6a797a13",
    referer: "https://www.vietlott.vn/vi/trung-thuong/ket-qua-trung-thuong/535",
    numberCount: 5,
    hasBonus: true,
    numberColumns: ["number1", "number2", "number3", "number4", "number5"],
    cookieEnvKey: "VIETLOTT_COOKIE_35",
    secChUa: '"Not;A=Brand";v="99", "Google Chrome";v="139", "Chromium";v="139"',
  },
};

function padDrawNumber(drawNumb: number): string {
  return String(drawNumb).padStart(5, "0");
}

function buildRequestBody(config: GameConfig, drawNumbString: string): string {
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

function buildHeaders(config: GameConfig): Record<string, string> {
  const cookie = Deno.env.get(config.cookieEnvKey) ?? "";

  return {
    accept: "*/*",
    "accept-language": "en-US,en;q=0.9",
    "content-type": "text/plain; charset=UTF-8",
    priority: "u=0, i",
    "sec-ch-ua": config.secChUa,
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": '"Windows"',
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin",
    "x-ajaxpro-method": "ServerSideDrawResult",
    "x-requested-with": "XMLHttpRequest",
    cookie: cookie,
    Referer: config.referer,
  };
}

interface FetchedDraw {
  numbers: number[];
  drawDate: string | null;
  bonus: number | null;
}

function parseDateFromHtml(doc: ReturnType<DOMParser["parseFromString"]>): string | null {
  const titleEl = doc?.querySelector(".chitietketqua_title h5");
  if (!titleEl) return null;
  const dateText = titleEl.textContent || "";
  const dateMatch = dateText.match(/(\d{2})\/(\d{2})\/(\d{4})/);
  if (dateMatch) {
    return `${dateMatch[3]}/${dateMatch[2]}/${dateMatch[1]}`;
  }
  return null;
}

function parseStandardDraw(htmlString: string): FetchedDraw | null {
  if (!htmlString) return null;
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, "text/html");
  if (!doc) return null;

  const balls = doc.querySelectorAll(".day_so_ket_qua_v2 .bong_tron");
  const numbers: number[] = [];
  balls.forEach((el) => {
    numbers.push(parseInt(el.textContent?.trim() || "0", 10));
  });

  const drawDate = parseDateFromHtml(doc);
  return { numbers, drawDate, bonus: null };
}

function parseBonusDraw(htmlString: string): FetchedDraw | null {
  if (!htmlString) return null;
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, "text/html");
  if (!doc) return null;

  const allBalls = doc.querySelectorAll(".day_so_ket_qua_v2 .bong_tron");
  const numbers: number[] = [];
  let bonus: number | null = null;

  allBalls.forEach((el) => {
    const num = parseInt(el.textContent?.trim() || "0", 10);
    if (el.classList.contains("active")) {
      bonus = num;
    } else {
      numbers.push(num);
    }
  });

  const drawDate = parseDateFromHtml(doc);
  return { numbers, bonus, drawDate };
}

async function fetchVietlottData(config: GameConfig, drawNumb: number): Promise<FetchedDraw | null> {
  const drawNumbString = padDrawNumber(drawNumb);
  try {
    const response = await fetch(config.url, {
      method: "POST",
      headers: buildHeaders(config),
      body: buildRequestBody(config, drawNumbString),
    });

    if (!response.ok) {
      console.error(`Draw ${drawNumb}: HTTP ${response.status} ${response.statusText}`);
      return null;
    }

    const data = await response.json();
    const htmlString = data?.value?.RetExtraParam1;

    if (!htmlString) {
      // Log a sample of the raw response so we can detect API format changes
      console.warn(`Draw ${drawNumb}: No RetExtraParam1 in response. Keys: ${Object.keys(data?.value ?? {}).join(", ")}. Raw snippet: ${JSON.stringify(data).slice(0, 300)}`);
      return null;
    }

    const result = config.hasBonus ? parseBonusDraw(htmlString) : parseStandardDraw(htmlString);

    if (!result || result.numbers.length === 0) {
      return null;
    }

    return result;
  } catch (err) {
    console.error(`Draw ${drawNumb}: Fetch error — ${(err as Error).message}`);
    return null;
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  try {
    const { gameType } = await req.json();

    if (!gameType || !GAME_CONFIGS[gameType as GameType]) {
      return new Response(
        JSON.stringify({ error: "Invalid game type. Must be 45, 55, or 35." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const config = GAME_CONFIGS[gameType as GameType];

    // Create Supabase client with service role key (server-side)
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get highest existing draw number
    const { data: maxRow } = await supabase
      .from(config.tableName)
      .select("draw_numb")
      .order("draw_numb", { ascending: false })
      .limit(1);

    let drawNumb = maxRow && maxRow.length > 0 ? maxRow[0].draw_numb : 0;
    const startDrawNumb = drawNumb;
    // Allow up to 3 consecutive misses before stopping — tolerates gaps or transient failures
    const MAX_CONSECUTIVE_MISSES = 3;
    let consecutiveMisses = 0;
    let lastSuccessfulDrawNumb = drawNumb;

    while (consecutiveMisses < MAX_CONSECUTIVE_MISSES) {
      drawNumb++;
      const fetchedDraw = await fetchVietlottData(config, drawNumb);

      if (fetchedDraw?.numbers && fetchedDraw.numbers.length > 0) {
        consecutiveMisses = 0;
        lastSuccessfulDrawNumb = drawNumb;

        // Build insert object
        const insertObj: Record<string, string | number> = {
          draw_date: fetchedDraw.drawDate ?? "",
          draw_numb: drawNumb,
        };
        fetchedDraw.numbers.forEach((num, i) => {
          insertObj[config.numberColumns[i]] = num;
        });
        if (config.hasBonus && fetchedDraw.bonus != null) {
          insertObj["numberextra"] = fetchedDraw.bonus;
        }

        const { error } = await supabase.from(config.tableName).insert(insertObj);
        if (error) {
          console.error(`Insert error for draw ${drawNumb}:`, error);
        }
      } else {
        consecutiveMisses++;
      }
    }

    drawNumb = lastSuccessfulDrawNumb;

    const result = {
      gameType: config.gameType,
      newDraws: drawNumb - startDrawNumb,
      highestDrawNumb: drawNumb,
    };

    return new Response(JSON.stringify(result), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }
});
