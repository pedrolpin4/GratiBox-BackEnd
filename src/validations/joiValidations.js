import Joi from 'joi';

const signUpValidation = Joi.object({
  name: Joi.string().min(3).max(20).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(15).required(),
});

const signInValidation = Joi.object({
  email: Joi.string().email({ tlds: { allow: false } }).required(),
  password: Joi.string().min(6).max(15).required(),
});

const signatureValidation = Joi.object({
  day: Joi.number().required(),
  products: Joi.array().min(1).required(),
  streetNumber: Joi.string().required(),
  city: Joi.string().required(),
  district: Joi.number().required(),
  zipCode: Joi.string().required().min(8).max(8),
  fullName: Joi.string().required(),
  userId: Joi.number().required(),
});

export {
  signInValidation,
  signUpValidation,
  signatureValidation,
};
