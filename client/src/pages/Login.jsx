import hanwhaLogo from '../assets/hanwha.png'
import { useEffect, useState } from 'react';
import axios from 'axios';
import styles from './Login.module.css';


function Login({ onLogin }) {

  const handleLoginClick = () => {
    onLogin();
  };
  // const [message, setMessage] = useState('');

  // useEffect(() => {
  //   axios.get('http://localhost:5000')
  //     .then(response => setMessage(response.data))
  //     .catch(error => console.error('Error fetching data:', error));
  // }, []);

  return (
    <div className={styles.loginPage}>
      <div className={styles.container}>
        <div className={styles.mainWrapper}>
          <div className={styles.contentContainer}>
            <div className={styles.headerContainer}>
              <img
                loading="lazy"
                src={hanwhaLogo}
                className={styles.logo}
                alt="한화시스템 로고"
              />
              <div className={styles.titleWrapper}>
                <div className={styles.serviceName}>한화시스템</div>
                <div className={styles.serviceDescription}>모의 증권앱 프로젝트</div>
              </div>
            </div>
            
            <form className={styles.formContainer}>
              <input
                type="text"
                id="username"
                className={styles.inputField}
                placeholder="아이디"
              />
              
              <input
                type="password"
                id="password"
                className={styles.inputField}
                placeholder="비밀번호"
              />
              
              <div className={styles.rememberMe}>
                <input
                  type="checkbox"
                  id="remember"
                  className={styles.checkbox}
                />
                <label htmlFor="remember">아이디 저장</label>
              </div>
              
              <button type="submit" onClick={handleLoginClick} className={styles.loginButton}>
                로그인
              </button>
            </form>
            
            <div className={styles.footer}>
              <a href="#" className={styles.footerLink}>아이디등록</a>
              <img
                loading="lazy"
                src="https://cdn.builder.io/api/v1/image/assets/TEMP/121f0634545c56ab3b69ef976c33a7af5d2e0592ce4f393505ba40c14de7f8c9?placeholderIfAbsent=true&apiKey=76373063de8c47ab8cdeeecfaeeac5fc"
                className={styles.divider}
                alt=""
              />
              <a href="#" className={styles.footerLink}>아이디/비밀번호찾기</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
