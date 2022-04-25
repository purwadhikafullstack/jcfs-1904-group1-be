const router = require("express").Router();

<<<<<<< HEAD
const {
  getSalesReportRouter,
  getProductsReportRouter,
} = require("./getSalesReportController");

router.use(getSalesReportRouter);
router.use(getProductsReportRouter);
=======
const { getSalesReportRouter } = require("./getSalesReportController");

router.use(getSalesReportRouter);
>>>>>>> 1081e6f175c16105e33b6ffa9a3b01dd2a2dbf9a

module.exports = router;
