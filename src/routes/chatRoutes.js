const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

// Lấy tất cả cuộc hội thoại của một user
// GET /api/chat/conversations/:userId
router.get('/conversations/:userId', chatController.getConversationsByUserId);

// Lấy tất cả tin nhắn của một cuộc hội thoại
// GET /api/chat/messages/:conversationId
router.get('/messages/:conversationId', chatController.getMessagesByConversationId);

module.exports = router;
