const router = require("express").Router();

// get admin
const {
  getSalesReportRouter,
  getProductsReportRouter,
  getAllTimeRevenueRouter,
} = require("./getSalesReportController");

const { getAllTransactions } = require("./getAllTransactions");

const {
  getTransactionDetails,
  getCustomOrderRouter,
} = require("./getTransactionDetails");

// get user
const {
  getUserTransactionsRouter,
} = require("./getUserTransactionsController");

const { putPaymentPhotoRouter } = require("./putPaymentPhoto");

const {
  postCheckoutRouter,
} = require("./postTransactionCustomOrderController");

const { getCustomTransactionDetails } = require("./getCustomTransactionUser");

router.use(getSalesReportRouter);
router.use(getProductsReportRouter);
router.use(getTransactionDetails);
router.use(getUserTransactionsRouter);
router.use(getAllTimeRevenueRouter);
router.use(getAllTransactions);
router.use(getCustomOrderRouter);
router.use(getCustomTransactionDetails);

router.use(putPaymentPhotoRouter);

router.use(postCheckoutRouter);

module.exports = router;
