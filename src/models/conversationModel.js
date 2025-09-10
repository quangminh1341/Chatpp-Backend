const pool = require('../config/database');

const Conversation = {
  // Lấy tất cả các cuộc hội thoại mà một user tham gia
  findByUserId: async (userId) => {
    let conn;
    try {
      conn = await pool.getConnection();
      const sql = `
        SELECT c.* FROM conversations c
        JOIN participants p ON c.id = p.conversation_id
        WHERE p.user_id = ?
      `;
      const conversations = await conn.query(sql, [userId]);
      return conversations;
    } catch (err) {
      console.error("Lỗi khi lấy danh sách cuộc hội thoại:", err);
      throw err;
    } finally {
      if (conn) conn.release();
    }
  }
};

module.exports = Conversation;
