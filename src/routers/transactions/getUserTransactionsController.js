const router = require("express").Router();
const pool = require("../../config/database");
const moment = require("moment");

const getUserTransactionsRouter = router.get("/:id", async (req, res, next) => {
  try {
    const connection = await pool.promise().getConnection();

    const sqlUserTransactions = `select * from transactions where user_id = ? and status = ? limit ${req.query.limit} offset ${req.query.offset};`;
    const sqlUser = [req.params.id, req.query.status];

    const sqlCountTransactions = `select count(id) as total from transactions where user_id = ? and status = ?`;
    const sqlData = [req.params.id, req.query.status];

    const result = await connection.query(sqlUserTransactions, sqlUser);
    const dataDate = result[0].map((result) => {
      return {
        ...result,
        date: moment(result.createdAt).format("DD MMM YYYY"),
      };
    });

    const [resultCount] = await connection.query(sqlCountTransactions, sqlData);

    connection.release();

    res.status(200).send({ dataDate, total: resultCount[0].total });
  } catch (error) {
    next(error);
  }
});

const getUserTransactionsByName = router.get(
  "/:id/search",
  async (req, res, next) => {
    try {
      const connection = await pool.promise().getConnection();
      const data = req.query.search;

      const sqlGetTransactionsByName = `SELECT * FROM transactions WHERE invoice LIKE ? AND status = ?;`;
      const dataGetTransactions = "%" + data + "%";
      const dataSql = [dataGetTransactions, req.query.status];
      const [result] = await connection.query(
        sqlGetTransactionsByName,
        dataSql
      );
      const dataDate = result.map((result) => {
        return {
          ...result,
          date: moment(result.createdAt).format("DD MMM YYYY"),
        };
      });
      connection.release();
      res.status(200).send(dataDate);
    } catch (error) {
      next(error);
    }
  }
);

module.exports = { getUserTransactionsRouter, getUserTransactionsByName };
