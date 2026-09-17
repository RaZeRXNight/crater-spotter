import { checkSchema, validationResult } from "express-validator";
import authMiddleware from "../middleware/authentication.js";
import { requireAuth } from "../middleware/authorization.js";
import { CommentSchema } from "../schema/comment.js";
import { validatePagination } from "../services/validation.js";
import {
  ADMIN_AUTH_LEVEL,
  DEFAULT_SORT_ORDER,
  SORT_ASC,
  SORT_DESC,
  TEXT_LIMIT,
} from "../services/constants.js";

function mapCommentRows(row) {
  const tempdata = { ...row.dataValues };

  if (tempdata.deletedAt) {
    tempdata.authorid = null;
    tempdata.authorName = null;
    tempdata.comment = null;
    tempdata.deleted = true;
  } else {
    tempdata.authorName = row.author?.username || "Deleted User";
    tempdata.deleted = false;
  }

  if (tempdata.comment?.length > TEXT_LIMIT) {
    tempdata.comment = tempdata.comment.slice(0, TEXT_LIMIT) + "...";
  }

  return tempdata;
}

function buildCommentTree(rows) {
  const nodes = new Map(
    rows.map((row) => [row.id, { ...mapCommentRows(row), replies: [] }]),
  );
  const roots = [];

  for (const row of rows) {
    const node = nodes.get(row.id);
    const parent = row.CommentParent ? nodes.get(row.CommentParent) : null;

    if (parent) {
      parent.replies.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
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
    const queryParams = req.query;

    // Data Order & Filters
    const userid = queryParams.userid;
    const postid = queryParams.postid;
    const order = queryParams.order || SORT_ASC;

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
      if (userid) {
        return res.status(422).json({
          error: true,
          message: "userid filtering is not supported for nested comments",
        });
      }

      const pagination = validatePagination({
        page: queryParams.page,
        perpage: queryParams.perPage ?? queryParams.perpage,
      });
      if (!pagination) {
        return res.status(400).json({
          error: true,
          message: "ERROR: INVALID PAGINATION",
        });
      }
      const { perPage, offset } = pagination;

      // Query Additions
      const query = {};
      postid ? (query.PinParent = postid) : null;

      // Determines whether we send user specific data or general data.
      const rows = await CommentModel.findAll({
        where: query,
        order: [
          ["createdAt", order],
          ["id", order],
        ],
        include: CommentInclude,
      });

      const roots = buildCommentTree(rows);
      const count = roots.length;
      const dataRows = roots.slice(offset, offset + perPage);

      const dataToSend = {
        rows: dataRows,
        count,
        page: pagination.currentPage,
        perPage,
        hasNext: offset + dataRows.length < count,
      };

      res.json({ message: dataToSend });
    } catch (error) {
      res.status(500).json({ error: true, message: "Internal server error" });
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

      const data = await CommentModel.findByPk(req.params.id, {
        include: CommentInclude,
      });

      if (!data) {
        throw new Error("ERROR: NO DATA FOUND");
      }

      const rows = await CommentModel.findAll({
        where: { PinParent: data.PinParent },
        order: [
          ["createdAt", DEFAULT_SORT_ORDER],
          ["id", DEFAULT_SORT_ORDER],
        ],
        include: CommentInclude,
      });
      const pending = [...buildCommentTree(rows)];
      let row;
      while (pending.length && !row) {
        const comment = pending.pop();
        if (comment.id === data.id) {
          row = comment;
        } else {
          pending.push(...comment.replies);
        }
      }

      res.json({ message: { row } });
    } catch (error) {
      res.status(500).json({ error: true, message: "Internal server error" });
      console.error(error);
    }
  });

  Router.post(
    "/comment",
    authMiddleware,
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
          replyLevel: commentParent ? commentParent.replyLevel + 1 : 0,
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

  Router.delete(
    "/comment/:id",
    authMiddleware,
    requireAuthMiddleware,
    async (req, res) => {
      const id = req.params.id;

      try {
        // Perform action to delete
        const query = await CommentModel.findOne({ where: { id: id } });

        if (!query) {
          return res.status(404).json({
            error: true,
            message: "Comment not found",
          });
        }

        const requester = await usersModel.findByPk(req.user.userid);
        const authLevel = req.user.authLevel ?? requester?.authLevel ?? 0;

        if (query.authorid != req.user.userid && authLevel < ADMIN_AUTH_LEVEL) {
          return res.status(403).json({
            error: true,
            message: "Unauthorized",
          });
        }

        await query.update({
          deletedAt: new Date(),
        });

        res.json({
          message: "Comment deleted",
        });
      } catch (error) {
        res.json({
          error: true,
          message: "Unable to delete comment",
        });
      }
    },
  );

  return Router;
}
