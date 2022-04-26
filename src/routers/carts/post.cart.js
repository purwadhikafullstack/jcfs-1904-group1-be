const pool = require("../../config/database");
const router = require("express").Router();

const postCartRouter = async (req, res, next) => {
  const { user_id, product_id, qty } = req.body;
  try {
    const connection = await pool.promise().getConnection();

    const sqlCheckCart = `select * from carts where user_id = ? and product_id = ? and status = "cart";`;
    const dataCheck = [req.body.user_id, req.body.product_id];

    try {
      const [resultCheck] = await connection.query(sqlCheckCart, dataCheck);

      if (resultCheck[0]) {
        const sqlUpdateCart = `update carts set qty = ? where user_id = ? and product_id = ? and status = "cart" ;`;
        const dataUpdate = [resultCheck[0].qty + qty, user_id, product_id];

        await connection.query(sqlUpdateCart, dataUpdate);
        connection.release();
        res.status(200).send("ada data gan");
      } else {
        const sqlPostProduct = `INSERT INTO carts SET ?;`;
        const data = req.body;
        const result = await connection.query(sqlPostProduct, data);

        connection.release();

        res.status(200).send("masuk gan");
      }
    } catch (error) {
      next(error);
    }
  } catch (error) {
    next(error);
  }
};

router.post("/", postCartRouter);

module.exports = router;
