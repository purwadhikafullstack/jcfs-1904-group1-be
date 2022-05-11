const router = require("express").Router();

const {
  getAllProductRouter,
  getProductsByCategoryRouter,
  getProductsByNameRouter,
  getCategoriesRouter,
  getProductsByIdRouter,
  getAllProductAdminRouter,
} = require("./getProductsController");

const {
  postUploadproductPhotoRouter,
  // postInputProductsRouter,
} = require("./postProductsController");

const {
  putProductsRouter,
  putDeleteRouter,
  putUnDeleteRouter,
} = require("./putProductsController");

router.use(getAllProductRouter);
router.use(getProductsByNameRouter);
router.use(getProductsByCategoryRouter);
router.use(getProductsByIdRouter);
router.use(getCategoriesRouter);
router.use(getAllProductAdminRouter);

router.use(postUploadproductPhotoRouter);

router.use(putProductsRouter);
router.use(putDeleteRouter);
router.use(putUnDeleteRouter);

module.exports = router;
