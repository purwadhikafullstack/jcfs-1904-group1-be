const router = require("express").Router();
const pool = require("../../config/database");
const moment = require("moment");

const getAllTransactions = router.get("/", async (req, res, next) => {
  const connection = await pool.promise().getConnection();
  try {
    const sqlTransactions = `SELECT *, t.id FROM transactions t inner join users u where u.id = t.user_id and status = ? limit ${req.query.limit} offset ${req.query.offset};`;
    const sqlUser = req.query.status;

    const sqlCountTransactions = `select count(id) as total from transactions where status = ?`;
    const sqlData = req.query.status;

    const result = await connection.query(sqlTransactions, sqlUser);
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
    connection.release();
    next(error);
  }
});

const getTransactionDetail = router.get(
  "/admin/:transactionId",
  async (req, res, next) => {
    const connection = await pool.promise().getConnection();
    try {
      const sqlTransactions = `select t.user_id, amount, invoice, transaction_id, product_id, t.prescriptionPhoto, productName, productPrice, productPhoto, qty, variant, d.createdAt, d.updatedAt, user_id, status, paymentPhoto, isByPrescription  from detailTransaction d 
      inner join transactions t on t.id = d.transaction_id
        where transaction_id = ?;`;
      const sqlUser = req.params.transactionId;

      const result = await connection.query(sqlTransactions, sqlUser);

      connection.release();

      res.status(200).send({ result });
    } catch (error) {
      connection.release();
      next(error);
    }
  }
);

module.exports = { getAllTransactions, getTransactionDetail };
