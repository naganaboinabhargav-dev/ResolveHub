const express = require('express');
const router = express.Router();
const { getFaqs, askBot } = require('../controllers/chatbotController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/faqs', getFaqs);
router.post('/ask', askBot);

module.exports = router;
