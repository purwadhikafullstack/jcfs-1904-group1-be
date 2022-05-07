const router = require("express").Router();

// get admin
const {
  getSalesReportRouter,
  getProductsReportRouter,
  getAllTimeRevenueRouter,
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
router.use(getAllTimeRevenueRouter);

module.exports = router;
