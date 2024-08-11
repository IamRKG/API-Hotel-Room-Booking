import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();


//const MONGODB_URI = `mongodb+srv://user_admin:qwerty123456@hotel-room-booking.jh4uw.mongodb.net/?retryWrites=true&w=majority&appName=hotel-room-booking`

const MONGODB_URI = `mongodb+srv://user_admin:${encodeURIComponent('qwerty123456')}@hotel-room-booking.jh4uw.mongodb.net/hotel_booking?retryWrites=true&w=majority`;
//const MONGODB_URI = 'mongodb://mongodb:27017/hotel_booking'

const connectDB = async (): Promise<void> => {
  try {
    console.log('Connecting to MongoDB...', MONGODB_URI);
    const conn = await mongoose.connect(MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error}`);
    process.exit(1);
  }
};

export default connectDB;

