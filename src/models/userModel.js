const pool = require('../config/database');
const bcrypt = require('bcryptjs');

const User = {
  // Tìm người dùng bằng username
  findByUsername: async (username) => {
    let conn;
    try {
      conn = await pool.getConnection();
      const [user] = await conn.query("SELECT * FROM users WHERE username = ?", [username]);
      return user;
    } catch (err) {
      console.error("Lỗi khi tìm user bằng username:", err);
      throw err;
    } finally {
      if (conn) conn.release();
    }
  },

  // Tạo người dùng mới
  create: async (userData) => {
    const { username, password, displayName, userType } = userData;
    let conn;
    try {
      conn = await pool.getConnection();
      
      // Băm mật khẩu trước khi lưu
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const sql = 'INSERT INTO users (username, password, display_name, user_type) VALUES (?, ?, ?, ?)';
      const result = await conn.query(sql, [username, hashedPassword, displayName, userType]);
      
      return { id: result.insertId, username, displayName, userType };
    } catch (err) {
      console.error("Lỗi khi tạo user:", err);
      throw err;
    } finally {
      if (conn) conn.release();
    }
  }
};

module.exports = User;
