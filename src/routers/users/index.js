const express = require("express");
const router = express.Router();

const postUserRouter = require("./post.user");

const getUserRouter = require("./get.user");

// const putUserRouter = require("./put.user");

// const deleteUserRouter = require("./delete.user");

router.use(postUserRouter);

router.use(getUserRouter);

// router.use(putUserRouter);

// router.use(deleteUserRouter);

module.exports = router;
