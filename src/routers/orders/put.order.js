require("dotenv").config();
const pool = require("../../config/database");
const router = require("express").Router();

const putOrderRouter = async (req, res, next) => {
  try {
    const connection = await pool.promise().getConnection();
    await connection.beginTransaction();
    console.log(req.body);
    try {
      const sqlUpdateOrder = "UPDATE transactions SET status = ? WHERE id = ?;";

      const dataOrder = [req.body.status, req.params.id];

      const result = await connection.query(sqlUpdateOrder, dataOrder);

      let sqlUpdateQtyTotal = "";
      let dataBox = [];
      req.body.transaction.forEach(async (product) => {
        if (product.variant == "box") {
          sqlUpdateQtyTotal = `update stocks set qtyBoxTotal = qtyBoxTotal - ? where product_id = ?`;
          dataBox = [product.qty, product.product_id];
          await connection.query(sqlUpdateQtyTotal, dataBox);
        } else if (product.variant == "strip") {
          sqlUpdateQtyTotal = `update stocks set qtyStripTotal = qtyStripTotal - ? where product_id = ?`;
          dataBox = [product.qty, product.product_id];
          await connection.query(sqlUpdateQtyTotal, dataBox);
        } else if (product.variant == "bottle") {
          sqlUpdateQtyTotal = `update stocks set qtyStripTotal = qtyStripTotal - ? where product_id = ?`;
          dataBox = [product.qty, product.product_id];
          await connection.query(sqlUpdateQtyTotal, dataBox);
        } else if (product.variant == "pcs") {
          sqlUpdateQtyTotal = `update stocks set qtyPcsTotal = qtyPcsTotal - ? where product_id = ?`;
          dataBox = [product.qty, product.product_id];
          await connection.query(sqlUpdateQtyTotal, dataBox);
        }
      });

      connection.commit();

      res.status(200).send("Order status updated");
    } catch (error) {
      connection.rollback();
      next(error);
    }
  } catch (error) {
    next(error);
  }
};

router.put("/update/:id", putOrderRouter);

module.exports = router;
