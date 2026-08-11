import {
  MAX_TEXT_LENGTH,
  MIN_PASSWORD_LENGTH,
  MIN_TEXT_LENGTH,
} from "../services/constants.js";

export const LoginSchema = {
  email: { isEmail: true },
  password: {
    isLength: { options: { min: MIN_PASSWORD_LENGTH, max: MAX_TEXT_LENGTH } },
  },
};

export const RegisterSchema = {
  email: { isEmail: true },
  username: { isLength: { min: MIN_TEXT_LENGTH, max: MAX_TEXT_LENGTH } },
  password: {
    isLength: { options: { min: MIN_PASSWORD_LENGTH, max: MAX_TEXT_LENGTH } },
  },
};
