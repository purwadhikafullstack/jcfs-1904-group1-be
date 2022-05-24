require("dotenv").config();
const pool = require("../../config/database");
const router = require("express").Router();
const moment = require("moment");

const getTransactionsByName = async (req, res, next) => {
  try {
    const connection = await pool.promise().getConnection();
    const data = req.query.search;

    const sqlGetTransactionsByName = `SELECT * FROM transactions WHERE invoice LIKE ? AND status = ?;`;
    const dataGetTransactions = "%" + data + "%";
    const dataSql = [dataGetTransactions, req.query.status];
    const [result] = await connection.query(sqlGetTransactionsByName, dataSql);
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
};

router.get("/search", getTransactionsByName);

module.exports = router;
