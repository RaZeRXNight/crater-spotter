export default function pinRouter(Router, PinsModel) {
  // pin DB API
  // Routes
  Router.get("/pin/", (req, res) => {
    res.json({
      message: "Hello List of pins",
    });
  });

  Router.get("/pin/:id", async (req, res) => {
    const id = req.params.id;
    try {
      const data = await PinsModel.findByPk(id);

      res.json({
        error: false,
        message: data,
      });
    } catch (error) {
      res.json({
        error: true,
        message: `ERROR: Couldn't retrieve Pin #${id}`,
      });
    }
  });

  Router.post("/pin", async (req, res) => {
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
      const pin = await PinsModel.create({
        title: title,
        comment: comment,
        lat: lat,
        lng: lng,
      });
      const id = pin.id;

      // Message back to Poster
      res.json({
        message: `SUCCESS! ${title} #${id} posted successfully!`,
        error: false,
        id: id,
      });
    } catch (error) {
      res.json({
        error: true,
        message: `ERROR: ${error.message}`,
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
