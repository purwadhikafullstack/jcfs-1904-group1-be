const express = require("express");
const router = express.Router();

const putOrderRouter = require("./put.order");

router.use(putOrderRouter);

module.exports = router;
