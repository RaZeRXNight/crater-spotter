import multer from "multer";
export const upload = multer({
  limits: { fieldSize: 1048576 * 8 },
  dest: process.env.STORAGE_PATH,
});
