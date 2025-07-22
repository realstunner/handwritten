const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentcontroller');
const { authenticate, isAdmin } = require('../middlewares/authmiddlewares');
const multer = require('multer');

// Multer config: store screenshot in memory
const storage = multer.memoryStorage();
const upload = multer({ storage });

// ✅ User submits manual UPI order
router.post(
  '/success',
  authenticate,
  upload.single("paymentProofImage"),
  paymentController.saveOrder
);

// ✅ User fetches their own orders
router.get(
  '/orders',
  authenticate,
  paymentController.getOrders
);

// ✅ Admin: fetch all orders
router.get(
  '/admin/orders',
  authenticate,
  isAdmin,
  paymentController.getAllOrders
);

// ✅ Admin: update order status
router.put(
  '/admin/orders/:id',
  authenticate,
  isAdmin,
  paymentController.updateOrderStatus
);

// ✅ User cancels order
router.put(
  '/cancel/:id',
  authenticate,
  paymentController.cancelOrder
);

// ✅ Admin cancels order
router.put(
  '/admin/cancel/:id',
  authenticate,
  isAdmin,
  paymentController.adminCancelOrder
);

module.exports = router;
