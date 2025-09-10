const Message = require('../models/messageModel');

function initializeSocket(io) {
  // Lắng nghe sự kiện khi có một client kết nối
  io.on('connection', (socket) => {
    console.log(`Một người dùng đã kết nối: ${socket.id}`);

    // Khi người dùng tham gia vào một phòng chat (cuộc hội thoại)
    socket.on('join_conversation', (conversationId) => {
      socket.join(conversationId);
      console.log(`User ${socket.id} đã tham gia phòng ${conversationId}`);
    });

    // Lắng nghe sự kiện 'send_message' từ client
    socket.on('send_message', async (data) => {
      try {
        const { conversationId, senderId, content } = data;
        
        // 1. Lưu tin nhắn vào cơ sở dữ liệu
        const newMessage = await Message.create(conversationId, senderId, content);

        // 2. Gửi tin nhắn đến tất cả mọi người trong cùng phòng chat
        io.to(conversationId).emit('receive_message', newMessage);
        
        console.log(`Tin nhắn mới trong phòng ${conversationId}:`, newMessage);
      } catch (error) {
        console.error('Lỗi khi xử lý tin nhắn:', error);
        // Có thể gửi lại lỗi cho người gửi
        socket.emit('message_error', { message: "Không thể gửi tin nhắn" });
      }
    });

    // Xử lý khi người dùng ngắt kết nối
    socket.on('disconnect', () => {
      console.log(`Người dùng đã ngắt kết nối: ${socket.id}`);
    });
  });
}

module.exports = initializeSocket;
