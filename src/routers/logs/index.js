const router = require("express").Router();

const { getLogsRouter } = require("./getStocksLogsController");

router.use(getLogsRouter);

module.exports = router;
