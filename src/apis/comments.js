export default function commentRouter(Router) {
  // comment DB API
  // Routes
  Router.get("/comment/", async (req, res) => {
    const headers = req.headers;

    // Data Order & Filters
    const userid = headers.userid;
    const postid = headers.postid;
    const order = headers.order || "DESC";

    // Pagination Variables
    const perPage = headers.perpage;
    const currentPage = headers.page;
    const endIndex = perPage * currentPage;
    const startIndex = endIndex - perPage;

    try {
      // Validation
      if (headers.accept != "application/json") {
        throw new Error("ERROR: INCORRECT FORMAT WANTED");
      }
      if (order && order != "ASC" && order != "DESC") {
        throw new ERROR("ERROR: INCORRECT ORDER ENTERED");
      }
      if (perPage > UPPERLIMIT) {
        throw new Error("ERROR: INCORRECT PERPAGE WANTED");
      }

      const query = {};
      userid ? (query.authorid = userid) : null;
      postid ? (query.PinParent = postid) : null;

      // Determines whether we send user specific data or general data.
      const data = await CommentModel.findAndCountAll({
        where: query,
        order: [["createdAt", order]],
        offset: startIndex,
        limit: perPage,
      });

      if (!data) {
        throw new ERROR("ERROR: NO DATA FOUND");
      }

      // Limits amount of characters
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
        rows: dataRows,
        count: data.count,
      });
    } catch (error) {
      console.error(error);
    }
  });

  Router.get("/comment/:id", (req, res) => {
    res.json({
      message: "Get comment Information by ID",
    });
  });

  Router.post("/comment", (req, res) => {
    const headers = req.headers;
    const postid = headers.postid;
    const body = req.body;

    try {
      // Validation
      if (!body.comment) {
        throw new Error("ERROR: NO COMMENT SUBMITTED");
      }

      // Post Content

      // Response
      res.json({
        id: 1,
        comment: "Put up information about comment",
      });
    } catch (error) {
      console.log(error);
    }
  });

  Router.put("/comment", (req, res) => {
    res.json({
      message: "Change comment information",
    });
  });

  Router.delete("/comment", (req, res) => {
    res.json({
      message: "Delete comment",
    });
  });

  return Router;
}
