import express, { NextFunction, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import * as bookingService from '../services/bookingService';
import { createBookingSchema } from '../validators/bookingValidator';
import { sendEmail } from '../services/emailService';
import user from '../models/user';
import room from '../models/room';


const router = express.Router();

const formatDate = (date:any) => {
  return new Date(date).toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};


// Get all bookings (admin only)
router.get('/', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const bookings = await bookingService.getBookings();
    res.json(bookings);
  } catch (error) {
    next(error);
  }
});

// Get a specific booking
router.get('/:id', authenticateToken, async (req: Request & { user?: { id: string } }, res: Response, next: NextFunction) => {
  try {
    if (req.user) {
      const booking = await bookingService.getBookingById(req.params.id, req.user.id);
      if (booking) {
        res.json(booking);
      } else {
        res.status(404).json({ message: 'Booking not found' });
      }
    } else {
      res.status(401).json({ message: 'Unauthorized' });
    }
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      res.status(403).json({ message: 'Unauthorized access to this booking' });
    } else {
      next(error);
    }
  }
});


// Create a new booking
router.post('/', authenticateToken, async (req: Request & { user?: { id: string } }, res: Response, next: NextFunction) => {
  try {
    const { roomId, checkInDate, checkOutDate, totalPrice } = req.body;
    await createBookingSchema.validateAsync({ roomId, checkInDate, checkOutDate, totalPrice });
    
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const bookingData = {
      userId: req.user.id,
      roomId,
      checkInDate,
      checkOutDate,
      totalPrice
    };

    const formattedCheckIn = formatDate(checkInDate);
const formattedCheckOut = formatDate(checkOutDate);
    
    const newBooking = await bookingService.createBooking(bookingData as any);

    const userDoc = await user.findById(req.user.id);
    const roomDoc = await room.findById(roomId);

    if (userDoc && roomDoc) {
      await sendEmail(userDoc.email, 'Booking Confirmation', `Your booking for Room ${roomDoc.number} from ${formattedCheckIn} to ${formattedCheckOut} has been confirmed.`);

    }

    const adminEmail = process.env.ADMIN_EMAIL || 'radhacreative@gmail.com';
    await sendEmail(adminEmail, 'New Booking Notification', `A new booking has been made:\n\nRoom: ${roomDoc?.number}\nUser: ${userDoc?.email}\nCheck-in: ${formattedCheckIn}\nCheck-out: ${formattedCheckOut}`);
    

    res.status(201).json(newBooking);
  } catch (error) {
    next(error);
  }
});





// Update a booking
router.put('/:id', authenticateToken, async (req: Request & { user?: { id: string } }, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const booking = await bookingService.getBookingById(req.params.id, req.user.id);
  if (booking && booking.userId.toString() === req.user.id) {
    const updatedBooking = await bookingService.updateBooking(req.params.id, req.body);
    if (updatedBooking) {
      res.json(updatedBooking);
    } else {
      res.status(404).json({ message: 'Booking not found' });
    }
  } else {
    res.status(404).json({ message: 'Booking not found or unauthorized' });
  }
});

// Delete a booking
router.delete('/:id', authenticateToken, async (req: Request & { user?: { id: string } }, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { id } = req.params;
    const booking = await bookingService.getBookingById(id, req.user.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this booking' });
    }

    await bookingService.deleteBooking(id);

    res.status(200).json({ message: 'Booking successfully deleted', deletedBookingId: id });
  } catch (error) {
    next(error);
  }
});

// Get bookings for the current user
router.get('/user/me', authenticateToken, async (req: Request & { user?: { id: string } }, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const userId = req.user.id;
    const userBookings = await bookingService.getBookingsByUserId(userId);
    
    if (userBookings.length === 0) {
      return res.json({ message: "No bookings found for this user", bookings: [] });
    }
    
    res.json({ bookings: userBookings });
  } catch (error) {
    next(error);
  }
});


export default router;