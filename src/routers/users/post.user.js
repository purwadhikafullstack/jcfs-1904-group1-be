require("dotenv").config();
const pool = require("../../config/database");
const router = require("express").Router();
const validator = require("validator");
const bcrypt = require("bcryptjs");
const { sign } = require("../../services/token");
const {
  sendVerificationEmail,
  sendResetPasswordEmail,
} = require("../../services/emails");

// user register
const postUserRouter = async (req, res, next) => {
  try {
    const sql = "INSERT INTO users SET ?";
    const data = req.body;

    const isEmail = validator.isEmail(data.email);

    if (!isEmail) return res.status(401).send({ message: "invalid e-mail" });

    data.password = bcrypt.hashSync(data.password);

    // bikin koneksi
    const connection = await pool.promise().getConnection();
    // simpan data baru, akan me return id nya
    const [result] = await connection.query(sql, data);
    // membuat token yang menyimpan sebuah object
    const token = sign({ id: result.insertId });
    // token = eJH...

    res.status(201).send({
      message: `${req.body.username} registered`,
    });

    sendVerificationEmail({
      recipient: data.email,
      subject: "Email Verification",
      username: data.username,
      url: `${process.env.API_URL}/users/verify?token=${token}`,
      data: {
        username: data.username,
        url: `${process.env.API_URL}/users/verify?token=${token}`,
      },
    });
  } catch (error) {
    next(error);
  }
};

// user login
const postLoginUser = async (req, res, next) => {
  try {
    const connection = await pool.promise().getConnection();
    await connection.beginTransaction();
    const { username, password } = req.body;

    const sqlLoginUser =
      "SELECT id, username, fullName, email, password, isAdmin, isVerified, age, gender, address FROM users WHERE username = ?;";
    const sqlDataUSer = username;

    const result = await connection.query(sqlLoginUser, sqlDataUSer);
    connection.release();

    const user = result[0];

    const compareResult = bcrypt.compareSync(password, user[0].password);

    if (!compareResult) {
      return res.status(401).send({ message: "Log in cridentials invalid" });
    }

    res.status(200).send({ user });
    // if (user.isVerified === 1) {
    //   return res.status(200).send({ user });
    // } else {
    //   return res.status(401).send({ message: "Please verify your account" });
    // }
  } catch (error) {
    next(error);
  }
};

// forgot password
const postForgotPassword = async (req, res, next) => {
  try {
    const connection = await pool.promise().getConnection();
    const sql = `SELECT id FROM users WHERE email = ?;`;
    const sqlEmail = req.body.email;

    const result = await connection.query(sql, sqlEmail);
    connection.release();

    const user = result[0];
    const token = sign({ id: user[0].id });

    res.status(200).send({ user: user[0], token });

    sendResetPasswordEmail({
      recipient: sqlEmail,
      subject: "Password Email Reset",
      url: `${process.env.CLIENT_URL}/reset-password?token=${token}`,
      data: {
        url: `${process.env.CLIENT_URL}/reset-password?token=${token}`,
      },
    });
  } catch (error) {}
};

router.post("/", postUserRouter);
router.post("/login", postLoginUser);
router.post("/forgot-password", postForgotPassword);

module.exports = router;
