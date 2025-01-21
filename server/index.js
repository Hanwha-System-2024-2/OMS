const express = require('express');
const http = require('http');
const socketIo = require('socket.io')
const cors = require('cors');
const net = require("net");

// C 서버와 연결 설정
const HOST = "127.0.0.1"; // C 서버의 IP 주소
const PORT1 = 5001; // C 서버가 사용하는 포트

// TCP 클라이언트를 생성
const client = new net.Socket();

// C 서버와 연결
client.connect(PORT1, HOST, () => {
  console.log(`Connected to C server at ${HOST}:${PORT1}`);
  
  // 연결되면 데이터를 보냄
  const message = JSON.stringify({ action: "greet", message: "Hello from Node.js" });
  client.write(message);
});

// 데이터 수신
client.on("data", (data) => {
  console.log("Received from C server:", data.toString());
  
  // 받은 데이터를 처리 후 연결 종료
  client.end();
});

// 에러 처리
client.on("error", (err) => {
  console.error("Error:", err);
});

// 연결 종료 시
client.on("close", () => {
  console.log("Connection to C server closed");
});


const app = express();
const PORT = process.env.PORT || 5000;
const io = socketIo(server);

// CORS 설정
app.use(cors());

// 미들웨어 설정 (예: CORS 설정, JSON 파싱 등)
app.use(express.json());

// Express 서버 기본 라우팅 설정정
app.get('/', (req, res) => {
  res.send('한화시스템 플젝임당당');
});

// 소켓 통신 설정 (클라이언트 연결 및 이벤트 처리)
io.on("connection", (socket) => {
    console.log("A user connected");
  
    // 클라이언트로부터 메시지를 받았을 때
    socket.on("message", (data) => {
      console.log("Message from client: ", data);
    });
  
    // 클라이언트 연결 종료 시
    socket.on("disconnect", () => {
      console.log("A user disconnected");
    });
  });

// 서버 시작
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
