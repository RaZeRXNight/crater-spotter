export default function pinRouter(Router, PinsModel, UsersModel) {
  const LOWERLIMIT = 3;
  const UPPERLIMIT = 10;
  const TEXTLIMIT = 30;
  // pin DB API
  // Routes
  Router.get("/pin/", async (req, res) => {
    const session = req.session;
    const headers = req.headers;
    const order = headers.order || "DESC";
    const perPage = headers.perpage;
    const currentPage = headers.page;

    const endIndex = perPage * currentPage;
    const startIndex = endIndex - perPage;

    try {
      if (headers.accept != "application/json") {
        throw new Error("ERROR: INCORRECT FORMAT WANTED");
      }
      if (order && order != "ASC" && order != "DESC") {
        throw new ERROR("ERROR: INCORRECT ORDER ENTERED");
      }
      if (perPage > UPPERLIMIT) {
        throw new Error("ERROR: INCORRECT PERPAGE WANTED");
      }

      let data;

      console.log(headers.authorization);
      if (headers.authorization && headers.authorization == "User") {
        data = await PinsModel.findAndCountAll({
          where: {
            authorid: session.userid,
          },
          order: [["createdAt", order]],
          offset: startIndex,
          limit: perPage,
        });
      } else {
        data = await PinsModel.findAndCountAll({
          order: [["createdAt", order]],
          offset: startIndex,
          limit: perPage,
        });
      }

      const dataRows = data.rows.map((row) => {
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
      console.log(error);
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

  // Creates a new pin based on the submitted
  // Body Containing: title, authorid, comment, cooordinates and Image.
  Router.post("/pin", async (req, res) => {
    const session = req.session;
    const body = req.body;
    const { title, image, authorid, comment, coordinates } = body;
    const { lat, lng } = coordinates;

    try {
      // Performing basic Checks
      if (title.length === 0) {
        throw new Error("A Title is Needed");
      } else if (lat === 0 && lng === 0) {
        throw new Error("Coordinates are Needed");
      }

      if (!authorid) {
        throw new Error("An Account is needed");
      }

      if (authorid != session.userid) {
        throw new Error("User ID not Valid");
      }

      // if (!image) {
      //   throw new Error("An image is needed");
      // }

      // Succeeds All Checks
      const pin = await PinsModel.create({
        title: title,
        authorid: authorid,
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

  Router.put("/pin/:id/", async (req, res) => {
    const id = req.params.id;
    const session = req.session;

    try {
      const query = await PinsModel.findOne({ where: { id: id } });
      const oldData = query.dataValues;
      const newData = req.body;

      if (session.userid != query.authorid) {
        throw new Error("ERROR: UNAUTHORIZED");
      }

      await PinsModel.update(
        {
          comment: newData.comment,
        },
        {
          where: {
            id: id,
          },
        },
      );

      res.json({
        message: `SUCCESS: ID ${id} ${oldData.title} updated!`,
      });
    } catch (error) {
      res.json({
        error,
        message: `ERROR: ID ${id} ${oldData.title} failed to update!`,
      });
    }
  });

  Router.delete("/pin/:id", async (req, res) => {
    const id = req.params.id;
    const session = req.session;

    try {
      // Perform action to delete
      const query = await PinsModel.findOne({ where: { id: id } });

      if (query.authorid != session.userid) {
        throw new Error("ERROR: UNAUTHORIZED");
      }

      PinsModel.destroy({
        where: {
          id: id,
        },
      });

      res.json({
        message: `${id} was deleted.`,
      });
    } catch (error) {
      res.json({
        error,
        message: "Delete pin",
      });
    }
  });

  return Router;
}
