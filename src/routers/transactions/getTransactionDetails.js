const router = require("express").Router();
const pool = require("../../config/database");

const getTransactionDetails = router.get(
  "/details/:transactionId",
  async (req, res, next) => {
    // const { invoice, user_id, status, amount } = req.body;
    const connection = await pool.promise().getConnection();
    try {
      const sqlDetails = `select amount, address, invoice, transaction_id, product_id, t.prescriptionPhoto, productName, productPrice, productPhoto, qty, variant, d.createdAt, d.updatedAt, user_id, status, paymentPhoto, isByPrescription  from detailTransaction d 
      inner join transactions t on t.id = d.transaction_id
        where transaction_id = ?;`;
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

const getCustomOrderRouter = router.get(
  "/details/custom/:transactionId",
  async (req, res, next) => {
    // const { invoice, user_id, status, amount } = req.body;
    const connection = await pool.promise().getConnection();
    try {
      const sqlDetails = `SELECT *
      FROM transactions t
      WHERE t.id = ?;`;
      const sqlData = req.params.transactionId;

      const [order] = await connection.query(sqlDetails, sqlData);

      const sqlGetProducts = `SELECT *, p.id FROM products p
    INNER JOIN products_categories pc ON p.id = pc.product_id
    INNER JOIN categories c ON pc.category_id = c.id
    INNER JOIN stocks s ON pc.product_id = s.product_id
    WHERE p.isDeleted = 0 ORDER BY p.productName ASC;`;

      const [products] = await connection.query(sqlGetProducts);

      connection.release();

      res.status(200).send({ order, products });
    } catch (error) {
      connection.release();
      next(error);
    }
  }
);

module.exports = { getTransactionDetails, getCustomOrderRouter };
