const router = require("express").Router();
const { mysql2 } = require("../../config/database");
const { verify } = require("../../services/token");

const getUserRouter = async (req, res, next) => {
  try {
    const connection = await mysql2.promise().getConnection();

    const sqlGetAllUser =
      "select id, username, email, fullName, age, gender from users;";

    const result = await connection.query(sqlGetAllUser);
    connection.release();

    res.status(200).send(result);
  } catch (error) {
    next(error);
  }
};

const getVerifyRouter = async (req, res, next) => {
  try {
    const connection = await mysql2.promise().getConnection();

    const verifiedToken = verify(req.query.token);
    const sqlUpdateVerify = "update users set isVerified = true where id = ?";
    const dataUpdateVerify = verifiedToken.id;

    const result = await connection.query(sqlUpdateVerify, dataUpdateVerify);
    connection.release();

    res.status(200).send("<h1>Verification Success</h1>");
  } catch (error) {
    next(error);
  }
};

router.get("/", getUserRouter);
router.get("/verify", getVerifyRouter);

module.exports = router;
