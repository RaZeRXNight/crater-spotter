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
        maxAge: 60000 * 100 * 24,
      };
    },
  };
}
