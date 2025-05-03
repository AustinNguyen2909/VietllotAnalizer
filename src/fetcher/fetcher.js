const axios = require("axios");
const { extractLotteryNumbers45, extractLotteryNumbers55 } = require("./utils");

const fetchVietlottData45 = async (drawNumb) => {
  const drawNumbString = '00000'.slice(0, 5 - `${drawNumb}`.length) + `${drawNumb}`
  try {
    const url = "https://www.vietlott.vn/ajaxpro/Vietlott.PlugIn.WebParts.Game645ResultDetailWebPart,Vietlott.PlugIn.WebParts.ashx";
    const response = await fetch(url, {
      "headers": {
        "accept": "*/*",
        "accept-language": "en-US,en;q=0.9",
        "content-type": "text/plain; charset=UTF-8",
        "priority": "u=0, i",
        "sec-ch-ua": "\"Chromium\";v=\"134\", \"Not:A-Brand\";v=\"24\", \"Google Chrome\";v=\"134\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "x-ajax-token": "6b78654783ec57c59c98199d461f98b46fb41175f54ab1e65f122d70baecb7e3",
        "x-ajaxpro-method": "ServerSideDrawResult",
        "x-csrftoken": "182f772c81c7cb8b560ec5603b52f00602168fcbbf0d7259268e82ddab3510c475795ad52c4035cf",
        "x-requested-with": "XMLHttpRequest",
        "cookie": "__uidac=0167d8207937674f2cc409fbadca1027; __admUTMtime=1742217337; __iid=; __iid=; __su=0; __su=0; __RC=5; __R=3; _gcl_au=1.1.802954987.1742217349; __uif=__uid%3A7897583983098189594%7C__ui%3A-1%7C__create%3A1719758398; __tb=0; __IP=712411498; _ga_L090WRF6YK=GS1.1.1742217336.1.1.1742217379.0.0.0; _ga=GA1.2.645949106.1742217336; session-cookie=182f7728f6be20a4c1d647acbeb261f5c763d240945155b5fc3dee43d62237bb0c1bc10ca839fed619a26e263ca32e03; _gid=GA1.2.1096728683.1742742615; _gat_gtag_UA_42453093_1=1; csrf-token-name=csrftoken; csrf-token-value=182f772f1dded68f153fceeae1a6f002ca162a5855545126581a7d9ab274edceff5af9d7497ec44f",
        "Referer": "https://www.vietlott.vn/vi/trung-thuong/ket-qua-trung-thuong/645",
        "Referrer-Policy": "strict-origin-when-cross-origin"
      },
      "body": JSON.stringify({"ORenderInfo":{"SiteId":"main.frontend.vi","SiteAlias":"main.vi","UserSessionId":"","SiteLang":"vi","IsPageDesign":false,"ExtraParam1":"","ExtraParam2":"","ExtraParam3":"","SiteURL":"","WebPage":null,"SiteName":"Vietlott","OrgPageAlias":null,"PageAlias":null,"FullPageAlias":null,"RefKey":null,"System":1},"Key":"f87967fb","DrawId":drawNumbString}),
      "method": "POST"
    });
    const data = await response.json()
    if (data) {
      const formatData = extractLotteryNumbers45(data)
      return formatData
    }
  } catch (error) {
    console.error("Error fetching Vietlott data:", error);
    return null;
  }
};

const fetchVietlottData55 = async (drawNumb) => {
  const drawNumbString = '00000'.slice(0, 5 - `${drawNumb}`.length) + `${drawNumb}`
  try {
    const url = "https://www.vietlott.vn/ajaxpro/Vietlott.PlugIn.WebParts.Game655ResultDetailWebPart,Vietlott.PlugIn.WebParts.ashx";
    const response = await fetch(url, {
      "headers": {
        "accept": "*/*",
        "accept-language": "en-US,en;q=0.9",
        "content-type": "text/plain; charset=UTF-8",
        "priority": "u=0, i",
        "sec-ch-ua": "\"Google Chrome\";v=\"135\", \"Not-A.Brand\";v=\"8\", \"Chromium\";v=\"135\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "x-ajax-token": "e6a8261a1069b787a68575d3b630ed07dff094d885ad244e70ff1c931b82056b",
        "x-ajaxpro-method": "ServerSideDrawResult",
        "x-csrftoken": "1837f9b97b5efa137b412c3c43208ae9cf4754c3bf1d4e8eac00f76de7218ad7fb5951ca85b8ce35",
        "x-requested-with": "XMLHttpRequest",
        "cookie": "__uidac=0167d8207937674f2cc409fbadca1027; __RC=5; __R=3; _gcl_au=1.1.802954987.1742217349; __tb=0; __IP=712411498; _ga_L090WRF6YK=GS1.1.1742217336.1.1.1742217379.0.0.0; _ga=GA1.2.645949106.1742217336; _gid=GA1.2.843793995.1745137605; session-cookie=1837f96778a24f452cd247acbeb261f5d11bf63cf57adcb074e39742fb7a29f2b7b1238057e7519df9d96a78f528c455; csrf-token-name=csrftoken; _gat_gtag_UA_42453093_1=1; csrf-token-value=1837fa1389e8afce7a761dcddf759619fbfbda3b9283358a1d54cbc12d8022321ac611359cb42551",
        "Referer": "https://www.vietlott.vn/vi/trung-thuong/ket-qua-trung-thuong/655",
        "Referrer-Policy": "strict-origin-when-cross-origin"
      },
      "body": JSON.stringify({"ORenderInfo":{"SiteId":"main.frontend.vi","SiteAlias":"main.vi","UserSessionId":"","SiteLang":"vi","IsPageDesign":false,"ExtraParam1":"","ExtraParam2":"","ExtraParam3":"","SiteURL":"","WebPage":null,"SiteName":"Vietlott","OrgPageAlias":null,"PageAlias":null,"FullPageAlias":null,"RefKey":null,"System":1},"Key":"f87967fb","DrawId":drawNumbString}),
      "method": "POST"
    });
    const data = await response.json()
    if (data) {
      const formatData = extractLotteryNumbers55(data)
      return formatData
    }
  } catch (error) {
    console.error("Error fetching Vietlott data:", error);
    return null;
  }
};

module.exports = { fetchVietlottData45, fetchVietlottData55 };
