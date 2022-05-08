const { query } = require("../../config/database");
const pool = require("../../config/database");
const router = require("express").Router();

const postCheckoutRouter = router.post(
  "/checkout/:userId/:transactionId",
  async (req, res, next) => {
    // const { invoice, user_id, status, amount } = req.body;
    try {
      const connection = await pool.promise().getConnection();
      await connection.beginTransaction();

      try {
        const sqlCheckout = `update transactions set ? WHERE id = ${req.params.transactionId} AND status = "custom";`;
        const sqlCheckoutData = {
          status: req.body.status,
          amount: req.body.amount,
        };

        const [result] = await connection.query(sqlCheckout, sqlCheckoutData);

        const sqlInputDetails = `insert into detailTransaction (transaction_id, product_id, productName, productPrice, productPhoto, qty, variant) values ?;`;
        const sqlData = req.body.carts.map((product) => {
          return [
            req.params.transactionId,
            product.product_id,
            product.productName,
            product.priceStrip,
            product.productPhoto,
            product.qty,
            product.variant,
          ];
        });

        const [resultt] = await connection.query(sqlInputDetails, [sqlData]);

        const sqlUpdateCheckout = `update carts set status = "checkout" where user_id = ? and status = "custom";`;

        const [status] = await connection.query(
          sqlUpdateCheckout,
          req.params.userId
        );

        let sqlUpdateQty = "";
        let dataBox = [];
        req.body.carts.forEach((product) => {
          if (product.variant == "bottle") {
            sqlUpdateQty = `update stocks set qtyStripAvailable = qtyStripAvailable - ? where product_id = ?`;
            dataBox = [product.qty, product.product_id];
          } else if (product.variant == "pcs") {
            sqlUpdateQty = `update stocks set qtyPcsAvailable = qtyPcsAvailable - ? where product_id = ?`;
            dataBox = [product.qty, product.product_id];
          }
        });
        await connection.query(sqlUpdateQty, dataBox);

        connection.commit();
        res.status(200).send("Checkout successfully");
      } catch (error) {
        connection.rollback();
        next(error);
      }
    } catch (error) {
      next(error);
    }
  }
);

module.exports = { postCheckoutRouter };
