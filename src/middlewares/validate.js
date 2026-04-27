import { validationResult } from 'express-validator';

// Thin wrapper to avoid repeating error handling boilerplate
export const validate = (req, res, next) => {
  console.log('Validation Middleware Invoked');
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  return next();
};





