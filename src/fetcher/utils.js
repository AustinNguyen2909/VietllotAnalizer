const cheerio = require("cheerio");

function extractLotteryNumbers45(apiResponse) {
    // Extract the HTML content
    const htmlString = apiResponse.value.RetExtraParam1;
    
    if (!htmlString) {
        console.error("No HTML content found.");
        return [];
    }

    // Load HTML into Cheerio
    const $ = cheerio.load(htmlString);

    // Extract lottery numbers from <span class="bong_tron">
    const lotteryNumbers = $(".day_so_ket_qua_v2 .bong_tron").map((_, el) => $(el).text().trim()).get();

    // Extract draw date from <h5> inside <div class="chitietketqua_title">
    const dateText = $(".chitietketqua_title h5").text();
    let drawDate = null;

    const dateMatch = dateText.match(/(\d{2})\/(\d{2})\/(\d{4})/);
    if (dateMatch) {
        drawDate = `${dateMatch[3]}/${dateMatch[2]}/${dateMatch[1]}`;
    }

    return {
        numbers: lotteryNumbers,
        drawDate: drawDate,
    };
};

function extractLotteryNumbers55(apiResponse) {
    // Extract the HTML content
    const htmlString = apiResponse.value.RetExtraParam1;
    
    if (!htmlString) {
        console.error("No HTML content found.");
        return [];
    }

    // Load HTML into Cheerio
    const $ = cheerio.load(htmlString);

    const allBalls = $('.day_so_ket_qua_v2 .bong_tron');

    const numbers = [];
    let bonus = null;
  
    allBalls.each((i, el) => {
      const num = $(el).text().trim();
      if ($(el).hasClass('active')) {
        bonus = parseInt(num, 10);
      } else {
        numbers.push(parseInt(num, 10));
      }
    });

    // Extract draw date from <h5> inside <div class="chitietketqua_title">
    const dateText = $(".chitietketqua_title h5").text();
    let drawDate = null;

    const dateMatch = dateText.match(/(\d{2})\/(\d{2})\/(\d{4})/);
    if (dateMatch) {
        drawDate = `${dateMatch[3]}/${dateMatch[2]}/${dateMatch[1]}`;
    }

    return {
        numbers,
        bonus,
        drawDate: drawDate,
    };
};

function extractLotteryNumbers35(apiResponse) {
    // Extract the HTML content
    const htmlString = apiResponse.value.RetExtraParam1;
    
    if (!htmlString) {
        console.error("No HTML content found.");
        return [];
    }

    // Load HTML into Cheerio
    const $ = cheerio.load(htmlString);

    const allBalls = $('.day_so_ket_qua_v2 .bong_tron');

    const numbers = [];
    let bonus = null;
  
    allBalls.each((i, el) => {
      const num = $(el).text().trim();
      if ($(el).hasClass('active')) {
        bonus = parseInt(num, 10);
      } else {
        numbers.push(parseInt(num, 10));
      }
    });

    // Extract draw date from <h5> inside <div class="chitietketqua_title">
    const dateText = $(".chitietketqua_title h5").text();
    let drawDate = null;

    const dateMatch = dateText.match(/(\d{2})\/(\d{2})\/(\d{4})/);
    if (dateMatch) {
        drawDate = `${dateMatch[3]}/${dateMatch[2]}/${dateMatch[1]}`;
    }

    return {
        numbers,
        bonus,
        drawDate: drawDate,
    };
};

module.exports = { extractLotteryNumbers45, extractLotteryNumbers55, extractLotteryNumbers35 };
