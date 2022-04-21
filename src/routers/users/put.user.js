require("dotenv").config();
const pool = require("../../config/database");
const router = require("express").Router();
const validator = require("validator");
const bcrypt = require("bcryptjs");
const { verify, sign } = require("../../services/token");
const { sendVerificationEmail } = require("../../services/emails");

const putUserRouter = async (req, res, next) => {
  try {
    const connection = await pool.promise().getConnection();
    // await connection.beginTransaction();
    const sqlUpdateUser = "UPDATE users SET ? WHERE id = ?;";

    const dataUpdateUser = [req.body, req.params.userId];

    const result = await connection.query(sqlUpdateUser, dataUpdateUser);
    connection.release();

    res.status(200).send("User data updated");
  } catch (error) {
    next(error);
  }
};

router.put("/:userId", putUserRouter);

module.exports = router;
