const router = require("express").Router();
const pool = require("../../config/database");

//Get Categories
router.get("/", async (req, res, next) => {
  try {
    const connection = await pool.promise().getConnection();

    const sqlGetCategories = "SELECT name, id FROM categories";
    const [result] = await connection.query(sqlGetCategories);
    connection.release();

    res.status(200).send(result);
  } catch (error) {
    next(error);
  }
});
module.exports = router;
