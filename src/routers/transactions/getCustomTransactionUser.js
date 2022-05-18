const router = require("express").Router();
const pool = require("../../config/database");
const connection = await pool.promise().getConnection();

const getCustomTransactionDetails = router.get(
  "/details/custom/user/:transactionId",
  async (req, res, next) => {
    // const { invoice, user_id, status, amount } = req.body;
    try {
      const sqlDetails = `select invoice, id, prescriptionPhoto,  user_id, status, paymentPhoto, isByPrescription 
      from transactions where id = ?;`;
      const sqlData = req.params.transactionId;

      const result = await connection.query(sqlDetails, sqlData);
      connection.release();

      res.status(200).send(result);
    } catch (error) {
      connection.release();
      next(error);
    }
  }
);

module.exports = { getCustomTransactionDetails };
