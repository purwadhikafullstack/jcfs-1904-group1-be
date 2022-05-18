const router = require("express").Router();
const pool = require("../../config/database");
const { verify } = require("../../services/token");
const { CLIENT_URL } = process.env;
const connection = await pool.promise().getConnection();

const getUserRouter = async (req, res, next) => {
  try {
    const sqlGetAllUser =
      "select id, username, email, fullName, age, gender from users;";

    const result = await connection.query(sqlGetAllUser);
    connection.release();

    res.status(200).send(result);
  } catch (error) {
    connection.release();
    next(error);
  }
};

const getVerifyRouter = async (req, res, next) => {
  try {
    const verifiedToken = verify(req.query.token);
    const sqlUpdateVerify = "update users set isVerified = true where id = ?";
    const dataUpdateVerify = verifiedToken.id;

    const result = await connection.query(sqlUpdateVerify, dataUpdateVerify);
    connection.release();

    const email = `${CLIENT_URL}/login`;
    res
      .status(200)
      .send(
        `<h1>Verification Success</h1><br><a href=${email}>Log in here</a>`
      );
  } catch (error) {
    connection.release();
    next(error);
  }
};

const getUserByIdRouter = async (req, res, next) => {
  try {
    const sqlGetUserById =
      "select id, username, email, password, fullName, userPhoto, age, gender, address from users where id = ?";
    const result = await connection.query(sqlGetUserById, req.params.userId);
    connection.release();
    res.status(200).send({ result });
  } catch (error) {
    connection.release();
    next(error);
  }
};

const getUserCountRouter = async (req, res, next) => {
  try {
    const sqlCountUser = `select count(id) as total from users
    where isAdmin = 0 and isVerified = 1;`;
    const [result] = await connection.query(sqlCountUser);
    connection.release();
    res.status(200).send({ result });
  } catch (error) {
    connection.release();
    next(error);
  }
};

router.get("/", getUserRouter);
router.get("/verify", getVerifyRouter);
router.get("/user/:userId", getUserByIdRouter);
router.get("/count", getUserCountRouter);

module.exports = router;
