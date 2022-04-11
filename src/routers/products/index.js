const router = require("express").Router();

const {
  getAllProductRouter,
  getProductsByCategoryRouter,
  getProductsByNameRouter,
  getProductsByIdRouter,
} = require("./getProductsController");

router.use(getAllProductRouter);
router.use(getProductsByNameRouter);
router.use(getProductsByCategoryRouter);
router.use(getProductsByIdRouter);

module.exports = router;
