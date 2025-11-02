// Run this script with: node scripts/seed.js
// Make sure to set your MONGODB_URI in .env.local first

const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

// ✅ Define the Car schema
const carSchema = new mongoose.Schema({
  name: String,
  brand: String,
  model: String,
  year: Number,
  pricePerDay: Number,
  category: String,
  transmission: String,
  fuelType: String,
  seats: Number,
  images: [String],
  features: [String],
  available: Boolean,
  location: String,
  description: String,
  rating: Number,
  reviews: Array,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// ✅ Prevent OverwriteModelError if script runs multiple times
const Car = mongoose.models.Car || mongoose.model('Car', carSchema);

// ✅ Sample cars
const sampleCars = [
  {
    name: 'Honda City',
    brand: 'Honda',
    model: 'City ZX',
    year: 2023,
    pricePerDay: 1500,
    category: 'sedan',
    transmission: 'manual',
    fuelType: 'petrol',
    seats: 5,
    images: ['https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800'],
    features: ['AC', 'Power Steering', 'ABS', 'Airbags', 'Music System'],
    available: true,
    location: 'Delhi',
    description: 'Comfortable sedan perfect for city drives and long trips.',
    rating: 4.5,
  },
  {
    name: 'Maruti Swift',
    brand: 'Maruti Suzuki',
    model: 'Swift VXI',
    year: 2023,
    pricePerDay: 1200,
    category: 'hatchback',
    transmission: 'manual',
    fuelType: 'petrol',
    seats: 5,
    images: ['https://5.imimg.com/data5/SELLER/Default/2023/5/305907149/MS/ER/YG/94284151/1f-500x500.jpg'],
    features: ['AC', 'Power Windows', 'Central Locking', 'Music System'],
    available: true,
    location: 'Delhi',
    description: 'Fuel-efficient hatchback ideal for city commuting.',
    rating: 4.3,
  },
  {
    name: 'Hyundai Creta',
    brand: 'Hyundai',
    model: 'Creta SX',
    year: 2023,
    pricePerDay: 2500,
    category: 'suv',
    transmission: 'automatic',
    fuelType: 'diesel',
    seats: 5,
    images: ['https://i.ytimg.com/vi/FjbPal_c0is/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLAV1u7pm95cAQJYXZgQh8F80KqIMQ'],
    features: ['AC', 'Sunroof', 'Leather Seats', 'Touchscreen', 'Cruise Control'],
    available: true,
    location: 'Mumbai',
    description: 'Spacious SUV with premium features and comfortable ride.',
    rating: 4.7,
  },
  {
    name: 'Toyota Fortuner',
    brand: 'Toyota',
    model: 'Fortuner 4x4',
    year: 2023,
    pricePerDay: 4000,
    category: 'suv',
    transmission: 'automatic',
    fuelType: 'diesel',
    seats: 7,
    images: ['https://www.cartoq.com/wp-content/uploads/2023/04/Modified-Toyota-Fortuner-Front.jpg'],
    features: ['4WD', 'Leather Seats', 'Sunroof', 'Premium Sound', '7 Seats'],
    available: true,
    location: 'Bangalore',
    description: 'Luxury SUV perfect for family trips and adventures.',
    rating: 4.8,
  },
  {
    name: 'BMW 3 Series',
    brand: 'BMW',
    model: '320d Sport',
    year: 2023,
    pricePerDay: 6000,
    category: 'luxury',
    transmission: 'automatic',
    fuelType: 'diesel',
    seats: 5,
    images: ['https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800'],
    features: ['Leather Interior', 'Panoramic Sunroof', 'Premium Audio', 'Navigation'],
    available: true,
    location: 'Delhi',
    description: 'Premium luxury sedan with exceptional performance.',
    rating: 4.9,
  },
  {
    name: 'Mahindra Thar',
    brand: 'Mahindra',
    model: 'Thar LX',
    year: 2023,
    pricePerDay: 3000,
    category: 'suv',
    transmission: 'manual',
    fuelType: 'diesel',
    seats: 4,
    images: ['https://www.team-bhp.com/sites/default/files/styles/check_extra_large_for_review/public/mahindratharroxximg.jpg'],
    features: ['4x4', 'Off-road Capable', 'Convertible Top', 'Adventure Ready'],
    available: true,
    location: 'Goa',
    description: 'Perfect for off-road adventures and beach trips.',
    rating: 4.6,
  },
  {
    name: 'Tesla Model 3',
    brand: 'Tesla',
    model: 'Model 3 Long Range',
    year: 2023,
    pricePerDay: 8000,
    category: 'luxury',
    transmission: 'automatic',
    fuelType: 'electric',
    seats: 5,
    images: ['https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800'],
    features: ['Autopilot', 'Electric', 'Premium Interior', 'Large Touchscreen'],
    available: true,
    location: 'Mumbai',
    description: 'Cutting-edge electric vehicle with autopilot features.',
    rating: 5.0,
  },
  {
    name: 'Kia Seltos',
    brand: 'Kia',
    model: 'Seltos GTX',
    year: 2023,
    pricePerDay: 2200,
    category: 'suv',
    transmission: 'automatic',
    fuelType: 'petrol',
    seats: 5,
    images: ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRIp3_QdRLH49Z3C6KWuxJNMrOz9Yn_s4EOJA&s'],
    features: ['Sunroof', 'Touchscreen', 'Ventilated Seats', 'Connected Car'],
    available: true,
    location: 'Pune',
    description: 'Modern SUV with advanced technology and comfort.',
    rating: 4.4,
  },
];

async function seedDatabase() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('❌ MONGODB_URI is not defined in .env.local');
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    await Car.deleteMany({});
    console.log('🗑️  Cleared existing cars');

    await Car.insertMany(sampleCars);
    console.log(`🚗 Inserted ${sampleCars.length} sample cars`);

    console.log('✅ Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
