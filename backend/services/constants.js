export const ACCESS_TOKEN_EXPIRY = "15m";
export const REFRESH_TOKEN_EXPIRY = "7d";
export const JWT_ALGORITHM = "HS256";
export const BCRYPT_SALT_ROUNDS = 12;
export const BASIC_AUTH_LEVEL = 1;
export const ADMIN_AUTH_LEVEL = 2;
export const SUSPENDED_AUTH_LEVEL = 0;
export const DEFAULT_USER_AUTH_LEVEL = BASIC_AUTH_LEVEL;
export const DEFAULT_PORT = 8000;
export const DEFAULT_ADMIN_DELAY_MS = 1000;
export const MAX_PAGE = 100;
export const MAX_PER_PAGE = 10;
export const DEFAULT_PAGE = 1;
export const DEFAULT_PER_PAGE = MAX_PER_PAGE;
export const SORT_ASC = "ASC";
export const SORT_DESC = "DESC";
export const DEFAULT_SORT_ORDER = SORT_DESC;
export const TEXT_LIMIT = 30;
export const MIN_TEXT_LENGTH = 3;
export const MIN_PASSWORD_LENGTH = 8;
export const MAX_TEXT_LENGTH = 52;
export const SESSION_COOKIE_MAX_AGE_MS = 60000 * 100 * 24;
export const UPLOAD_FIELD_SIZE = 8 * 1024 * 1024;
export const ALLOWED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/avif",
];

export function sessionSecrets(sessionSecret, sessionStore) {
  return {
    secret: [sessionSecret],
    store: sessionStore,
    resave: false,
    saveUninitialized: true,
    cookie: function (req) {
      return {
        path: "/",
        secure: req.secure || false,
        httpOnly: true,
        maxAge: SESSION_COOKIE_MAX_AGE_MS,
      };
    },
  };
}
