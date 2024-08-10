
import Booking, { IBooking } from '../models/booking';
import User from '../models/user';
import Room from '../models/room';


export const getBookings = async (): Promise<IBooking[]> => {
  return  await Booking.find().populate('userId', 'name email').populate('roomId', 'number type');
};

export const getBookingById = async (id: string, userId: string): Promise<IBooking | null> => {
  const booking = await Booking.findById(id).populate('roomId');
  if (!booking) {
    return null;
  }
  if (booking.userId.toString() !== userId) {
    throw new Error('Unauthorized');
  }
  return booking;
};


export const createBooking = async (bookingData: Omit<IBooking, '_id'>): Promise<IBooking> => {
  const { userId, roomId, ...rest } = bookingData;

  const user = await User.findById(userId);
  if (!user) {
    throw new Error(`User not found with id: ${userId}`);
  }

  const room = await Room.findById(roomId);
  if (!room) {
    throw new Error(`Room not found with id: ${roomId}`);
  }

  const booking = new Booking({
    ...rest,
    userId: user._id,
    roomId: room._id
  });

  const savedBooking = await booking.save();

  const populatedBooking = await Booking.findById(savedBooking._id)
    .populate('userId', 'name email')
    .populate('roomId', 'number type')
    .lean();

  return populatedBooking as IBooking;
};



export const updateBooking = async (id: string, bookingUpdate: Partial<IBooking>): Promise<IBooking | null> => {
  return await Booking.findByIdAndUpdate(id, bookingUpdate, { new: true }).populate('userId').populate('roomId');
};

export const deleteBooking = async (id: string): Promise<boolean> => {
  const result = await Booking.deleteOne({ _id: id });
  return result.deletedCount === 1;
};

export const getBookingsByUserId = async (userId: string): Promise<IBooking[]> => {
  return Booking.find({ userId }).populate('roomId');
};



export const getBookingsByRoomId = async (roomId: string): Promise<IBooking[]> => {
  return Booking.find({ roomId }).populate('userId');
};
