require("dotenv").config();
const pool = require("../../config/database");
const router = require("express").Router();
const validator = require("validator");
const bcrypt = require("bcryptjs");
const { sign } = require("../../services/token");
const { sendVerificationEmail } = require("../../services/emails");

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
      // url: `http://localhost:${process.env.API_PORT}/users/verify?token=${token}`,
      url: `${process.env.API_URL}/users/verify?token=${token}`,
      data: {
        username: data.username,
        // url: `http://localhost:${process.env.API_PORT}/users/verify?token=${token}`,
        url: `${process.env.API_URL}/users/verify?token=${token}`,
      },
    });
  } catch (error) {
    next(error);
  }
};

//Login
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

router.post("/", postUserRouter);
router.post("/login", postLoginUser);

module.exports = router;
