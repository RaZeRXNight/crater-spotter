export default function userRouter(Router, db) {
  // User DB API
  // Routes
  Router.get("/user/", (req, res) => {
    res.json({
      message: "Hello List of Users",
    });
  });

  Router.get("/user/:id", (req, res) => {
    res.json({
      message: "Get User Information by ID",
    });
  });

  Router.post("/user", (req, res) => {
    res.json({
      message: "Put up information about user",
    });
  });

  Router.put("/user", (req, res) => {
    res.json({
      message: "Change user information",
    });
  });

  Router.delete("/user", (req, res) => {
    res.json({
      message: "Delete User",
    });
  });

  return Router;
}
