require("dotenv").config();
const pool = require("../../config/database");
const router = require("express").Router();

const putOrderRouter = async (req, res, next) => {
  console.log("masuk");
  try {
    const connection = await pool.promise().getConnection();
    const sqlUpdateOrder = "UPDATE transactions SET ? WHERE id = ?;";

    const dataOrder = [req.body, req.params.id];

    const result = await connection.query(sqlUpdateOrder, dataOrder);
    connection.release();

    res.status(200).send("Order status updated");
  } catch (error) {
    next(error);
  }
};

router.put("/update/:id", putOrderRouter);

module.exports = router;
