require("dotenv").config();
const pool = require("../../config/database");
const router = require("express").Router();
const bcrypt = require("bcryptjs");
const { verify, sign } = require("../../services/token");
const { sendVerificationEmail } = require("../../services/emails");

const putUserRouter = async (req, res, next) => {
  try {
    console.log(req.body);
    const connection = await pool.promise().getConnection();
    const sqlUpdateUser = `UPDATE users SET ? WHERE id = ${req.params.userId};`;

    const dataUpdateUser = req.body;

    const result = await connection.query(sqlUpdateUser, dataUpdateUser);
    connection.release();

    res.status(200).send("User data updated");
  } catch (error) {
    next(error);
  }
};

const putResetPasswordRouter = async (req, res, next) => {
  try {
    const connection = await pool.promise().getConnection();

    const sql = "UPDATE users SET password = ? WHERE id = ?;";
    const verifiedToken = verify(req.params.token);

    const sqlNewPassword = bcrypt.hashSync(req.body.password);

    const sqlNewNewPassword = [sqlNewPassword, verifiedToken.id];

    const result = await connection.query(sql, sqlNewNewPassword);
    connection.release();

    res.status(200).send("Password has been reset");
  } catch (error) {
    next(error);
  }
};

router.put("/update-user/:userId", putUserRouter);
router.put("/reset-password/:token", putResetPasswordRouter);

module.exports = router;
