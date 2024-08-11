import express, { NextFunction, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import { IRoom } from '../models/room';import * as roomService from '../services/roomService';

const router = express.Router();



router.get('/availability', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { checkInDate, checkOutDate, capacity } = req.query;

    if (!checkInDate || !checkOutDate) {
      return res.status(400).json({ message: 'Check-in and check-out dates are required' });
    }

    const checkIn = new Date(checkInDate as string);
    const checkOut = new Date(checkOutDate as string);

    if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
      return res.status(400).json({ message: 'Invalid date format' });
    }

    const availableRooms = await roomService.getAvailableRooms(
      checkIn,
      checkOut,
      capacity ? parseInt(capacity as string) : undefined
    );

    res.json(availableRooms);
  } catch (error) {
    next(error);
  }
});

// Get all rooms
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const rooms = await roomService.getRooms(req);
    res.json(rooms);
  } catch (error) {
    next(error);
  }
});


// Get a specific room
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const room = await roomService.getRoomById(req.params.id);
    if (room) {
      res.json(room);
    } else {
      res.status(404).json({ message: 'Room not found' });
    }
  } catch (error) {
    next(error);
  }
});


// Create a new room (protected route)
router.post('/', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const newRoom: Omit<IRoom, 'id'> = req.body;
    const createdRoom = await roomService.createRoom(newRoom);
    res.status(201).json({
      message: 'Room created successfully',
      room: createdRoom
    });
  } catch (error) {
    next(error);
  }
});

// Update a room (protected route)
router.put('/:id', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const updatedRoom = await roomService.updateRoom(req.params.id, req.body);
    if (!updatedRoom) {
      return res.status(404).json({ message: 'Room not found' });
    }
    res.json({ message: 'Room updated successfully', data: updatedRoom });
  } catch (error) {
    next(error);
  }
});

// Delete a room (protected route)
router.delete('/:id', authenticateToken, async (req: Request, res: Response) => {
  const deleted = await roomService.deleteRoom(req.params.id);
  if (deleted) {
    res.status(204).send();
  } else {
    res.status(404).json({ message: 'Room not found' });
  }
});

router.get('/:id/availability', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { checkInDate, checkOutDate } = req.query;

    if (!checkInDate || !checkOutDate) {
      return res.status(400).json({ message: 'Check-in and check-out dates are required' });
    }

    const checkIn = new Date(checkInDate as string);
    const checkOut = new Date(checkOutDate as string);

    if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
      return res.status(400).json({ message: 'Invalid date format' });
    }

    const isAvailable = await roomService.checkRoomAvailability(id, checkIn, checkOut);

    res.json({ available: isAvailable });
  } catch (error) {
    next(error);
  }
});


export default router;



