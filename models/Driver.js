import mongoose from 'mongoose';

const driverSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Driver name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  contactNumber: {
    type: String,
    required: [true, 'Contact number is required'],
    validate: {
      validator: function(v) {
        return /^[0-9]{10}$/.test(v);
      },
      message: 'Please enter a valid 10-digit phone number'
    }
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  photo: {
    type: String, // URL or path to uploaded photo
    default: '/images/default-driver.png'
  },
  licenceDetails: {
    licenceNumber: {
      type: String,
      required: [true, 'Licence number is required'],
      unique: true
    },
    licenceType: {
      type: String,
      enum: ['Light Motor Vehicle', 'Heavy Motor Vehicle', 'Commercial'],
      required: true
    },
    issueDate: {
      type: Date,
      required: true
    },
    expiryDate: {
      type: Date,
      required: true
    },
    issuingAuthority: String
  },
  salary: {
    amount: {
      type: Number,
      required: [true, 'Salary amount is required'],
      min: 0
    },
    currency: {
      type: String,
      default: 'INR'
    },
    paymentFrequency: {
      type: String,
      enum: ['monthly', 'weekly', 'daily'],
      default: 'monthly'
    }
  },
  assignedCar: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Car',
    default: null
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'on-leave'],
    default: 'active'
  },
  experience: {
    type: Number, // years of experience
    min: 0
  },
  joiningDate: {
    type: Date,
    default: Date.now
  },
  documents: [{
    name: String,
    url: String,
    uploadDate: Date
  }]
}, {
  timestamps: true
});

// Index for faster queries
driverSchema.index({ status: 1, assignedCar: 1 });
driverSchema.index({ licenceDetails: { licenceNumber: 1 } });

// Virtual for checking if licence is valid
driverSchema.virtual('isLicenceValid').get(function() {
  return this.licenceDetails.expiryDate > new Date();
});

// Method to check availability
driverSchema.methods.isAvailable = function() {
  return this.status === 'active' && !this.assignedCar;
};

const Driver = mongoose.models.Driver || mongoose.model('Driver', driverSchema);

export default Driver;