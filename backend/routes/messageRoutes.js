const express = require('express');
const router = express.Router();
const {
  getConversations,
  getConversationWithUser,
  sendMessageToUser,
  getMyConversation,
  sendMyMessage,
  getUnreadCount,
  editMessage,
  deleteMessage,
} = require('../controllers/messageController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/unread-count', getUnreadCount);
router.put('/:id', editMessage);
router.delete('/:id', deleteMessage);

// Admin routes - message any agent or client
router.get('/conversations', authorize('admin'), getConversations);
router.get('/user/:userId', authorize('admin'), getConversationWithUser);
router.post('/user/:userId', authorize('admin'), sendMessageToUser);

// Agent/Client routes - message the Admin team
router.get('/me', authorize('agent', 'client'), getMyConversation);
router.post('/me', authorize('agent', 'client'), sendMyMessage);

module.exports = router;
