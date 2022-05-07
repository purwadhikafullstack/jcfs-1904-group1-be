const router = require("express").Router();
const pool = require("../../config/database");

const getTransactionDetails = router.get(
  "/details/:transactionId",
  async (req, res, next) => {
    // const { invoice, user_id, status, amount } = req.body;
    try {
      const connection = await pool.promise().getConnection();

      const sqlDetails = `select amount, invoice, transaction_id, product_id, prescriptionPhoto, productName, productPrice, productPhoto, qty, variant, d.createdAt, d.updatedAt, user_id, status, paymentPhoto, isByPrescription  from detailTransaction d 
      inner join transactions t on t.id = d.transaction_id
        where transaction_id = ?;`;
      const sqlData = req.params.transactionId;

      const result = await connection.query(sqlDetails, sqlData);
      connection.release();

      res.status(200).send(result);
    } catch (error) {
      next(error);
    }
  }
);

module.exports = { getTransactionDetails };
