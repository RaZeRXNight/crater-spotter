export default function pinRouter(Router, db) {
  // pin DB API
  // Routes
  Router.get("/pin/", (req, res) => {
    res.json({
      message: "Hello List of pins",
    });
  });

  Router.get("/pin/:id", (req, res) => {
    res.json({
      message: "Get pin Information by ID",
    });
  });

  Router.post("/pin", (req, res) => {
    res.json({
      message: "Put up information about pin",
    });
  });

  Router.put("/pin", (req, res) => {
    res.json({
      message: "Change pin information",
    });
  });

  Router.delete("/pin", (req, res) => {
    res.json({
      message: "Delete pin",
    });
  });

  console.log(db.isOpen);

  return Router;
}
