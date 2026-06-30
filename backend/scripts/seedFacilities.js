const mongoose = require('mongoose');
const Facility = require('../models/Facility');
const User = require('../models/User');
require('dotenv').config();

const DEMO_FACILITIES = [
  {
    name: 'Tampa Bay Tennis Center',
    address: '1234 Tennis Drive, Tampa, FL 33601',
    location: '1234 Tennis Drive, Tampa, FL 33601',
    city: 'Tampa',
    state: 'Florida',
    country: 'USA',
    description: 'Premier tennis facility in Tampa Bay area with 8 professional courts, including 4 clay and 4 hard courts. Perfect for players of all skill levels. Features night lighting, pro shop, and coaching services.',
    image: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800',
    images: [
      'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800',
      'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=800',
      'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=800',
    ],
    sports: ['Tennis'],
    pricePerHour: 45,
    rating: 4.7,
    amenities: ['Parking', 'Changing Rooms', 'Showers', 'Lights', 'Water', 'Equipment Rental', 'Pro Shop', 'Coaching'],
    openingHours: { open: '06:00', close: '22:00' },
    coordinates: { lat: 27.9506, lng: -82.4572 },
    isActive: true,
    isFeatured: true,
  },
  {
    name: 'Miami Heat Basketball Courts',
    address: '5678 Hoops Avenue, Miami, FL 33101',
    location: '5678 Hoops Avenue, Miami, FL 33101',
    city: 'Miami',
    state: 'Florida',
    country: 'USA',
    description: 'Indoor basketball facility with 4 full-size courts. Air-conditioned, professional-grade hardwood floors, and electronic scoreboards. Home to local leagues and tournaments.',
    image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800',
    images: [
      'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800',
      'https://images.unsplash.com/photo-1574623452334-1e0ac2b3ccb4?w=800',
      'https://images.unsplash.com/photo-1519861531473-9200262188bf?w=800',
    ],
    sports: ['Basketball'],
    pricePerHour: 60,
    rating: 4.8,
    amenities: ['Parking', 'Changing Rooms', 'Showers', 'Water', 'Equipment Rental', 'Spectator Area', 'Cafeteria', 'Wi-Fi'],
    openingHours: { open: '07:00', close: '23:00' },
    coordinates: { lat: 25.7617, lng: -80.1918 },
    isActive: true,
    isFeatured: true,
  },
  {
    name: 'Budapest Sports Arena',
    address: 'Dózsa György út 1, Budapest 1143',
    location: 'Dózsa György út 1, Budapest 1143',
    city: 'Budapest',
    state: 'Budapest',
    country: 'Hungary',
    description: 'Multi-sport facility in the heart of Budapest. Features indoor football pitches, basketball courts, and a swimming pool. Modern European sports complex with excellent facilities.',
    image: 'https://images.unsplash.com/photo-1577223625816-7546f13df25d?w=800',
    images: [
      'https://images.unsplash.com/photo-1577223625816-7546f13df25d?w=800',
      'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800',
      'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800',
    ],
    sports: ['Football', 'Basketball', 'Swimming', 'Badminton'],
    pricePerHour: 35,
    rating: 4.5,
    amenities: ['Parking', 'Changing Rooms', 'Showers', 'Lights', 'Water', 'Equipment Rental', 'Cafeteria', 'Wi-Fi', 'First Aid'],
    openingHours: { open: '06:00', close: '22:00' },
    coordinates: { lat: 47.4979, lng: 19.0402 },
    isActive: true,
    isFeatured: false,
  },
  {
    name: 'Delhi Cricket Ground',
    address: 'Feroz Shah Kotla, Bahadur Shah Zafar Marg, New Delhi 110002',
    location: 'Feroz Shah Kotla, Bahadur Shah Zafar Marg, New Delhi 110002',
    city: 'Delhi',
    state: 'Delhi',
    country: 'India',
    description: 'Historic cricket ground in the heart of Delhi. Full-size cricket pitch with practice nets, pavilion, and floodlights for day-night matches. Perfect for cricket enthusiasts and local tournaments.',
    image: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800',
    images: [
      'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800',
      'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800',
      'https://images.unsplash.com/photo-1624526267942-ab0ff8a3e972?w=800',
    ],
    sports: ['Cricket'],
    pricePerHour: 2500,
    rating: 4.6,
    amenities: ['Parking', 'Changing Rooms', 'Showers', 'Lights', 'Water', 'Equipment Rental', 'Spectator Area', 'Cafeteria', 'First Aid', 'Practice Nets'],
    openingHours: { open: '05:00', close: '21:00' },
    coordinates: { lat: 28.6377, lng: 77.2433 },
    isActive: true,
    isFeatured: true,
  },
  {
    name: 'Mumbai Football Turf',
    address: 'Andheri Sports Complex, Andheri West, Mumbai 400053',
    location: 'Andheri Sports Complex, Andheri West, Mumbai 400053',
    city: 'Mumbai',
    state: 'Maharashtra',
    country: 'India',
    description: 'Premium 5-a-side and 7-a-side football turf in Mumbai. FIFA-quality artificial grass, floodlights, and modern amenities. Popular venue for corporate leagues and weekend games.',
    image: 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=800',
    images: [
      'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=800',
      'https://images.unsplash.com/photo-1551958219-acbc608c6377?w=800',
      'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800',
    ],
    sports: ['Football'],
    pricePerHour: 1800,
    rating: 4.4,
    amenities: ['Parking', 'Changing Rooms', 'Showers', 'Lights', 'Water', 'Equipment Rental', 'Cafeteria'],
    openingHours: { open: '06:00', close: '23:00' },
    coordinates: { lat: 19.1136, lng: 72.8697 },
    isActive: true,
    isFeatured: false,
  },
];

async function seedFacilities() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/vunder-kids';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Find or create a system user to own demo facilities
    let systemUser = await User.findOne({ email: 'demo@fisiko.io' });
    if (!systemUser) {
      systemUser = await User.findOne({ role: 'admin' });
    }
    if (!systemUser) {
      // Use the first user in the database
      systemUser = await User.findOne({});
    }
    if (!systemUser) {
      // Create a demo user
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('demo123456', 10);
      systemUser = new User({
        name: 'Fisiko Demo',
        email: 'demo@fisiko.io',
        password: hashedPassword,
        userName: 'fisiko_demo',
        role: 'facility_owner',
        isVerified: true,
      });
      await systemUser.save();
      console.log('Created demo user: demo@fisiko.io');
    }
    console.log(`Using owner: ${systemUser.email || systemUser.userName}`);

    // Check if facilities already exist
    const existingCount = await Facility.countDocuments();
    console.log(`Existing facilities: ${existingCount}`);

    // Insert demo facilities
    for (const facilityData of DEMO_FACILITIES) {
      const existing = await Facility.findOne({ name: facilityData.name });
      if (existing) {
        console.log(`Facility "${facilityData.name}" already exists, skipping...`);
        continue;
      }

      const facility = new Facility({
        ...facilityData,
        owner: systemUser._id,
      });
      await facility.save();
      console.log(`Created facility: ${facilityData.name}`);
    }

    console.log('Seeding completed!');
    
    // Show final count
    const finalCount = await Facility.countDocuments();
    console.log(`Total facilities: ${finalCount}`);

    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
}

seedFacilities();
