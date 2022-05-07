const router = require("express").Router();

// get admin
const {
  getSalesReportRouter,
  getProductsReportRouter,
  getAllTimeRevenueRouter,
} = require("./getSalesReportController");

const { getAllTransactions } = require("./getAllTransactions");

const { getTransactionDetails } = require("./getTransactionDetails");

// get user
const {
  getUserTransactionsRouter,
} = require("./getUserTransactionsController");

const { putPaymentPhotoRouter } = require("./putPaymentPhoto");

router.use(getSalesReportRouter);
router.use(getProductsReportRouter);
router.use(getTransactionDetails);
router.use(getUserTransactionsRouter);
router.use(getAllTimeRevenueRouter);
router.use(putPaymentPhotoRouter);
router.use(getAllTransactions);

module.exports = router;
