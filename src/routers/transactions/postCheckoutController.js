const router = require("express").Router();
const pool = require("../../config/database");
const moment = require("moment");

const postCheckoutRouter = router.post("/checkout", async (req, res, next) => {
  // const { invoice, user_id, status, amount } = req.body;
  try {
    const connection = await pool.promise().getConnection();

    const sqlCheckout = `insert into transactions set ?;`;
    const sqlData = req.body;

    const result = await connection.query(sqlCheckout, sqlData);
    connection.release();

    res.status(200).send(result);
  } catch (error) {
    next(error);
  }
});

module.exports = { postCheckoutRouter };
