const router = require("express").Router();

const { putProfilePhoto } = require("./putProfilePhoto");

router.use(putProfilePhoto);

module.exports = router;
