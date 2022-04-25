const pool = require("../../config/database");
const router = require("express").Router();

const getCartRouter = async (req, res, next) => {
  try {
    const connection = await pool.promise().getConnection();

    const sqlGetProducts = `select c.id, c.user_id, c.product_id, c.qty, p.productName, p.productPhoto, p.priceStrip from carts c
    inner join products p on p.id = c.product_id
    where c.user_id = ?;`;
    const data = req.params.user_id;

    const [result] = await connection.query(sqlGetProducts, data);
    connection.release();

    res.status(200).send(result);
  } catch (error) {
    next(error);
  }
};

router.get("/:user_id", getCartRouter);
module.exports = router;
