export const PinSchema = {
  authorid: { notEmpty: true },
  lat: { notEmpty: true },
  lng: { notEmpty: true },
  title: {
    isLength: {
      options: { min: 3, max: 52 },
      errorMessage: "Password must be atleast 8 characters.",
    },
  },
  comment: { optional: true },
};