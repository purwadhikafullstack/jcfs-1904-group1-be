const pool = require("../../config/database");
const router = require("express").Router();

const getCartRouter = async (req, res, next) => {
  try {
    const connection = await pool.promise().getConnection();

    const sqlGetProducts = `select c.id, c.user_id, c.product_id, c.qty, p.productName, p.productPhoto, p.priceStrip from carts c
    inner join products p on p.id = c.product_id
    where c.user_id = ? && c.status = "cart";`;
    const data = req.params.user_id;

    const sqlGetTotalPrice = `select sum(p.priceStrip * c.qty) as total from carts c
    inner join products p on p.id = c.product_id
    where c.user_id = ? && c.status = "cart";`;

    const [result] = await connection.query(sqlGetProducts, data);
    const [resultTotal] = await connection.query(sqlGetTotalPrice, data);

    const total = parseInt(resultTotal[0].total);
    const ppnObat = 0.1;
    const tax = total * ppnObat;
    const totalAfterTax = total + tax;

    connection.release();

    res.status(200).send({ result, total, totalAfterTax });
  } catch (error) {
    next(error);
  }
};

router.get("/:user_id", getCartRouter);
module.exports = router;
