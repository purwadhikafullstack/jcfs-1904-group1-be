const pool = require("../../config/database");
const router = require("express").Router();

const postCartRouter = async (req, res, next) => {
  try {
    const connection = await pool.promise().getConnection();

    const sqlPostProduct = `INSERT INTO carts SET ?;`;
    const data = req.body;
    const result = await connection.query(sqlPostProduct, data);

    connection.release();

    res.status(200).send("masuk gan");
  } catch (error) {
    next(error);
  }
};

router.post("/", postCartRouter);

module.exports = router;
