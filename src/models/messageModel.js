const pool = require('../config/database');

const Message = {
  // Hàm tạo một tin nhắn mới và lưu vào DB
  create: async (conversationId, senderId, content) => {
    let conn;
    try {
      conn = await pool.getConnection();
      const sql = 'INSERT INTO messages (conversation_id, sender_id, content) VALUES (?, ?, ?)';
      const result = await conn.query(sql, [conversationId, senderId, content]);
      
      // Lấy lại tin nhắn vừa tạo để trả về đầy đủ thông tin
      const [newMessage] = await conn.query('SELECT * FROM messages WHERE id = ?', [result.insertId]);
      return newMessage;
    } catch (err) {
      console.error("Lỗi khi tạo tin nhắn:", err);
      throw err;
    } finally {
      if (conn) conn.release();
    }
  },

  // Hàm lấy tất cả tin nhắn của một cuộc hội thoại
  findByConversation: async (conversationId) => {
    let conn;
    try {
      conn = await pool.getConnection();
      const sql = `
        SELECT m.*, u.display_name as sender_name 
        FROM messages m
        JOIN users u ON m.sender_id = u.id
        WHERE m.conversation_id = ? 
        ORDER BY m.created_at ASC
      `;
      const rows = await conn.query(sql, [conversationId]);
      return rows;
    } catch (err) {
      console.error("Lỗi khi tìm tin nhắn:", err);
      throw err;
    } finally {
      if (conn) conn.release();
    }
  }
};

module.exports = Message;
