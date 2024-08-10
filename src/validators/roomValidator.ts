import Joi from 'joi';

export const createRoomSchema = Joi.object({
  number: Joi.string().required(),
  type: Joi.string().required(),
  capacity: Joi.number().integer().min(1).required(),
  price: Joi.number().min(0).required(),
  amenities: Joi.array().items(Joi.string()),
  available: Joi.boolean()
});

export const updateRoomSchema = Joi.object({
  number: Joi.string(),
  type: Joi.string(),
  capacity: Joi.number().integer().min(1),
  price: Joi.number().min(0),
  amenities: Joi.array().items(Joi.string()),
  available: Joi.boolean()
});