const router = require("express").Router();

const getProductsRouter = require("./getProductsController");

router.use(getProductsRouter);

module.exports = router;
