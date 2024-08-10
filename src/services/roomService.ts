import Room, { IRoom } from '../models/room';
import Booking from '../models/booking';

export const getRooms = async (): Promise<IRoom[]> => {
  return Room.find();
};

export const getRoomById = async (id: string): Promise<IRoom | null> => {
  try {
    const room = await Room.findById(id).exec();
    return room;
  } catch (error) {
    console.error('Error fetching room:', error);
    throw error;
  }
};


export const createRoom = async (roomData: Omit<IRoom, '_id'>): Promise<IRoom> => {
  const room = new Room(roomData);
  return room.save();
};

export const updateRoom = async (id: string, roomUpdate: Partial<IRoom>): Promise<IRoom | null> => {
  return Room.findByIdAndUpdate(id, roomUpdate, { new: true });
};

export const deleteRoom = async (id: string): Promise<boolean> => {
  const result = await Room.deleteOne({ _id: id });
  return result.deletedCount === 1;
};

export const checkRoomAvailability = async (
  roomId: string,
  checkInDate: Date,
  checkOutDate: Date
): Promise<boolean> => {
  const room = await Room.findById(roomId);
  if (!room || !room.available) {
    return false;
  }

  const conflictingBooking = await Booking.findOne({
    roomId,
    $or: [
      { checkInDate: { $lt: checkOutDate }, checkOutDate: { $gt: checkInDate } },
      { checkInDate: { $gte: checkInDate, $lt: checkOutDate } },
      { checkOutDate: { $gt: checkInDate, $lte: checkOutDate } }
    ]
  });

  return !conflictingBooking;
};


export const getAvailableRooms = async (
  checkInDate: Date,
  checkOutDate: Date,
  capacity?: number
): Promise<IRoom[]> => {
  try {
    const rooms = await Room.find({ available: true, ...(capacity && { capacity: { $gte: capacity } }) });
    const availableRooms = [];

    for (const room of rooms) {
      const isAvailable = await checkRoomAvailability(room.id.toString(), checkInDate, checkOutDate);
      if (isAvailable) {
        availableRooms.push(room);
      }
    }

    return availableRooms;
  } catch (error) {
    console.error('Error in getAvailableRooms:', error);
    throw error;
  }
};

