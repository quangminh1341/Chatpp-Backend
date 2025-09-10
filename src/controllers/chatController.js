const Conversation = require('../models/conversationModel');
const Message = require('../models/messageModel');

// Lấy danh sách các cuộc hội thoại của một user
exports.getConversationsByUserId = async (req, res) => {
  try {
    const userId = req.params.userId;
    const conversations = await Conversation.findByUserId(userId);
    res.status(200).json(conversations);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server khi lấy cuộc hội thoại", error: error.message });
  }
};

// Lấy danh sách tin nhắn của một cuộc hội thoại
exports.getMessagesByConversationId = async (req, res) => {
  try {
    const conversationId = req.params.conversationId;
    const messages = await Message.findByConversation(conversationId);
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server khi lấy tin nhắn", error: error.message });
  }
};
