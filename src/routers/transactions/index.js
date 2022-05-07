const router = require("express").Router();

// get admin
const {
  getSalesReportRouter,
  getProductsReportRouter,
  getAllTimeRevenueRouter,
} = require("./getSalesReportController");

const { postCheckoutRouter } = require("./postCheckoutController");

// get user
const {
  getUserTransactionsRouter,
} = require("./getUserTransactionsController");

router.use(getSalesReportRouter);
router.use(getProductsReportRouter);
router.use(postCheckoutRouter);
router.use(getUserTransactionsRouter);
router.use(getAllTimeRevenueRouter);

module.exports = router;
