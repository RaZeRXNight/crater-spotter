import path from "path";
import process from "process";
import { constants, existsSync, unlink } from "fs";
import multer from "multer";
import { checkSchema } from "express-validator";
import authMiddleware from "../middleware/authentication.js";
import { requireAuth } from "../middleware/authorization.js";
import { PinSchema } from "../schema/pin.js";
import { validatePagination } from "../services/validation.js";
import {
  ALLOWED_IMAGE_MIME_TYPES,
  BASIC_AUTH_LEVEL,
  DEFAULT_SORT_ORDER,
  SORT_ASC,
  SORT_DESC,
  TEXT_LIMIT,
  UPLOAD_FIELD_SIZE,
} from "../services/constants.js";

const storageRelativePath = (process.env.STORAGE_PATH || "public/storage")
  .replace(/^\/+|\/+$/g, "");
const storagePath = path.resolve(process.cwd(), storageRelativePath);

export const upload = multer({
  limits: { fieldSize: UPLOAD_FIELD_SIZE },
  dest: storagePath,
});

export default function pinRouter(Router, PinsModel, usersModel) {
  const STORAGE_PATH = storagePath;
  const requireAuthMiddleware = requireAuth(usersModel);

  // pin DB API
  // Routes
  Router.get("/pin/", async (req, res) => {
    const sequelizeInstance = PinsModel.sequelize;
    const userModel = sequelizeInstance.models.Users;

    // Cookie Session & Headers
    const session = req.session;
    const headers = req.headers;
    const userid = headers.userid;
    const order = headers.order || DEFAULT_SORT_ORDER;

    try {
      // Validation
      if (headers.accept != "application/json") {
        throw new Error("ERROR: INCORRECT FORMAT WANTED");
      }
      if (order && order != SORT_ASC && order != SORT_DESC) {
        throw new Error("ERROR: INCORRECT ORDER ENTERED");
      }
      const pagination = validatePagination(headers);
      if (!pagination) {
        return res.status(400).json({
          error: true,
          message: "ERROR: INVALID PAGINATION",
        });
      }
      const { perPage, offset } = pagination;

      // Determines whether we send user specific data or general data.
      let data;
      if (headers.authorization && headers.authorization == "User") {
        data = await PinsModel.findAndCountAll({
          where: {
            authorid: session.userid,
          },
          order: [
            ["createdAt", order],
            ["id", order],
          ],
          offset,
          limit: perPage,
        });
      } else {
        data = await PinsModel.findAndCountAll({
          where: userid ? { authorid: userid } : null,
          order: [
            ["createdAt", order],
            ["id", order],
          ],
          offset,
          limit: perPage,
        });
      }

      if (!data) {
        throw new Error("ERROR: NO DATA FOUND");
      }

      // Limits amount of characters
      const dataRows = data.rows.map((row) => {
        const tempdata = { ...row.dataValues };

        if (tempdata.comment.length > TEXT_LIMIT) {
          tempdata.comment = tempdata.comment.slice(0, TEXT_LIMIT) + "...";
        }
        if (tempdata.title.length > TEXT_LIMIT) {
          tempdata.title = tempdata.title.slice(0, TEXT_LIMIT) + "...";
        }
        return tempdata;
      });

      res.json({
        message: "Pins retrieved",
        rows: dataRows,
        count: data.count,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: true, message: "Internal server error" });
    }
  });

  Router.get("/pin/:id", async (req, res) => {
    const id = req.params.id;

    try {
      // Models
      const userModel = PinsModel.sequelize.models.Users;

      // Variables
      const data = await PinsModel.findByPk(id);
      const authorid = data.dataValues.authorid;
      const author = await userModel.findByPk(authorid);

      const username = author ? author.dataValues.username : "Deleted User";

      // Response
      res.json({
        message: { ...data.dataValues, authorName: username },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        error: true,
        message: "Unable to retrieve pin",
      });
    }
  });

  // Creates a new pin based on the submitted
  // Body Containing: title, authorid, comment, cooordinates and Image.
  Router.post(
    "/pin",
    authMiddleware,
    requireAuthMiddleware,
    checkSchema(PinSchema, ["body"]),
    upload.single("image"),
    async (req, res) => {
      const body = req.body;
      const file = req.file;
      const { title, authorid, comment, lat, lng } = body;

      try {
        // Image Validation
        if (file && !ALLOWED_IMAGE_MIME_TYPES.includes(file.mimetype)) {
          unlink(file.path);
          throw new Error("Invalid file type");
        }

        if (title.length === 0) {
          // Performing basic Checks
          throw new Error("A Title is Needed");
        } else if (lat === 0 && lng === 0) {
          throw new Error("Coordinates are Needed");
        }

        if (!authorid) {
          throw new Error("An Account is needed");
        }

        if (authorid != req.user.userid) {
          throw new Error("User ID not Valid");
        }

        // if (!image) {
        //   throw new Error("An image is needed");
        // }

        // Succeeds All Checks
        const pin = await PinsModel.create({
          title: title,
          image: file ? file.filename : "",
          authorid: authorid,
          comment: comment,
          lat: lat,
          lng: lng,
        });
        const id = pin.id;

        // Message back to Poster
        res.json({
          message: "Pin created",
          error: false,
          id: id,
        });
      } catch (error) {
        res.json({
          error: true,
          message: "Unable to create pin",
        });
        console.error(error);
      }
    },
  );

  Router.put(
    "/pin/:id/",
    authMiddleware,
    requireAuthMiddleware,
    checkSchema(PinSchema, ["body"]),
    async (req, res) => {
      const userModel = PinsModel.sequelize.models.Users;
      const id = req.params.id;

      try {
        const query = await PinsModel.findOne({ where: { id: id } });
        const oldData = query.dataValues;
        const newData = req.body;

        if (
          req.user.userid != query.authorid &&
          req.user.authLevel < BASIC_AUTH_LEVEL
        ) {
          res.json({ error: true, message: "ERROR: UNAUTHORIZED" });
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
          message: "Pin updated",
        });
      } catch (error) {
        console.error(error);
        if (!res.headersSent) {
          res.status(500).json({
            error: true,
            message: "Unable to update pin",
          });
        }
      }
    },
  );

  Router.delete(
    "/pin/:id",
    authMiddleware,
    requireAuthMiddleware,
    async (req, res) => {
      const id = req.params.id;

      try {
        // Perform action to delete
        const query = await PinsModel.findOne({ where: { id: id } });

        if (
          query.authorid != req.user.userid &&
          req.user.authLevel < BASIC_AUTH_LEVEL
        ) {
          throw new Error("ERROR: UNAUTHORIZED");
        }

        const commentModel = PinsModel.sequelize.models.Comments;
        await PinsModel.sequelize.transaction(async (transaction) => {
          await commentModel.destroy({
            where: { PinParent: id },
            transaction,
          });

          const deletedPins = await PinsModel.destroy({
            where: { id },
            transaction,
          });

          if (!deletedPins) {
            throw new Error("ERROR: PIN DOES NOT EXIST");
          }
        });

        // Filesystem changes cannot be rolled back with the database transaction.
        const file_path = path.join(STORAGE_PATH, query.image);
        const file_status = existsSync(file_path, constants.F_OK);
        if (query.image && file_status) {
          unlink(file_path, (err) => {
            if (err) {
              console.error(`ERROR: Failed to delete file: ${err}`);
            }
          });
        }

        res.json({
          message: "Pin deleted",
        });
      } catch (error) {
        console.error(error);
        res.json({
          error: true,
          message: "Unable to delete pin",
        });
      }
    },
  );

  return Router;
}
