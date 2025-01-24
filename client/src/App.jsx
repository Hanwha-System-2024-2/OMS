import './App.css'
import { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './pages/Login';
import Stock from './pages/Stock';
import Order from './pages/Order';
import NotFound from './components/NotFound';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  return (
    <Router>
      <Routes>
        {/* 로그인 페이지 */}
        <Route path="/" element={<Login onLogin={handleLogin} />} />
        
        {/* 종목 페이지 (로그인 후 접근 가능) */}
        <Route path="/stock" element={isLoggedIn ? <Stock /> : <Login onLogin={handleLogin} />} />
        
        {/* 주문 페이지 (스톡에서 주문 버튼 클릭 시 이동) */}
        <Route path="/order" element={isLoggedIn ? <Order /> : <Login onLogin={handleLogin} />} />

        {/* 특정 종목 주문 페이지 */}
        {/* <Route path="stock/:stockId" element={<Order />}></Route> */}

        {/* 잘못된 경로 */}
        <Route path="*" element={<NotFound />}></Route>
      </Routes>
    </Router>
  )
}

export default App
