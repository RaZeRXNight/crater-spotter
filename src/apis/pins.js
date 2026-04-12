import path from "path";
import process from "process";
import { existsSync, unlink } from "fs";
import multer from "multer";
import { checkSchema } from "express-validator";
import { BasicAuth } from "../services/admin.js";

export const upload = multer({
  limits: { fieldSize: 1048576 * 8 },
  dest: process.env.STORAGE_PATH,
});

const PinSchema = {
  authorid: { notEmpty: true },
  lat: { notEmpty: true },
  lng: { notEmpty: true },
  title: {
    isLength: {
      options: { min: 3, max: 52 },
      errorMessage: "Password must be atleast 8 characters.",
    },
  },
  comment: { optional: true },
};

export default function pinRouter(Router, PinsModel) {
  const UPPERLIMIT = 10;
  const TEXTLIMIT = 30;
  const STORAGE_PATH = path.join(process.cwd(), process.env.STORAGE_PATH);
  const ALLOWED_MIME_TYPES = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/avif",
  ];

  // pin DB API
  // Routes
  Router.get("/pin/", async (req, res) => {
    const sequelizeInstance = PinsModel.sequelize;
    const userModel = sequelizeInstance.models.Users;

    // Cookie Session & Headers
    const session = req.session;
    const headers = req.headers;
    const userid = headers.userid;
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

      // Determines whether we send user specific data or general data.
      let data;
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
          where: userid ? { authorid: userid } : null,
          order: [["createdAt", order]],
          offset: startIndex,
          limit: perPage,
        });
      }

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

  Router.get("/pin/:id", async (req, res) => {
    const id = req.params.id;
    const header = req.headers;

    try {
      // Models
      const userModel = PinsModel.sequelize.models.Users;
      const CommentModel = PinsModel.sequelize.models.Comments;

      // Variables
      const data = await PinsModel.findByPk(id);
      const authorid = data.dataValues.authorid;
      const author = await userModel.findByPk(authorid);
      const username = author.dataValues.username;

      // Response
      res.json({
        message: { ...data.dataValues, authorName: username },
      });
    } catch (error) {
      console.error(error);
      res.status(500).send(`ERROR: Couldn't retrieve Pin #${id}`);
    }
  });

  // Creates a new pin based on the submitted
  // Body Containing: title, authorid, comment, cooordinates and Image.
  Router.post(
    "/pin",
    checkSchema(PinSchema, ["body"]),
    upload.single("image"),
    async (req, res) => {
      const session = req.session;
      const body = req.body;
      const file = req.file;
      const { title, authorid, comment, lat, lng } = body;

      try {
        // Image Validation
        if (file && !ALLOWED_MIME_TYPES.includes(file.mimetype)) {
          unlink(file.path);
          throw new Error("Invalid file type");
        }

        if (title.length === 0) {
          // Performing basic Checks
          throw new Error("A Title is Needed");
        } else if (lat === 0 && lng === 0) {
          throw new Error("Coordinates are Needed");
        }

        const auth = BasicAuth(PinsModel.sequelize, session);

        if (!auth) {
          throw new Error("ERROR: UNAUTHORIZED");
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
          image: file ? file.filename : "",
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
    },
  );

  Router.put(
    "/pin/:id/",
    checkSchema(PinSchema, ["body"]),
    async (req, res) => {
      const userModel = PinsModel.sequelize.models.Users;
      const id = req.params.id;
      const session = req.session;

      try {
        const query = await PinsModel.findOne({ where: { id: id } });
        const userQuery = await userModel.findByPk(session.userid);
        const oldData = query.dataValues;
        const newData = req.body;

        const auth = BasicAuth(PinsModel.sequelize, session);

        if (!auth) {
          throw new Error("ERROR: UNAUTHORIZED");
        }

        if (session.userid != query.authorid && userQuery.authLevel < 2) {
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
          message: `SUCCESS: ID ${id} ${oldData.title} updated!`,
        });
      } catch (error) {
        console.error(error);
      }
    },
  );

  Router.delete("/pin/:id", async (req, res) => {
    const userModel = PinsModel.sequelize.models.Users;
    const id = req.params.id;
    const session = req.session;

    try {
      // Perform action to delete
      const query = await PinsModel.findOne({ where: { id: id } });
      const userQuery = await userModel.findByPk(session.userid);

      const auth = BasicAuth(PinsModel.sequelize, session);

      if (!auth) {
        throw new Error("ERROR: UNAUTHORIZED");
      }

      if (query.authorid != session.userid && userQuery.authLevel < 1) {
        throw new Error("ERROR: UNAUTHORIZED");
      }

      const file_path = path.join(STORAGE_PATH, query.image);
      if (query.image && existsSync(file_path)) {
        unlink(file_path);
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
