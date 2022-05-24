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
  const connection = await pool.promise().getConnection();
  try {
    const sql = "INSERT INTO users SET ?";
    console.log(req.body);
    const data = req.body;

    const isEmail = validator.isEmail(data.email);

    if (!isEmail) return res.status(401).send({ message: "invalid e-mail" });

    data.password = bcrypt.hashSync(data.password);

    // bikin koneksi
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
  const connection = await pool.promise().getConnection();
  try {
    await connection.beginTransaction();
    const { username, password } = req.body;

    const sqlLoginUser =
      "SELECT id, username, fullName, email, password, isAdmin, isVerified, age, gender, address FROM users WHERE username = ?;";
    const sqlDataUSer = username;

    const result = await connection.query(sqlLoginUser, sqlDataUSer);

    const user = result[0];

    const compareResult = bcrypt.compareSync(password, user[0].password);

    if (!compareResult) {
      return res.status(401).send({ message: "Log in cridentials invalid" });
    }

    const token = sign({ id: user[0].id });

    if (user[0].isVerified == 0) {
      return res
        .status(401)
        .send({ message: "Please verify your account before logging in" });
    } else if (user[0].isVerified == 1) {
      res.status(200).send({ user: user[0], token });
      connection.commit();
      connection.release();
    }
  } catch (error) {
    connection.release();
    next(error);
  }
};

// forgot password
const postForgotPassword = async (req, res, next) => {
  const connection = await pool.promise().getConnection();
  try {
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
      url: `${process.env.CLIENT_URL}/reset-password/${token}`,
      data: {
        url: `${process.env.CLIENT_URL}/reset-password/${token}`,
      },
    });
  } catch (error) {
    connection.release();
    next(error);
  }
};

router.post("/", postUserRouter);
router.post("/login", postLoginUser);
router.post("/forgot-password", postForgotPassword);

module.exports = router;
