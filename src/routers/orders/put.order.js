require("dotenv").config();
const pool = require("../../config/database");
const router = require("express").Router();
const putOrderRouter = async (req, res, next) => {
  try {
    const connection = await pool.promise().getConnection();
    await connection.beginTransaction();
    try {
      const sqlUpdateOrder = "UPDATE transactions SET status = ? WHERE id = ?;";
      const dataOrder = [req.body.status, req.params.id];
      const result = await connection.query(sqlUpdateOrder, dataOrder);
      if (req.body.status === "sending") {
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

        const sqlInsertLog = `INSERT INTO logs(product_id, user_id, description, type, amount, current_stock) values ?;`;
        let dataLog = [];
        req.body.transaction.forEach(async (product) => {
          const sqlgetStock = `select * from stocks where product_id = ?`;
          const dataId = product.product_id;
          const [result] = await connection.query(sqlgetStock, dataId);

          if (product.variant === "bottle") {
            dataLog = [
              product.product_id,
              product.user_id,
              "sold",
              "bottle",
              product.qty,
              result[0].qtyStripTotal,
            ];
          }
        });
        await connection.query(sqlInsertLog, dataLog);
      }
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
