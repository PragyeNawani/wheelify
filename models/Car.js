import mongoose from 'mongoose';

const CarSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  brand: {
    type: String,
    required: true,
  },
  model: {
    type: String,
    required: true,
  },
  year: {
    type: Number,
    required: true,
  },
  pricePerDay: {
    type: Number,
    required: true,
  },
  category: {
    type: String,
    enum: ['sedan', 'suv', 'hatchback', 'luxury', 'sports'],
    required: true,
  },
  transmission: {
    type: String,
    enum: ['manual', 'automatic'],
    required: true,
  },
  fuelType: {
    type: String,
    enum: ['petrol', 'diesel', 'electric', 'hybrid'],
    required: true,
  },
  seats: {
    type: Number,
    required: true,
  },
  images: [{
    type: String,
  }],
  features: [{
    type: String,
  }],
  available: {
    type: Boolean,
    default: true,
  },
  location: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  rating: {
    type: Number,
    default: 0,
  },
  reviews: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    rating: Number,
    comment: String,
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Car || mongoose.model('Car', CarSchema);