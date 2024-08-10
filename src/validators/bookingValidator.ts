import Joi from 'joi';

export const createBookingSchema = Joi.object({
  roomId: Joi.string().required(),
  checkInDate: Joi.date().iso().required(),
  checkOutDate: Joi.date().iso().greater(Joi.ref('checkInDate')).required(),
  totalPrice: Joi.number().min(0).required()
}).unknown(false);

export const updateBookingSchema = Joi.object({
  status: Joi.string().valid('confirmed', 'cancelled', 'completed')
});