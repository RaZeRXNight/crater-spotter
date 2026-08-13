import { checkSchema, validationResult } from "express-validator";
import { requireAuth } from "../middleware/authorization.js";
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

export default function commentRouter(Router, CommentModel, usersModel) {
  // comment DB API
  // Routes
  const requireAuthMiddleware = requireAuth(usersModel);
  // Malformed Request Middleware
  Router.use((error, req, res, next) => {
    if (
      error?.type === "entity.parse.failed" ||
      error?.status === 400 ||
      error instanceof SyntaxError
    ) {
      return res.status(400).json({
        error: true,
        message: "ERROR: INVALID REQUEST BODY",
      });
    }

    next(error);
  });

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
        order: [
          ["createdAt", order],
          ["id", order],
        ],
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

      // Fetch one comment by ID
      const data = await CommentModel.findByPk(req.params.id, {
        include: CommentInclude,
      });

      if (!data) {
        throw new Error("ERROR: NO DATA FOUND");
      }

      res.json({
        message: {
          row: mapRows(data),
        },
      });
    } catch (error) {
      res.json({ error: true, message: error.message });
      console.error(error);
    }
  });

  Router.post(
    "/comment",
    requireAuthMiddleware,
    (req, res, next) => {
      if (
        !req.body ||
        typeof req.body !== "object" ||
        Array.isArray(req.body)
      ) {
        req.body = {};
      }
      next();
    },
    checkSchema(CommentSchema, ["body"]),
    async (req, res) => {
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
          return res.status(400).json({
            error: true,
            message: validation
              .array()
              .map(({ msg }) => msg)
              .join(", "),
          });
        }

        // Validation
        if (!body.comment) {
          return res.status(400).json({
            error: true,
            message: "ERROR: NO COMMENT SUBMITTED",
          });
        }

        const pinParent = await pinsModel.findByPk(reqPinParent);
        const commentParent =
          reqCommentParent !== null && reqCommentParent !== undefined
            ? await CommentModel.findOne({
                where: {
                  id: reqCommentParent,
                  PinParent: reqPinParent,
                },
              })
            : null;

        if (
          reqCommentParent !== null &&
          reqCommentParent !== undefined &&
          !commentParent
        ) {
          return res.status(404).json({
            error: true,
            message: "ERROR: NO COMMENT PARENT FOUND",
          });
        }

        if (!pinParent) {
          return res.status(404).json({
            error: true,
            message: "ERROR: POST NOT FOUND",
          });
        }

        // Post Content
        const comment = await CommentModel.create({
          authorid: req.user.userid,
          PinParent: reqPinParent,
          CommentParent: reqCommentParent,
          replyLevel: reqReplyLevel ?? 0,
          comment: reqComment,
        });

        // Response
        return res.status(201).json({
          id: comment.id,
          comment: comment.comment,
          message: "Comment created",
        });
      } catch (error) {
        console.error(error);
        return res.status(500).json({
          error: true,
          message: "ERROR: INTERNAL SERVER ERROR",
        });
      }
    },
  );

  Router.put("/comment", (req, res) => {
    res.json({
      error: true,
      message: "ERROR: FEATURE NOT IMPLEMENTED",
    });
  });

  Router.delete("/comment/:id", requireAuthMiddleware, async (req, res) => {
    const id = req.params.id;

    try {
      // Perform action to delete
      const query = await CommentModel.findOne({ where: { id: id } });

      if (
        query.authorid != req.user.userid &&
        req.user.authLevel < BASIC_AUTH_LEVEL
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
