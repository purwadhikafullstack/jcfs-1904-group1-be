const pool = require("../../config/database");
const router = require("express").Router();

const increaseQtyRouter = async (req, res, next) => {
  const { user_id, product_id, qty, status } = req.body;
  const connection = await pool.promise().getConnection();
  try {
    const sqlCheckCart = `select qty from carts where user_id = ? and product_id = ? and status = ? and variant = ?;`;
    const dataCheck = [
      req.body.user_id,
      req.body.product_id,
      req.body.status,
      req.body.variant,
    ];

    try {
      const [resultCheck] = await connection.query(sqlCheckCart, dataCheck);

      const sqlUpdateCart = `update carts set qty = ? where user_id = ? and product_id = ? and status = ? and variant = ? ;`;
      const dataUpdate = [
        resultCheck[0].qty + 1,
        user_id,
        product_id,
        status,
        req.body.variant,
      ];

      await connection.query(sqlUpdateCart, dataUpdate);
      connection.release();
      res.status(200).send("Qty increased");
    } catch (error) {
      connection.release();
      next(error);
    }
  } catch (error) {
    next(error);
  }
};

const decreaseQtyRouter = async (req, res, next) => {
  const { user_id, product_id, qty, status } = req.body;
  console.log(req.body);
  const connection = await pool.promise().getConnection();
  try {
    const sqlCheckCart = `select qty from carts where user_id = ? and product_id = ? and status = ? and variant = ?;`;
    const dataCheck = [
      req.body.user_id,
      req.body.product_id,
      req.body.status,
      req.body.variant,
    ];

    try {
      const [resultCheck] = await connection.query(sqlCheckCart, dataCheck);

      const sqlUpdateCart = `update carts set qty = ? where user_id = ? and product_id = ? and status = ? and variant = ? ;`;
      const dataUpdate = [
        resultCheck[0].qty - 1,
        user_id,
        product_id,
        status,
        req.body.variant,
      ];

      await connection.query(sqlUpdateCart, dataUpdate);
      connection.release();
      res.status(200).send("Qty decreased");
    } catch (error) {
      connection.release();
      next(error);
    }
  } catch (error) {
    next(error);
  }
};

// router.put("/:id", putCartRouter);
router.put("/incQty", increaseQtyRouter);
router.put("/decQty", decreaseQtyRouter);

module.exports = router;
