// Run this script with: node scripts/seed-drivers.js
// Make sure to set your MONGODB_URI in .env.local first

const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

// ✅ Define the Driver schema
const driverSchema = new mongoose.Schema({
  name: String,
  email: String,
  contactNumber: String,
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
  },
  photo: String,
  licenceDetails: {
    licenceNumber: String,
    licenceType: String,
    issueDate: Date,
    expiryDate: Date,
    issuingAuthority: String,
  },
  salary: {
    amount: Number,
    currency: String,
    paymentFrequency: String,
  },
  status: String, // active | inactive | on-leave
  experience: Number,
  joiningDate: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// ✅ Prevent OverwriteModelError if script runs multiple times
const Driver = mongoose.models.Driver || mongoose.model('Driver', driverSchema);

// ✅ Sample Drivers
const sampleDrivers = [
  {
    name: 'Rajesh Kumar',
    email: 'rajesh.kumar@wheelify.com',
    contactNumber: '9876543210',
    address: {
      street: '123 MG Road',
      city: 'Mumbai',
      state: 'Maharashtra',
      zipCode: '400001',
      country: 'India',
    },
    photo: 'https://i.pravatar.cc/150?img=12',
    licenceDetails: {
      licenceNumber: 'MH01-20230001',
      licenceType: 'Commercial',
      issueDate: new Date('2020-01-15'),
      expiryDate: new Date('2030-01-15'),
      issuingAuthority: 'RTO Mumbai',
    },
    salary: { amount: 35000, currency: 'INR', paymentFrequency: 'monthly' },
    status: 'active',
    experience: 8,
    joiningDate: new Date('2022-03-15'),
  },
  {
    name: 'Amit Sharma',
    email: 'amit.sharma@wheelify.com',
    contactNumber: '9876543211',
    address: {
      street: '456 Nehru Place',
      city: 'Delhi',
      state: 'Delhi',
      zipCode: '110019',
      country: 'India',
    },
    photo: 'https://i.pravatar.cc/150?img=13',
    licenceDetails: {
      licenceNumber: 'DL02-20220015',
      licenceType: 'Light Motor Vehicle',
      issueDate: new Date('2018-05-20'),
      expiryDate: new Date('2028-05-20'),
      issuingAuthority: 'RTO Delhi',
    },
    salary: { amount: 30000, currency: 'INR', paymentFrequency: 'monthly' },
    status: 'active',
    experience: 6,
    joiningDate: new Date('2023-01-10'),
  },
  {
    name: 'Suresh Patel',
    email: 'suresh.patel@wheelify.com',
    contactNumber: '9876543212',
    address: {
      street: '789 SG Highway',
      city: 'Ahmedabad',
      state: 'Gujarat',
      zipCode: '380015',
      country: 'India',
    },
    photo: 'https://i.pravatar.cc/150?img=14',
    licenceDetails: {
      licenceNumber: 'GJ01-20210030',
      licenceType: 'Commercial',
      issueDate: new Date('2019-03-10'),
      expiryDate: new Date('2029-03-10'),
      issuingAuthority: 'RTO Ahmedabad',
    },
    salary: { amount: 32000, currency: 'INR', paymentFrequency: 'monthly' },
    status: 'active',
    experience: 7,
    joiningDate: new Date('2022-08-20'),
  },
  // ...add more sample drivers as needed
];

// ✅ Seed Function
async function seedDrivers() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('❌ MONGODB_URI is not defined in .env.local');
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    await Driver.deleteMany({});
    console.log('🗑️  Cleared existing drivers');

    await Driver.insertMany(sampleDrivers);
    console.log(`🚗 Inserted ${sampleDrivers.length} sample drivers`);

    console.log('✅ Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding drivers:', error);
    process.exit(1);
  }
}

seedDrivers();
