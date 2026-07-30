const path = require('path');
const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const { checkEscalations } = require('./utils/escalation');

connectDB();

// Run an SLA breach sweep shortly after boot, then every 5 minutes.
setTimeout(checkEscalations, 15000);
setInterval(checkEscalations, 5 * 60 * 1000);

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || '*', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'ResolveHub API is running', time: new Date().toISOString() });
});

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/resources', require('./routes/resourceRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/tickets', require('./routes/ticketRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/chatbot', require('./routes/chatbotRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));
app.use('/api/saved-responses', require('./routes/savedResponseRoutes'));
app.use('/api/announcements', require('./routes/announcementRoutes'));
app.use('/api/audit', require('./routes/auditRoutes'));
app.use('/api/search', require('./routes/searchRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`ResolveHub API listening on port ${PORT}`));
