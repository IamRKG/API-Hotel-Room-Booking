import express, { Request, Response } from 'express';
import Notification from '../models/notification';
const router = express.Router();

router.post('/', async (req: Request, res: Response) => {
    try {
        const { userId, message, type } = req.body;
        const notification = new Notification({ userId, message, type });
        await notification.save();
        res.status(201).json(notification);
    } catch (error) {
        res.status(500).json({ message: 'Error sending notification' });
    }
});
router.get('/:userId', async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const notifications = await Notification.find({ userId });
        res.status(200).json(notifications);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching notifications' });
    }
});



export default router;