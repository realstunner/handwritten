const orderSchema = new mongoose.Schema({
  user: {
    id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    email: { type: String, required: true },
    username: { type: String, required: true },
    phone: { type: String, required: true }
  },
  filename: { type: String, required: true },
  pageCount: { type: Number, required: true },
  totalPrice: { type: Number, required: true },
  deliveryAddress: { type: String, required: true },
  receiverPhone: { type: String, required: true },
  signature: { type: String, required: true },
  fileUrl: { type: String, required: true },

  manualPaymentTxnId: { type: String },
  paymentProofImage: { type: String },

  status: {
    type: String,
    enum: [
      'Pending',
      'Order Confirmed',
      'Processing',
      'Out for Delivery',
      'Delivered',
      'Cancelled'
    ],
    default: 'Pending'
  },

  statusTimestamp: { type: Date, default: Date.now },
  cancellationReason: { type: String },
  cancelledBy: { type: String, enum: ['user', 'admin'] },
}, {
  timestamps: true
});

orderSchema.index({ "user.id": 1 });
orderSchema.index({ status: 1 });

module.exports = mongoose.model('Order', orderSchema);
