const net = require('net'); //MCI 서버와 TCP 소켓 통신
const { createOrderBuffer, parseOrderResponse } = require('../utils/protocolService');


let fepSocket
let isFepConnected = false;
let heartbeatTimer; //FEP 연결지속을 위한 더미 데이터 보내는 간격
const pendingOrders = new Map(); // 주문 요청-응답 매칭을 위한 Map


// FEP 서버와 TCP 연결(주문)
function initializeFepSockets(server) {

  // 1. FEP 주소 및 포트
  // const fepHost = '127.0.0.1';
  // const fepPort = 5001;
  const fepHost = '3.35.106.137';
  const fepPort = 8080;


  // 2. FEP 서버 소켓 초기화 및 연결
  fepSocket = new net.Socket();
  fepSocket.connect(fepPort, fepHost, () => {
    checkFepReadiness(); // FEP와 KRX 서버가 모두 켜진 상태인 경우인지 확인
    console.log(`Connected to FEP server at ${fepHost}:${fepPort}`);
  });

  // 3. FEP 서버로부터 데이터 수신
  fepSocket.on("data", handleFepResponse);

  // 4. 에러 처리
  fepSocket.on('error', (err) => {
    console.error('FEP socket error:', err.message);
  });

  // 5. 연결 끊김 및 재연결
  fepSocket.on("close", () => {
    console.warn("⚠️ [OMS] FEP 서버와의 연결이 종료됨. X초 후 재연결 시도...");
    isFepConnected = false;
    clearInterval(heartbeatTimer);
    setTimeout(initializeFepSockets, 3000); // 3초 후 재연결 시도
});
}


// FEP 준비 상태 확인
function checkFepReadiness() {
  const readinessBuffer = Buffer.alloc(4);
  readinessBuffer.writeInt32LE(100, 0); // tr_id = 100 (FEP 서버 준비 요청)
  fepSocket.write(readinessBuffer);
  console.log("📩 [OMS] FEP 서버 준비 상태 요청 전송 (tr_id = 100)");
}


// FEP로부터 받은 응답 처리
function handleFepResponse(data) {
  const tr_id = data.readInt32LE(0);
  console.log(`📩 [OMS] FEP 서버 응답 수신: tr_id = ${tr_id}`);

  if (tr_id === 101) {
      const status = data.readInt32LE(4); // 0: 이상 있음, 1: 이상 없음
      if (status === 1) {
          console.log("✅ [OMS] FEP 서버가 정상 상태 (세션 연결 완료)");
          isFepConnected = true;
          startHeartbeat(); // Heartbeat 전송 시작
      } else {
          console.warn("⚠️ [OMS] FEP 서버에 이상 있음. 재연결 시도...");
          fepSocket.destroy();
      }
  } else if (tr_id === 10) {
      handleOrderResponse(data); // 주문 응답 처리
  } else {
      console.warn(`⚠️ [OMS] 알 수 없는 tr_id 수신: ${tr_id}`);
  }
}


// heartbeat 타이머 리셋
function resetHeartbeatTimer() {
  clearTimeout(heartbeatTimer);
  heartbeatTimer = setTimeout(() => {
      sendHeartbeat();
  }, 30000); // 30초 후 Heartbeat 전송
}


// 마지막 주문 요청 이후 30초 지나면 heartbeat 전송
function sendHeartbeat() {
  if (!isFepConnected) return;

  const heartbeatBuffer = Buffer.alloc(4);
  heartbeatBuffer.writeInt32LE(99, 0); // tr_id = 99 (Heartbeat)
  
  fepSocket.write(heartbeatBuffer);
  console.log("❤️ [OMS] Heartbeat 전송 (tr_id = 99)");

  resetHeartbeatTimer(); // Heartbeat 전송 후 다시 30초 타이머 시작
}


// 주문 요청
function sendOrderRequest(orderData) {
  
  console.log('sendOrderRequest 보냄', orderData)
  return new Promise((resolve, reject) => {
    // 예외 처리
    if (!isFepConnected) {
      return reject("❌ [OMS] FEP 서버가 연결되지 않음 (주문 요청 불가)");
    }
    
    // 주문 요청 전문 생성
    tr_code = orderData.transaction_code;
    const buffer = createOrderBuffer(orderData);

    pendingOrders.set(tr_code, (response) => {
      // reject_code에 따른 예외처리
      const reject_code = response.reject_code;

      if (response && response.reject_code === '0000') {
        resolve({ success: true, message: "주문 요청에 성공했습니다." });
      } else if (response && response.reject_code === 'E101') {
        resolve({ success: false, message: `주문 요청에 실패했습니다.(${reject_code}: 중복된 거래코드)` });
      } else if (response && response.reject_code === 'E102') {
        resolve({ success: false, message: `주문 요청에 실패했습니다.(${reject_code}: 유효하지 않는 주문 가격)` });
      } else if (response && response.reject_code === 'E103') {
        resolve({ success: false, message: `주문 요청에 실패했습니다.(${reject_code}: 유효하지 않은 주문 수량)` });
      } else if (response && response.reject_code === 'E003') {
        resolve({ success: false, message: `주문 요청에 실패했습니다.(${reject_code}: 상한가/하한가 오류)` });
      } else if (response && response.reject_code?.startsWith('E')) {
        resolve({ success: false, message: `${reject_code}: 주문 요청에 실패했습니다.(기타 사유)` });
      } else {
        reject(new Error("주문 요청에 실패했습니다.(No Response)"));
      }
    });
    fepSocket.write(buffer); // FEP 서버로 주문 요청 전송
    resetHeartbeatTimer(); // 주문 요청이 들어왔으므로 Heartbeat 타이머 초기화
    console.log('fep소켓으로 주문 요청 갔음')
  });
};


// 주문 응답 처리
function handleOrderResponse(data) {
  const response = parseOrderResponse(data);

  // 전문 길이가 다르면 예외 처리
  const expectedLength = data.readUInt32BE(4); // 4~7 바이트 (Big Endian)
  const actualLength = data.length;

  if (expectedLength !== actualLength) {
    console.error(`E107: 전문 길이 불일치 (예상: ${expectedLength}, 실제: ${actualLength})`);
    return null;
  }
  console.log('response', response);
  
  const tr_code = response.transaction_code

  console.log('pendingOrders:', pendingOrders)
  if (pendingOrders.has(tr_code)) {
    const callback = pendingOrders.get(tr_code);
    callback(response); // 응답 처리
    pendingOrders.delete(tr_code);
  } else {
    console.warn("No matching order found for this response.");
  }
}

module.exports = {
  initializeFepSockets,
  sendOrderRequest
};
