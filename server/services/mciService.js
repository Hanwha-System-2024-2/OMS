const net = require('net'); //MCI 서버와 TCP 소켓 통신
const {Server} = require('socket.io') //프론트엔드와 WebSocket 통신
const { createLoginBuffer, parseLoginResponse, parseMarketPrices, createHistoryBuffer, parseHistoryResponse } = require('../utils/protocolService');
const { updateMarketData, getCurrentMarketData } = require("../services/marketService");

let mciSocket, io;
const pendingResponseQueue = []; // 로그인 요청-응답 매칭을 위한 큐
const pendingHistory = new Map(); // 거래내역 요청-응답 위한 Map


// MCI서버와 TCP 연결(로그인 검증, 시세 데이터 받아오기) 및 프론트와 WebSocket 연결(시세 데이터 보내기) 설정
function initializeMciSockets(server) {

  // 1. 프론트엔드와 웹소켓 연결
  io = new Server(server, {
    cors: {
      origin: "http://localhost:5173", // 프론트엔드에서 오는 웹소켓 허용
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("[OMS] A frontend client connected");

    // 1-1. 프론트엔드가 연결되면 마지막 저장된 Market Data 즉시 전송
    const lastMarketData = getCurrentMarketData();
    if (Object.keys(lastMarketData).length > 0) {
        socket.emit("marketData", lastMarketData);
        console.log("📤 [OMS] 프론트엔드로 마지막 Market Data 전송:", lastMarketData);
    }
    
    socket.on("disconnect", () => console.log("[OMS] A frontend client disconnected"));
  });  // 프론트엔드가 WebSocket에 연결될 때


  // 2. MCI 주소 및 포트
  // const mciHost = '127.0.0.1';
  // const mciPort = 5001;
  const mciHost = '54.180.138.183';
  const mciPort = 8081;
  // const mciHost = '13.124.156.158';
  // const mciPort = 8082;



  // 3. MCI 서버 소켓 초기화 및 연결
  mciSocket = new net.Socket();
  mciSocket.connect(mciPort, mciHost, () => {
    console.log(`Connected to MCI server at ${mciHost}:${mciPort}`);
  });

  // 4. MCI 서버로부터 데이터 수신
  mciSocket.on("data", (data) => {
    const tr_id = data.readInt32LE(0); // tr_id 추출
    console.log(`Received data from MCI with tr_id: ${tr_id}`);
    if (tr_id === 4) {
      handleLoginResponse(data);  // 로그인 응답 처리
    } else if (tr_id === 6) {
      handleMarketData(io, data);  // 시세 데이터 처리
    } else if (tr_id === 13) {
      handleHistoryResponse(data);  // 거래 내역 데이터 처리
    } else {
      console.warn(`Unexpected tr_id: ${tr_id}`);
    }
  });
  
  // 5. 에러 처리
  mciSocket.on('error', (err) => {
    console.error('MCI socket error:', err.message);
  });

  // 6. 재연결
  // mciSocket.on('close', () => {
  //   console.warn('MCI socket closed. Reconnecting in 3 seconds...');
  //   setTimeout(connectMciSocket, 3000); // 3초 후 재연결 시도
  // });
}


// 로그인 요청 처리
function sendLoginRequest(username, password) {
  return new Promise((resolve, reject) => {
    // 로그인 요청 전문 생성
    const buffer = createLoginBuffer(username, password);

    // sendRequest : callback함수를 pendingResponseQueue에 추가하고 mci로 요청 전송함
    pendingResponseQueue.push((response) => {
      const result = parseLoginResponse(response);
      console.log('로그인 응답 파싱 데이터 :', result)

      if (result.status_code === 200) {
        resolve({ success: true, message: "로그인에 성공했습니다." });
      } else if (result.status_code === 201||202) {
        resolve({ success: false, message: "잘못된 아이디나 비밀번호입니다." });
      } else {
        reject(new Error("잘못된 로그인 응답 코드를 받았습니다."));
      }
    });
    mciSocket.write(buffer); // MCI 서버로 로그인 요청 전송
  });
};


// 로그인 응답 처리
function handleLoginResponse(data) {
  if (pendingResponseQueue.length > 0) {
    const callback = pendingResponseQueue.shift(); // 큐의 맨 앞 콜백 가져오기
    callback(data); // 응답 처리
  } else {
    console.warn("No pending login request for this response.");
  }
}


// 종목 시세 데이터 파싱 및 브로드캐스팅
function handleMarketData(io, data) {
  const latestMarketData = parseMarketPrices(data);
  updateMarketData(latestMarketData); // 종목 시세 정보 업데이트
  // console.log("Broadcasting Market Data:", latestMarketData);
  io.emit("marketData", latestMarketData); // 프론트엔드에 실시간으로 데이터 전송
}


// 거래 내역 조회 요청 처리
function sendHistoryRequest(username) {
  return new Promise((resolve, reject) => {
    // 거래내역 조회 요청 전문 생성
    const buffer = createHistoryBuffer(username);

    // sendRequest : callback함수를 pendingResponseQueue에 추가하고 mci로 요청 전송
    pendingHistory.set(username, (response) => {
      if (response) {
        resolve({ success: true, message: "거래 내역 조회에 성공했습니다.", response });
      } else {
        reject(new Error("거래 내역 조회에 실패했습니다.(No Response)"));
      }
    });
    mciSocket.write(buffer); // MCI 서버로 로그인 요청 전송
    console.log('거래내역 조회 요청 보냄')
  });
};


// 거래 내역 응답 처리
function handleHistoryResponse(data) {
  const response = parseHistoryResponse(data);
  console.log('거부사유:',response.transactions?.[0].reject_code)
  console.log('response', response.transactions?.[0] || '응답 파싱 잘 못 됨');
  const username = response.transactions?.[0]?.user_id || "알 수 없음";

  if (pendingHistory.has(username)) {
    const callback = pendingHistory.get(username);
    callback(response); // 응답 처리
    pendingHistory.delete(username);
  } else {
    console.warn("No matching history found for this response.");
  }
}

module.exports = {
  initializeMciSockets,
  sendLoginRequest,
  sendHistoryRequest,
};
