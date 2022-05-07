const router = require("express").Router();

// get admin
const {
  getSalesReportRouter,
  getProductsReportRouter,
} = require("./getSalesReportController");

const { getTransactionDetails } = require("./getTransactionDetails");

// get user
const {
  getUserTransactionsRouter,
} = require("./getUserTransactionsController");

router.use(getSalesReportRouter);
router.use(getProductsReportRouter);
router.use(getTransactionDetails);
router.use(getUserTransactionsRouter);

module.exports = router;
