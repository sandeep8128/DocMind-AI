const express = require("express");

const {
  submitSupportMessage,
} = require("../controllers/supportController");

const router = express.Router();

router.post("/", submitSupportMessage);

module.exports = router;