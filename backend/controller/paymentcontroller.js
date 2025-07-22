const Order = require('../models/Order');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// ✅ Manual UPI Order Submission
exports.saveOrder = async (req, res) => {
  try {
    const {
      filename,
      fileUrl,
      pageCount,
      totalPrice,
      deliveryAddress,
      receiverPhone,
      signature,
      manualPaymentTxnId
    } = req.body;

    const user = req.user;
    if (!user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    // 🔒 Field validation
    if (
      !filename ||
      !fileUrl ||
      !pageCount ||
      !totalPrice ||
      !deliveryAddress ||
      !receiverPhone ||
      !signature ||
      !manualPaymentTxnId ||
      !req.file
    ) {
      return res.status(400).json({ success: false, message: "All fields and payment proof are required." });
    }

    // 🔄 Check if order already exists with same Txn ID
    const existing = await Order.findOne({ manualPaymentTxnId });
    if (existing) {
      return res.status(409).json({ success: false, message: "Order with this transaction ID already exists." });
    }

    // 📁 Handle payment proof upload
    const proofImagePath = `/uploads/payment/${uuidv4()}_${req.file.originalname}`;
    const absolutePath = path.join(__dirname, '../../public', proofImagePath);
    fs.writeFileSync(absolutePath, req.file.buffer);

    // 💾 Save Order
    const newOrder = new Order({
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        phone: user.phone
      },
      filename,
      fileUrl,
      pageCount,
      totalPrice,
      deliveryAddress,
      receiverPhone,
      signature,
      manualPaymentTxnId,
      paymentProofImage: proofImagePath,
      status: "Pending Verification",
      statusTimestamp: new Date()
    });

    await newOrder.save();
    return res.status(201).json({ success: true, order: newOrder });
  } catch (err) {
    console.error("❌ Order Save Error:", err);
    res.status(500).json({ success: false, message: "Server error saving order" });
  }
};

// 🔍 Get All Orders for Current User
exports.getOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const orders = await Order.find({ "user.id": userId }).sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (err) {
    console.error("❌ Get Orders Error:", err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// 🔍 Admin: Get All Orders
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({}).sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (err) {
    console.error("❌ Admin Order Fetch Error:", err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// 🛠️ Admin: Update Order Status
exports.updateOrderStatus = async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;

  try {
    const order = await Order.findByIdAndUpdate(
      orderId,
      { status, statusTimestamp: new Date() },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    res.json({ success: true, order });
  } catch (err) {
    console.error("❌ Update Order Error:", err);
    res.status(500).json({ success: false, message: "Failed to update order status" });
  }
};
// 🛑 userside cancel 
exports.cancelOrder = async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;

  try {
    const order = await Order.findOne({ _id: id, "user.id": req.user.id });

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    const nonCancellableStatuses = ["Processing", "Out for Delivery", "Delivered", "Cancelled"];
    if (nonCancellableStatuses.includes(order.status)) {
      return res.status(400).json({ success: false, message: `Cannot cancel order in '${order.status}' status.` });
    }

    order.status = "Cancelled";
    order.statusTimestamp = new Date();
    order.cancelReason = reason;
    order.cancelledBy = "user";
    await order.save();

    // TODO: Notify admin (via email, socket, dashboard flag)

    res.json({ success: true, message: "Order cancelled", order });
  } catch (err) {
    console.error("❌ Cancel Order Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// 🛑admin side cancel
exports.adminCancelOrder = async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;

  try {
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (order.status === "Delivered" || order.status === "Cancelled") {
      return res.status(400).json({ success: false, message: "Cannot cancel this order." });
    }

    order.status = "Cancelled";
    order.statusTimestamp = new Date();
    order.cancelReason = reason;
    order.cancelledBy = "admin";
    await order.save();

    res.json({ success: true, message: "Order cancelled by admin", order });
  } catch (err) {
    console.error("❌ Admin Cancel Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
