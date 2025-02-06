const db = require("../db");

function getNextTransactionCode() {
    return new Promise((resolve, reject) => {
        db.get("SELECT last_transaction_code FROM transactions", (err, row) => {
            if (err) return reject(err);

            let newTransactionCode = row.last_transaction_code + 1;

            // 새로운 transaction_code를 DB에 업데이트
            db.run(
                "UPDATE transactions SET last_transaction_code = ?",
                [newTransactionCode],
                (err) => {
                    if (err) return reject(err);
                    resolve(newTransactionCode);
                }
            );
        });
    });
}

module.exports = { getNextTransactionCode };
