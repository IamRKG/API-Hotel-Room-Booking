import User, { IUser } from '../models/user';
import { hashPassword } from './authService';

export const createUser = async (email: string, password: string, name: string): Promise<IUser> => {
  const hashedPassword = await hashPassword(password);
  const user = new User({ email, password: hashedPassword, name });
  return user.save();
};

export const getUserByEmail = async (email: string): Promise<IUser | null> => {
  return User.findOne({ email });
};

export const getUserById = async (id: string): Promise<IUser | null> => {
  return User.findById(id);
};