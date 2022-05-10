const router = require("express").Router();

const getCartRouter = require("./get.cart");
const postCartRouter = require("./post.cart");
const deleteCartRouter = require("./delete.cart");
const putCartRouter = require("./put.cart");

router.use(getCartRouter);
router.use(postCartRouter);
router.use(deleteCartRouter);
router.use(putCartRouter);

module.exports = router;
