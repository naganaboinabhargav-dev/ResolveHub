const asyncHandler = require('../utils/asyncHandler');
const Message = require('../models/Message');
const User = require('../models/User');
const notify = require('../utils/notify');

// @desc    Admin: list all conversations (one per agent/client) with last message + unread count
// @route   GET /api/messages/conversations
// @access  Private/Admin
const getConversations = asyncHandler(async (req, res) => {
  const users = await User.find({ role: { $in: ['agent', 'client'] } }).select('name email role company isActive');

  const conversations = await Promise.all(
    users.map(async (u) => {
      const lastMessage = await Message.findOne({ user: u._id }).sort({ createdAt: -1 });
      const unreadCount = await Message.countDocuments({ user: u._id, senderRole: { $ne: 'admin' }, isRead: false });
      return {
        user: u,
        lastMessage: lastMessage ? { text: lastMessage.text, createdAt: lastMessage.createdAt, senderRole: lastMessage.senderRole } : null,
        unreadCount,
      };
    })
  );

  conversations.sort((a, b) => {
    const at = a.lastMessage ? new Date(a.lastMessage.createdAt).getTime() : 0;
    const bt = b.lastMessage ? new Date(b.lastMessage.createdAt).getTime() : 0;
    return bt - at;
  });

  res.json({ success: true, conversations });
});

// @desc    Admin: get full conversation with a specific agent/client
// @route   GET /api/messages/user/:userId
// @access  Private/Admin
const getConversationWithUser = asyncHandler(async (req, res) => {
  const target = await User.findById(req.params.userId);
  if (!target || target.role === 'admin') {
    res.status(404);
    throw new Error('User not found');
  }
  const messages = await Message.find({ user: target._id }).sort({ createdAt: 1 }).populate('sender', 'name role');
  await Message.updateMany({ user: target._id, senderRole: { $ne: 'admin' }, isRead: false }, { isRead: true });
  res.json({ success: true, messages, user: target });
});

// @desc    Admin: send a message to a specific agent/client
// @route   POST /api/messages/user/:userId
// @access  Private/Admin
const sendMessageToUser = asyncHandler(async (req, res) => {
  const { text } = req.body;
  const target = await User.findById(req.params.userId);
  if (!target || target.role === 'admin') {
    res.status(404);
    throw new Error('User not found');
  }

  const message = await Message.create({
    user: target._id,
    sender: req.user._id,
    senderRole: 'admin',
    text,
  });

  await notify({
    user: target._id,
    title: 'New message from Admin',
    message: text.slice(0, 100),
    type: 'general',
  });

  const populated = await message.populate('sender', 'name role');
  res.status(201).json({ success: true, message: populated });
});

// @desc    Agent/Client: get my conversation with the Admin team
// @route   GET /api/messages/me
// @access  Private/Agent/Client
const getMyConversation = asyncHandler(async (req, res) => {
  const messages = await Message.find({ user: req.user._id }).sort({ createdAt: 1 }).populate('sender', 'name role');
  await Message.updateMany({ user: req.user._id, senderRole: 'admin', isRead: false }, { isRead: true });
  res.json({ success: true, messages });
});

// @desc    Agent/Client: send a message to the Admin team
// @route   POST /api/messages/me
// @access  Private/Agent/Client
const sendMyMessage = asyncHandler(async (req, res) => {
  const { text } = req.body;

  const message = await Message.create({
    user: req.user._id,
    sender: req.user._id,
    senderRole: req.user.role,
    text,
  });

  const admins = await User.find({ role: 'admin' }).select('_id');
  await Promise.all(
    admins.map((admin) =>
      notify({
        user: admin._id,
        title: `New message from ${req.user.name}`,
        message: text.slice(0, 100),
        type: 'general',
      })
    )
  );

  const populated = await message.populate('sender', 'name role');
  res.status(201).json({ success: true, message: populated });
});

// @desc    Get total unread direct-message count for the logged-in user
// @route   GET /api/messages/unread-count
// @access  Private
const getUnreadCount = asyncHandler(async (req, res) => {
  let count;
  if (req.user.role === 'admin') {
    count = await Message.countDocuments({ senderRole: { $ne: 'admin' }, isRead: false });
  } else {
    count = await Message.countDocuments({ user: req.user._id, senderRole: 'admin', isRead: false });
  }
  res.json({ success: true, count });
});

// @desc    Edit a message you sent (admin editing their own message to a user,
//          or an agent/client editing their own message to the admin team)
// @route   PUT /api/messages/:id
// @access  Private
const editMessage = asyncHandler(async (req, res) => {
  const { text } = req.body;
  if (!text || !text.trim()) {
    res.status(400);
    throw new Error('Message text cannot be empty');
  }

  const message = await Message.findById(req.params.id);
  if (!message) {
    res.status(404);
    throw new Error('Message not found');
  }
  if (String(message.sender) !== String(req.user._id)) {
    res.status(403);
    throw new Error('You can only edit your own messages');
  }

  message.text = text;
  message.isEdited = true;
  message.editedAt = new Date();
  await message.save();

  const populated = await message.populate('sender', 'name role');
  res.json({ success: true, message: populated });
});

// @desc    Delete a message you sent
// @route   DELETE /api/messages/:id
// @access  Private
const deleteMessage = asyncHandler(async (req, res) => {
  const message = await Message.findById(req.params.id);
  if (!message) {
    res.status(404);
    throw new Error('Message not found');
  }
  if (String(message.sender) !== String(req.user._id)) {
    res.status(403);
    throw new Error('You can only delete your own messages');
  }
  await message.deleteOne();
  res.json({ success: true, message: 'Message deleted' });
});

module.exports = {
  getConversations,
  getConversationWithUser,
  sendMessageToUser,
  getMyConversation,
  sendMyMessage,
  getUnreadCount,
  editMessage,
  deleteMessage,
};
