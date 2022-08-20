import { validationResult } from "express-validator";
import { codes, messages } from "../utils/responses";

const validateRequest = async (req, res, next) => {
  const validationErrors = validationResult(req);
  if (!validationErrors.isEmpty()) {
    return res.status(codes.BAD_REQUEST).json({
      message: messages.INVALID_REQUEST,
      errors: validationErrors.array(),
    });
  } else return next();
};

export { validateRequest };
