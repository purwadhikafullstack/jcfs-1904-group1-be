const router = require("express").Router();

const getCategoriesRouter = require("./getCategoriesController");

router.use(getCategoriesRouter);

module.exports = router;
