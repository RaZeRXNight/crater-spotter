import { checkSchema } from "express-validator";
import { BasicAuth } from "../services/admin.js";

const CommentSchema = {
  authorid: { notEmpty: true },
  PinParent: { notEmpty: true },
  comment: { notEmpty: true },
};

export default function commentRouter(Router, CommentModel) {
  const UPPERLIMIT = 10;
  const TEXTLIMIT = 30;

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

    const userModel = CommentModel.sequelize.models.Users;

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

      if (!postid) {
        throw new Error("ERROR: NO PARENT PROVIDED FOR COMMENT");
      }

      // Query Additions
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

      async function mapRows(row) {
        const tempdata = { ...row.dataValues };
        const author = await userModel.findByPk(tempdata.authorid);

        if (!author) {
          return null;
        }

        const username = author.dataValues.username;
        tempdata.authorName = username;

        if (tempdata.comment.length > TEXTLIMIT) {
          tempdata.comment = tempdata.comment.slice(0, TEXTLIMIT) + "...";
        }

        return tempdata;
      }

      // Limits amount of characters
      const dataRows = await Promise.all(data.rows.map(mapRows));

      const dataToSend = {
        rows: dataRows,
        count: data.count,
      };

      res.json({ message: dataToSend });
    } catch (error) {
      console.error(error);
    }
  });

  Router.get("/comment/:id", async (req, res) => {
    const headers = req.headers;

    // Data Order & Filters
    const userid = headers.userid;
    const postid = headers.postid;
    const order = headers.order || "DESC";
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

      if (!postid) {
        throw new Error("ERROR: NO PARENT PROVIDED FOR COMMENT");
      }

      // Query Additions
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

      async function mapRows(row) {
        const tempdata = { ...row.dataValues };
        const author = await userModel.findByPk(tempdata.authorid);

        if (!author) {
          return null;
        }

        const username = author.dataValues.username;
        tempdata.authorName = username;

        if (tempdata.comment.length > TEXTLIMIT) {
          tempdata.comment = tempdata.comment.slice(0, TEXTLIMIT) + "...";
        }

        return tempdata;
      }

      // Limits amount of characters
      const dataRows = await Promise.all(data.rows.map(mapRows));

      const dataToSend = {
        rows: dataRows,
        count: data.count,
      };

      res.json({ message: dataToSend });
    } catch (error) {
      res.json({ error: true, message: error.message });
      console.error(error);
    }
  });

  Router.post(
    "/comment",
    checkSchema(CommentSchema, ["body"]),
    async (req, res) => {
      const headers = req.headers;
      const session = req.session;

      // post data
      const postid = headers.postid;
      const body = req.body;

      const pinsModel = CommentModel.sequelize.models.Pins;

      const reqComment = body.comment;
      const reqCommentParent = body.CommentParent;
      const reqPinParent = body.PinParent;
      const reqReplyLevel = body.replyLevel;

      try {
        const auth = await BasicAuth(CommentModel.sequelize, session);

        if (!auth) {
          throw new Error("ERROR: NOT AUTHORIZED");
        }

        // Validation
        if (!body.comment) {
          throw new Error("ERROR: NO COMMENT SUBMITTED");
        }

        const pinParent = await pinsModel.findByPk(reqPinParent);
        const commentParent = await CommentModel.findByPk(reqCommentParent);

        if (reqCommentParent && !commentParent) {
          throw new Error("ERROR: NO COMMENT PARENT FOUND");
        }

        if (!pinParent) {
          throw new Error("ERROR: POST NOT FOUND");
        }

        // Post Content
        const comment = await CommentModel.create({
          authorid: session.userid,
          PinParent: reqPinParent,
          CommentParent: reqCommentParent,
          replyLevel: reqReplyLevel,
          comment: reqComment,
        });

        // Response
        res.json({
          id: comment.id,
          comment: comment.comment,
        });
      } catch (error) {
        res.json({
          error: true,
          message: error.message,
        });
        console.log(error);
      }
    },
  );

  Router.put("/comment", (req, res) => {
    res.json({
      error: true,
      message: "ERROR: FEATURE NOT IMPLEMENTED",
    });
  });

  Router.delete("/comment/:id", async (req, res) => {
    const userModel = CommentModel.sequelize.models.Users;
    const id = req.params.id;
    const session = req.session;

    try {
      // Perform action to delete
      const query = await CommentModel.findOne({ where: { id: id } });
      const userQuery = await userModel.findByPk(session.userid);

      const auth = BasicAuth(CommentModel.sequelize, session);

      if (!auth) {
        throw new Error("ERROR: UNAUTHORIZED");
      }

      if (query.authorid != session.userid && userQuery.authLevel < 1) {
        throw new Error("ERROR: UNAUTHORIZED");
      }

      CommentModel.destroy({
        where: {
          id: id,
        },
      });

      res.json({
        message: `Comment #${id} was deleted.`,
      });
    } catch (error) {
      res.json({
        error: true,
        message: error.message,
      });
    }
  });

  return Router;
}
