/*
 * This is where the routes are located...
 *
 *
 */

const router = require("express").Router();

router.get("/", (req, res) => {
  res.json({
    message: "Hello World",
  });
});

module.exports = router;
