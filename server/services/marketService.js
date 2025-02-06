const { loadMarketData, saveMarketData } = require("../utils/marketDataManager");

let marketData = loadMarketData(); // 서버 시작 시 마지막 Market Data 불러오기

// 실시간 Market Data 업데이트 함수
function updateMarketData(newData) {
    marketData = newData;
    console.log("📈 [OMS] Market Data 업데이트됨");
}

// 현재 Market Data 반환 함수
function getCurrentMarketData() {
    return marketData;
}


module.exports = { updateMarketData, getCurrentMarketData, saveMarketData, loadMarketData };
