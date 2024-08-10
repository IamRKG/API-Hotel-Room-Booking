import mongoose from 'mongoose';
import User from './models/user';
import Room from './models/room';
import Booking from './models/booking';
import { hashPassword } from './services/authService';
import connectDB from './config/database';

const seedData = async () => {
  await connectDB();

  // Clear existing data
  await User.deleteMany({});
  await Room.deleteMany({});
  await Booking.deleteMany({});

  // Seed users
  const hashedPassword = await hashPassword('password123');
  const users = await User.create([
    { email: 'user1@example.com', password: hashedPassword, name: 'User One' },
    { email: 'user2@example.com', password: hashedPassword, name: 'User Two' },
    { email: 'user3@example.com', password: hashedPassword, name: 'User Three' },
  ]);

  // Seed rooms
  const rooms = await Room.create([
    { number: '101', type: 'Single', capacity: 1, price: 100, amenities: ['WiFi', 'TV'], available: true },
    { number: '102', type: 'Double', capacity: 2, price: 150, amenities: ['WiFi', 'TV', 'Mini-bar'], available: true },
    { number: '103', type: 'Suite', capacity: 4, price: 250, amenities: ['WiFi', 'TV', 'Mini-bar', 'Jacuzzi'], available: true },
  ]);

  // Seed bookings
  await Booking.create([
    {
      userId: users[0]._id,
      roomId: rooms[0]._id,
      checkInDate: new Date('2023-06-01'),
      checkOutDate: new Date('2023-06-03'),
      totalPrice: 200,
      status: 'confirmed',
    },
    {
      userId: users[1]._id,
      roomId: rooms[1]._id,
      checkInDate: new Date('2023-06-05'),
      checkOutDate: new Date('2023-06-07'),
      totalPrice: 300,
      status: 'confirmed',
    },
    {
      userId: users[2]._id,
      roomId: rooms[2]._id,
      checkInDate: new Date('2023-06-10'),
      checkOutDate: new Date('2023-06-15'),
      totalPrice: 1250,
      status: 'confirmed',
    },
  ]);

  console.log('Data seeded successfully');
  mongoose.connection.close();
};

seedData();