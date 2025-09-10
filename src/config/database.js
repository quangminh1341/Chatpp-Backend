const mariadb = require('mariadb');
require('dotenv').config();

// Tạo một "pool" kết nối để tái sử dụng kết nối, giúp tăng hiệu năng
const pool = mariadb.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  connectionLimit: 5 // Số lượng kết nối tối đa trong pool
});

// Hàm để kiểm tra kết nối
async function checkConnection() {
  let conn;
  try {
    conn = await pool.getConnection();
    console.log("Kết nối MariaDB thành công!");
  } catch (err) {
    console.error("Không thể kết nối đến MariaDB:", err);
  } finally {
    if (conn) conn.release(); // Trả kết nối về lại pool
  }
}

checkConnection();

module.exports = pool;
