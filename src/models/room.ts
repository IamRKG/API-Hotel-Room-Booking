import mongoose, { Document, Schema } from 'mongoose';

export interface IRoom extends Document {
  number: string;
  type: string;
  capacity: number;
  price: number;
  amenities: string[];
  available: boolean;
}

const RoomSchema: Schema = new Schema({
  number: { type: String, required: true, unique: true },
  type: { type: String, required: true },
  capacity: { type: Number, required: true },
  price: { type: Number, required: true },
  amenities: [{ type: String }],
  available: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model<IRoom>('Room', RoomSchema);
