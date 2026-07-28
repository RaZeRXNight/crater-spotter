export const LoginSchema = {
  email: { isEmail: true },
  password: { isLength: { options: { min: 8, max: 52 } } },
};

export const RegisterSchema = {
  email: { isEmail: true },
  username: { isLength: { min: 3, max: 52 } },
  password: { isLength: { options: { min: 8, max: 52 } } },
};