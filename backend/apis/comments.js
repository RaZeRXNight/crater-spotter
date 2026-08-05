import { checkSchema, validationResult } from "express-validator";
import { BasicAuth } from "../services/admin.js";
import { CommentSchema } from "../schema/comment.js";
import { validatePagination } from "../services/validation.js";
import {
  BASIC_AUTH_LEVEL,
  DEFAULT_SORT_ORDER,
  SORT_ASC,
  SORT_DESC,
  TEXT_LIMIT,
} from "../services/constants.js";

function mapRows(row) {
  const tempdata = { ...row.dataValues };

  tempdata.authorName = row.author?.username || "Deleted User";

  if (tempdata.comment?.length > TEXT_LIMIT) {
    tempdata.comment = tempdata.comment.slice(0, TEXT_LIMIT) + "...";
  }

  return tempdata;
}

export default function commentRouter(Router, CommentModel) {
  // comment DB API
  // Routes
  const CommentInclude = [
    {
      model: CommentModel.sequelize.models.Users,
      as: "author",
      attributes: ["username"],
    },
  ];

  Router.get("/comment/", async (req, res) => {
    const headers = req.headers;

    // Data Order & Filters
    const userid = headers.userid;
    const postid = headers.postid;
    const order = headers.order || DEFAULT_SORT_ORDER;

    try {
      // Validation
      if (headers.accept != "application/json") {
        throw new Error("ERROR: INCORRECT FORMAT WANTED");
      }
      if (order && order != SORT_ASC && order != SORT_DESC) {
        throw new Error("ERROR: INCORRECT ORDER ENTERED");
      }
      if (!postid) {
        throw new Error("ERROR: NO PARENT PROVIDED FOR COMMENT");
      }

      const pagination = validatePagination(headers);
      if (!pagination) {
        return res.status(400).json({
          error: true,
          message: "ERROR: INVALID PAGINATION",
        });
      }
      const { perPage, offset } = pagination;

      // Query Additions
      const query = {};
      userid ? (query.authorid = userid) : null;
      postid ? (query.PinParent = postid) : null;

      // Determines whether we send user specific data or general data.
      const data = await CommentModel.findAndCountAll({
        where: query,
        order: [["createdAt", order], ["id", order]],
        offset,
        limit: perPage,
        include: CommentInclude,
      });

      if (!data) {
        throw new Error("ERROR: NO DATA FOUND");
      }

      // Limits amount of characters
      const dataRows = data.rows.map(mapRows);

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

  Router.get("/comment/:id", async (req, res) => {
    const headers = req.headers;

    try {
      // Validation
      if (headers.accept != "application/json") {
        throw new Error("ERROR: INCORRECT FORMAT WANTED");
      }

      // Fetch one comment without list pagination.
      const data = await CommentModel.findAndCountAll({
        where: { id: req.params.id },
        include: CommentInclude,
      });

      if (!data) {
        throw new Error("ERROR: NO DATA FOUND");
      }

      // Limits amount of characters
      const dataRows = data.rows.map(mapRows);

      res.json({
        message: {
          rows: dataRows,
          count: data.count,
        },
      });
    } catch (error) {
      res.json({ error: true, message: error.message });
      console.error(error);
    }
  });

  Router.post(
    "/comment",
    checkSchema(CommentSchema, ["body"]),
    async (req, res) => {
      const session = req.session;

      // post data
      const body = req.body;

      const pinsModel = CommentModel.sequelize.models.Pins;

      const reqComment = body.comment;
      const reqCommentParent = body.CommentParent;
      const reqPinParent = body.PinParent;
      const reqReplyLevel = body.replyLevel;

      try {
        const validation = validationResult(req);
        if (!validation.isEmpty()) {
          throw new Error(validation
            .array()
            .map(({ msg }) => msg)
            .join(", "));
        }

        const auth = await BasicAuth(CommentModel.sequelize, session);

        if (!auth) {
          throw new Error("ERROR: NOT AUTHORIZED");
        }

        // Validation
        if (!body.comment) {
          throw new Error("ERROR: NO COMMENT SUBMITTED");
        }

        const pinParent = await pinsModel.findByPk(reqPinParent);
        const commentParent = reqCommentParent
          ? await CommentModel.findOne({
              where: {
                id: reqCommentParent,
                PinParent: reqPinParent,
              },
            })
          : null;

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
          message: "Comment created",
        });
      } catch (error) {
        res.json({
          error: true,
          message: error.message,
        });
        console.error(error);
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

      const auth = await BasicAuth(CommentModel.sequelize, session);

      if (!auth) {
        throw new Error("ERROR: UNAUTHORIZED");
      }

      if (
        query.authorid != session.userid &&
        userQuery.authLevel < BASIC_AUTH_LEVEL
      ) {
        throw new Error("ERROR: UNAUTHORIZED");
      }

      await CommentModel.destroy({
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
