import express, { Express } from 'express';
import cors from 'cors';
import connectDB from './config/database';
import roomRoutes from './routes/roomRoutes';
import bookingRoutes from './routes/bookingRoutes';
import notificationRoutes from './routes/notificationRoutes';
import { authenticateToken } from './middleware/auth';
import { comparePasswords, generateToken, hashPassword } from './services/authService';
import User from './models/user';
import { errorHandler } from './middleware/errorHandler';

import dotenv from 'dotenv';
dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

// Enable CORS for all routes
app.use(cors());

app.use(express.json());
app.use('/api/rooms', roomRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/notifications',notificationRoutes)

connectDB();


app.post('/api/users/register', async (req: express.Request, res: express.Response) => {
  try {
    const { name, email, password } = req.body;
    const hashedPassword = await hashPassword(password);
    const user = new User({ name, email, password: hashedPassword });
    await user.save();

    const token = generateToken(user);

    res.status(201).json({
      token,
      name: user.name,
      id: user._id
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/users/login', async (req: express.Request, res: express.Response) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }
    const isPasswordValid = await comparePasswords(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }
    const token = generateToken(user);
    res.json({ token,name: user.name, id: user._id});
  } catch (error) {
    res.status(500).json({ message: 'Error logging in' });
  }
});

app.get('/protected', authenticateToken, (req: express.Request & { user?: any }, res: express.Response) => {
  res.json({ message: 'This is a protected route', user: req.user });
});
app.use(errorHandler);
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
