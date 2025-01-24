// Express 서버 메인 설정

require('dotenv').config() // 환경 변수 설정정
const express = require('express');
const cors = require('cors');
// const cookieParser = require('cookie-parser')

const { initializeSockets } = require('./services/socketManager')
const authRoutes = require('./routes/authRoutes');
const stockRoutes = require('./routes/stockRoutes');
const orderRoutes = require('./routes/orderRoutes');
// const { errorMiddleware } = require('./middlewares/errorMiddleware');

const app = express();
const PORT = 5000;

// CORS 설정(React(origin)와와 서버 간 통신 허용)
app.use(cors({
  origin: 'http://localhost:5173', // 허용할 클라이언트 주소
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // 허용할 HTTP 메서드
  credentials: true, // 쿠키, 인증 정보 허용
}));

app.use(express.json()); // JSON 데이터를 읽을 수 있도록 설정

// Initialize sockets
initializeSockets();

// Routes
app.use('/auth', authRoutes);
// app.use('/stocks', stockRoutes);
// app.use('/orders', orderRoutes);

// Error Handling
// app.use(errorMiddleware);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
