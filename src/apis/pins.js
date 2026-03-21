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
    const body = req.body;
    const { title, comment, coordinates } = body;
    const { lat, lng } = coordinates;

    // Performing basic Checks
    try {
      if (title.length === 0) {
        throw new Error("A Title is Needed");
      } else if (lat === 0 && lng === 0) {
        throw new Error("Coordinates are Needed");
      }

      // Succeeds All Checks

      const insert = db.prepare(
        `INSERT INTO pins (title, comment, lat, lng) VALUES (?, ?, ?, ?)`,
      );
      insert.run(title, comment, lat, lng);

      const query = db.prepare("SELECT * FROM pins ORDER BY id DESC LIMIT 1");
      const id = query.all()[0].id;
      // sqlTagStore.get`INSERT INTO pins (title, comment, lat, lng) VALUES (${title}, ${comment}, ${lat}, ${lng})`;
      // Succeeds SQL Insert
      res.json({
        success: `SUCCESS! ${title} #${id} posted successfully!`,
        id: id,
      });
    } catch (error) {
      res.json({
        error: `ERROR: ${error.message}`,
      });
      console.log(error);
    }
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

  return Router;
}
