const express = require('express');
const router = express.Router();
const {
  createTicket,
  getTickets,
  getTicket,
  trackTicket,
  assignTicket,
  updateTicketStatus,
  addMessage,
  reopenTicket,
  submitRating,
  exportTicketsCsv,
} = require('../controllers/ticketController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.route('/').get(getTickets).post(authorize('client'), createTicket);
router.get('/export', authorize('admin'), exportTicketsCsv);
router.get('/track/:ticketNumber', trackTicket);
router.get('/:id', getTicket);
router.put('/:id/assign', authorize('admin'), assignTicket);
router.put('/:id/status', authorize('admin', 'agent'), updateTicketStatus);
router.put('/:id/reopen', authorize('client'), reopenTicket);
router.post('/:id/rating', authorize('client'), submitRating);
router.post('/:id/messages', addMessage);

module.exports = router;
