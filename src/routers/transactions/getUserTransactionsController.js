const router = require("express").Router();
const pool = require("../../config/database");

const getUserTransactionsRouter = router.get("/:id", async (req, res, next) => {
  try {
    const connection = await pool.promise().getConnection();

    const sqlUserTransactions = `select * from transactions where user_id = ?;`;
    const sqlUser = req.params.id;

    const result = await connection.query(sqlUserTransactions, sqlUser);
    connection.release();

    res.status(200).send({ result });
  } catch (error) {
    next(error);
  }
});

module.exports = { getUserTransactionsRouter };
