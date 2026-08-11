import { MAX_TEXT_LENGTH, MIN_TEXT_LENGTH } from "../services/constants.js";

export const PinSchema = {
  authorid: { notEmpty: true },
  lat: { notEmpty: true },
  lng: { notEmpty: true },
  title: {
    isLength: {
      options: { min: MIN_TEXT_LENGTH, max: MAX_TEXT_LENGTH },
      errorMessage: `Title must be between ${MIN_TEXT_LENGTH} and ${MAX_TEXT_LENGTH} characters.`,
    },
  },
  comment: { optional: true },
};
