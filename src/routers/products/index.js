const router = require("express").Router();

const {
  getAllProductRouter,
  getProductsByCategoryRouter,
  getProductsByNameRouter,
  getCategoriesRouter,
} = require("./getProductsController");

router.use(getAllProductRouter);
router.use(getProductsByNameRouter);
router.use(getCategoriesRouter);
router.use(getProductsByCategoryRouter);

module.exports = router;
