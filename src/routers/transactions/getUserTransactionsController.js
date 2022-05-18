const router = require("express").Router();
const pool = require("../../config/database");
const moment = require("moment");
const connection = await pool.promise().getConnection();

const getUserTransactionsRouter = router.get("/:id", async (req, res, next) => {
  try {
    const sqlUserTransactions = `select * from transactions where user_id = ? and status = ?;`;
    const sqlUser = [req.params.id, req.query.status];

    const result = await connection.query(sqlUserTransactions, sqlUser);
    const dataDate = result[0].map((result) => {
      return {
        ...result,
        date: moment(result.createdAt).format("DD MMM YYYY"),
      };
    });

    connection.release();

    res.status(200).send({ dataDate });
  } catch (error) {
    connection.release();
    next(error);
  }
});

module.exports = { getUserTransactionsRouter };
