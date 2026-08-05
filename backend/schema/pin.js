import { MAX_TEXT_LENGTH, MIN_TEXT_LENGTH } from "../services/constants.js";

export const PinSchema = {
  authorid: { notEmpty: true },
  lat: { notEmpty: true },
  lng: { notEmpty: true },
  title: {
    isLength: {
      options: { min: MIN_TEXT_LENGTH, max: MAX_TEXT_LENGTH },
      errorMessage: "Password must be atleast 8 characters.",
    },
  },
  comment: { optional: true },
};
