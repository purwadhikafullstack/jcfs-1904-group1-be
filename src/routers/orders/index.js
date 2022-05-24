const express = require("express");
const router = express.Router();

const putOrderRouter = require("./put.order");
const getOrderRouter = require("./get.order");

router.use(putOrderRouter);
router.use(getOrderRouter);

module.exports = router;
