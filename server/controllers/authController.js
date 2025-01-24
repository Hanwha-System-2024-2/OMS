const { createOmqLoginProtocol, parseResponse } = require('../services/protocolService');
const { sendLoginRequest } = require('../services/mciService');
const { getMciSocket } = require('../services/socketManager');
const {parseLoginResponse} = require('../services/protocolService');
const { request } = require('express');


let pendingRequests = {}; // username 기반 요청 매칭
const mciSocket = getMciSocket();

exports.login = async (req, res) => {
  const { username, password } = req.body;

  // 예외처리(실행 중단)
  if (!username || !password) {
    return res.status(400).json({ success: false, message: '아이디와 비밀번호를 입력해주세요.' });
  }

  // 응답 대기 Promise 생성
  const responsePromise = new Promise((resolve, reject) => {
    pendingRequests[username] = { resolve, reject };
  });

  // 전문 생성 및 MCI 서버로 전송
  try {
    const requestBuffer = createOmqLoginProtocol(username, password); // 로그인 전문 생성
    mciSocket.write(requestBuffer);
    console.log('requested to MCI')
  } catch (err) {
      delete pendingRequests[username];
      return res.status(500).json({ error: 'Failed to send request to MCI server' });
  }

  console.log('왜 안 돼')
  // Socket 응답을 담은 Promise객체 생성
  mciSocket.on('data', (data) => {
    tr_id = data.readInt32LE(0); // tr_id 활용 로그인/종목시세 로직 구분
    console.log('여기는 되니')
    if (tr_id === 4) {
      try {
          // 수신한 데이터를 JSON으로 파싱
          console.log('여기까지는 됨')
          const parsedRes = parseLoginResponse(data);
          const { user_id,tr_id, status_code } = parsedRes;
          console.log('여기까지')

          // `user_id`가 요청한 username과 동일
          if (pendingRequests[user_id]) {
              // 매칭된 요청 Promise를 resolve
              pendingRequests[user_id].resolve({ tr_id, status_code });
              delete pendingRequests[user_id]; // 처리 완료된 요청 삭제
          } else {
              console.error(`Unmatched response for user_id (username): ${user_id}`);
          }
      } catch (err) {
          console.error('Error processing response from MCI server:', err);
      }
    } else if (tr_id === 6) {
      // 종목 시세 데이터 처리
      // broadcastStockData(response);
    } else {
      console.warn('Unknown tr_id received:', tr_id);
    }
});

  // 응답 대기
  try {
    const response = await responsePromise;
    res.json(response);
  } catch (err) {
      res.status(500).json({ error: 'Failed to process response from MCI server' });
  }

}