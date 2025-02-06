const fs = require("fs");
const path = require("path");

const MARKET_DATA_FILE = path.join(__dirname, "marketData.json");

// 최신 시장 데이터를 저장하는 함수
function saveMarketData(marketData) {
    fs.writeFileSync(MARKET_DATA_FILE, JSON.stringify(marketData, null, 2), "utf-8");
    console.log("💾 [OMS] 마지막 Market Data를 저장했습니다.");
}

// 저장된 시장 데이터를 불러오는 함수
function loadMarketData() {
    if (fs.existsSync(MARKET_DATA_FILE)) {
        try {
            const data = fs.readFileSync(MARKET_DATA_FILE, "utf-8");
            console.log("📂 [OMS] 마지막 Market Data를 불러왔습니다.");
            return JSON.parse(data);
        } catch (error) {
            console.error("❌ [OMS] Market Data 불러오기 오류:", error);
            return {};
        }
    } else {
        console.log("⚠️ [OMS] 저장된 Market Data가 없습니다.");
        return {};
    }
}

module.exports = { saveMarketData, loadMarketData };
