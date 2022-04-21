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
<<<<<<< HEAD
=======
    // await connection.beginTransaction();
>>>>>>> 2cc3f571b4b62c8eaf94e01c040152a2771fbf45
    const sqlUpdateUser = "UPDATE users SET ? WHERE id = ?;";

    const dataUpdateUser = [req.body, req.params.userId];

    const result = await connection.query(sqlUpdateUser, dataUpdateUser);
    connection.release();

    res.status(200).send("User data updated");
  } catch (error) {
    next(error);
  }
};

<<<<<<< HEAD
const putResetPassword = async (req, res, next) => {
  try {
    const connection = await pool.promise().getConnection();

    const sql = "UPDATE users SET ? WHERE id = ?;";
    const verifiedToken = verify(req.body.token);
    console.log(verifiedToken);

    const sqlNewPassword = [req.body.password, verifiedToken];
    console.log(req.body.password);
    sqlNewPassword[0].password = bcrypt.hashSync(sqlNewPassword[0].password);

    const result = await connection.query(sql, sqlNewPassword);
    connection.release();

    res.status(200).send("Password has been reset");
  } catch (error) {}
};

router.put("/:userId", putUserRouter);
router.put("/reset-password", putResetPassword);
=======
router.put("/:userId", putUserRouter);
>>>>>>> 2cc3f571b4b62c8eaf94e01c040152a2771fbf45

module.exports = router;
