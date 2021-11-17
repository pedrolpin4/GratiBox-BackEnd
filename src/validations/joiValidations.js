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

export {
  signInValidation,
  signUpValidation,
};
