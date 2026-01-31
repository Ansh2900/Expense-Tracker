const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const authMiddleware = require('../middleware/authMiddleware');

// All routes here are protected
router.use(authMiddleware);

router.get('/', transactionController.getTransactions);
router.post('/', transactionController.addTransaction);
router.delete('/:id', transactionController.deleteTransaction);
router.get('/categories', transactionController.getCategories);
router.get('/summary', transactionController.getSummary);
router.get('/analytics', transactionController.getAnalytics);

module.exports = router;
