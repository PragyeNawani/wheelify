import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: function() {
      // Password is required only if user doesn't have a googleId
      return !this.googleId;
    },
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true, // Allows multiple null values
  },
  image: {
    type: String,
  },
  emailVerified: {
    type: Date,
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  phone: {
    type: String,
  },
  address: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const User = mongoose.models?.User || mongoose.model('User', UserSchema);

export default User;