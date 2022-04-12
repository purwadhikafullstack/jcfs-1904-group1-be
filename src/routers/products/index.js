const router = require("express").Router();

const {
  getAllProductRouter,
  getProductsByCategoryRouter,
  getProductsByNameRouter,
  getProductsByIdRouter,
} = require("./getProductsController");

const {
  postUploadproductPhotoRouter,
  // postInputProductsRouter,
} = require("./postProductsController");

router.use(getAllProductRouter);
router.use(getProductsByNameRouter);
router.use(getProductsByCategoryRouter);
router.use(getProductsByIdRouter);

router.use(postUploadproductPhotoRouter);
// router.use(postInputProductsRouter);

module.exports = router;
