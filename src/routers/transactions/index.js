const router = require("express").Router();

const { getSalesReportRouter } = require("./getSalesReportController");

router.use(getSalesReportRouter);

module.exports = router;
