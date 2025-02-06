const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./orders.db");

// 테이블 생성 (최초 실행 시)
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS transactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            last_transaction_code INTEGER NOT NULL
        )
    `);

    // 초기 값이 없으면 기본값(000001) 설정
    db.get("SELECT COUNT(*) AS count FROM transactions", (err, row) => {
        if (row.count === 0) {
            db.run("INSERT INTO transactions (last_transaction_code) VALUES (000001)");
        }
    });
});

module.exports = db;