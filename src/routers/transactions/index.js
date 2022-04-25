const router = require("express").Router();

const {
  getSalesReportRouter,
  getProductsReportRouter,
} = require("./getSalesReportController");

router.use(getSalesReportRouter);
router.use(getProductsReportRouter);

module.exports = router;
