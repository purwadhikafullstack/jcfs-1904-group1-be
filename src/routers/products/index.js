const router = require("express").Router();

const {
  getAllProductRouter,
  getProductsByCategoryRouter,
  getProductsByNameRouter,
  getCategoriesRouter,
  getProductsByIdRouter,
} = require("./getProductsController");

router.use(getAllProductRouter);
router.use(getProductsByNameRouter);
router.use(getCategoriesRouter);
router.use(getProductsByCategoryRouter);
router.use(getProductsByIdRouter);

module.exports = router;
