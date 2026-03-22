export default function pinRouter(Router, PinsModel) {
  const LOWERLIMIT = 3;
  const UPPERLIMIT = 10;
  const TEXTLIMIT = 30;
  // pin DB API
  // Routes
  Router.get("/pin/", async (req, res) => {
    const headers = req.headers;
    const order = headers.order || "DESC";
    const perPage = headers.perpage;
    const currentPage = headers.page;

    const endIndex = perPage * currentPage;
    const startIndex = endIndex - perPage;
    try {
      if (headers.authorization != "User") {
        throw new Error("ERROR: UNAUTHORIZED");
      }
      if (headers.accept != "application/json") {
        throw new Error("ERROR: INCORRECT FORMAT WANTED");
      }
      if (order && order != "ASC" && order != "DESC") {
        throw new ERROR("ERROR: INCORRECT ORDER ENTERED");
      }
      if (perPage > UPPERLIMIT) {
        throw new Error("ERROR: INCORRECT PERPAGE WANTED");
      }

      const data = await PinsModel.findAndCountAll({
        order: [["createdAt", order]],
        offset: startIndex,
        limit: perPage,
      });

      const dataRows = data.rows.map((row) => {
        console.log(row.dataValues);
        const tempdata = { ...row.dataValues };
        if (tempdata.comment.length > TEXTLIMIT) {
          tempdata.comment = tempdata.comment.slice(0, TEXTLIMIT) + "...";
        }
        if (tempdata.title.length > TEXTLIMIT) {
          tempdata.title = tempdata.title.slice(0, TEXTLIMIT) + "...";
        }
        return tempdata;
      });

      res.json({
        message: data,
        rows: dataRows,
        count: data.count,
      });
    } catch (error) {
      res.json({ error: true, message: error.message });
    }
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
