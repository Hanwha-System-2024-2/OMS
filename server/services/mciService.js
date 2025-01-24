const { parseLoginResponse } = require('./protocolService');

// const pendingRequests = {}; // 요청 대기 상태 저장
let stockSubscribers = []; // 주식 정보를 받을 클라이언트 목록


// // 로그인 요청 전송
// function sendLoginRequest(mciSocket, buffer, requestId) {
//     return new Promise((resolve, reject) => {
  
//       // pendingResponses[requestId] = { resolve, reject };
  
//       // 5초 타임아웃 설정
//       // setTimeout(() => {
//       //   if (pendingResponses[requestId]) {
//       //     reject(new Error('Login request timed out'));
//       //     delete pendingResponses[requestId];
//       //   }
//       // }, 5000);
  
//       mciSocket.write(buffer); // 로그인 요청 전송
//       mciSocket.on(;data)
//       console.log('requeset to MCI')
//     });
//   }


// MCI로부터 응답받은 데이터 처리
function handleMciResponse(data) {
    tr_id = data.readInt32LE(0); // tr_id 활용 로그인/종목시세 로직 구분

    if (tr_id === 4) {
      // 로그인 응답 처리
      const response = parseLoginResponse(data);
      const { userId } = response;

      

      if (pendingResponses[requestId]) {
        const { resolve } = pendingResponses[requestId];
        resolve(response); // resolve() : sendLoginRequest 함수의 반환값인 Promise를 성공 상태로 전환
        delete pendingResponses[requestId]; // 처리 후 대기열에서 제거
        } else {
        console.warn(`Unmatched login response for requestId ${requestId}`);
        }


    } else if (tr_id === 6) {
      // 종목 시세 데이터 처리
      // broadcastStockData(response);
    } else {
      console.warn('Unknown tr_id received:', tr_id);
    }
  };


  // WebSocket 초기화
function initializeWebSocket(server) {
  const WebSocket = require('ws');
  const wss = new WebSocket.Server({ server }); //웹소켓 서버 인스턴스스

  wss.on('connection', (ws) => {
    console.log('WebSocket client connected');
    stockSubscribers.push(ws); // 클라이언트의 WebSocket 객체를 저장

    ws.on('close', () => {
      console.log('WebSocket client disconnected');
      stockSubscribers = stockSubscribers.filter((client) => client !== ws); //연결 끊어진 클라이언트 삭제
    });
  });

  console.log('WebSocket server initialized');
}


// 종목 시세 데이터 브로드캐스트
function broadcastStockData(stockData) {
  stockSubscribers.forEach((ws) => {
    ws.send(JSON.stringify(stockData)); // 주식 정보를 JSON으로 변환하여 전송
  });
}


module.exports = {
  initializeWebSocket,
  handleMciResponse,
  // sendLoginRequest,
};
