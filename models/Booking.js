import mongoose from 'mongoose';

const BookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  car: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Car',
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  totalDays: {
    type: Number,
    required: true,
  },
  totalPrice: {
    type: Number,
    required: true,
  },
  pickupLocation: {
    type: String,
    required: true,
  },
  dropoffLocation: {
    type: String,
    required: true,
  },
  // Insurance/Security Deposit Fields
  insuranceAmount: {
    type: Number,
    required: true,
    default: 0,
  },
  insuranceAccepted: {
    type: Boolean,
    required: true,
    default: false,
  },
  insuranceRefunded: {
    type: Boolean,
    default: false,
  },
  insuranceRefundDate: {
    type: Date,
    default: null,
  },
  insuranceRefundAmount: {
    type: Number,
    default: 0,
  },
  damageReported: {
    type: Boolean,
    default: false,
  },
  damageDescription: {
    type: String,
    default: '',
  },
  damageAmount: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'active', 'completed', 'cancelled'],
    default: 'pending',
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending',
  },
  razorpayOrderId: {
    type: String,
  },
  razorpayPaymentId: {
    type: String,
  },
  razorpaySignature: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update timestamp on save
BookingSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Booking = mongoose.models?.Booking || mongoose.model('Booking', BookingSchema);

export default Booking;