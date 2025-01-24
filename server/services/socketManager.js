const net = require('net');
const { handleMciResponse } = require('./mciService');
const { handleFepResponse } = require('./fepService');

let mciSocket = null;
let fepSocket = null;

function initializeSockets() {
  const mciHost = '3.35.134.101';
  const mciPort = 8081;

  const fepHost = '3.35.106.137';
  const fepPort = 8080;

  // MCI 서버 소켓 초기화
  function connectMciSocket() {
    mciSocket = new net.Socket();

    mciSocket.connect(mciPort, mciHost, () => {
      console.log(`Connected to MCI server at ${mciHost}:${mciPort}`);
    });

    // mciSocket.on('data', (data) => {
    //   handleMciResponse(data);
    // });

    mciSocket.on('error', (err) => {
      console.error('MCI socket error:', err.message);
    });

    // mciSocket.on('close', () => {
    //   console.warn('MCI socket closed. Reconnecting in 3 seconds...');
    //   setTimeout(connectMciSocket, 3000); // 3초 후 재연결 시도
    // });
  }

  // FEP 서버 소켓 초기화
  function connectFepSocket() {
    fepSocket = new net.Socket();

    fepSocket.connect(fepPort, fepHost, () => {
      console.log(`Connected to FEP server at ${fepHost}:${fepPort}`);
    });

    mciSocket.on('data', (data) => {
      handleFepResponse(data);
    });

    fepSocket.on('error', (err) => {
      console.error('FEP socket error:', err.message);
    });

    // fepSocket.on('close', () => {
    //   console.warn('FEP socket closed. Reconnecting in 3 seconds...');
    //   setTimeout(connectFepSocket, 3000); // 3초 후 재연결 시도
    // });
  }

  // 초기 연결
  connectMciSocket();
  connectFepSocket();
}

function getMciSocket() {
  return mciSocket;
}

function getFepSocket() {
  return fepSocket;
}

module.exports = {
  initializeSockets,
  getMciSocket,
  getFepSocket,
};
