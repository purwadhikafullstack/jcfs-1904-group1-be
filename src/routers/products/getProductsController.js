const router = require("express").Router();
const pool = require("../../config/database");

router.get("/", async (req, res, next) => {
  try {
    const connection = await pool.promise().getConnection();

    const sqlGetProducts = "SELECT * FROM products;";

    const result = await connection.query(sqlGetProducts);
    connection.release();

    res.status(200).send(result);
  } catch (error) {
    next(error);
  }
});
module.exports = router;
