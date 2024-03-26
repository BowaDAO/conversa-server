const express = require("express");
const router = express.Router();
const { signin, signup, handleSession } = require("../controllers/auth");
const validateForm = require("../utilities/validateForm");
const rateLimiter = require("../middlewares/rateLimiter");

router
  .route("/signin")
  .get(handleSession)
  .post(validateForm, rateLimiter(60, 10), signin);
router.post("/signup", validateForm, rateLimiter(30, 5), signup);

module.exports = router;
