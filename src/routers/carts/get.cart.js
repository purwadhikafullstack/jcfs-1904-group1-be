const pool = require("../../config/database");
const router = require("express").Router();

const getCartRouter = async (req, res, next) => {
  try {
    const connection = await pool.promise().getConnection();
    const sqlGetProducts = `select c.id, c.user_id, c.product_id, c.qty, p.productName, p.productPhoto, p.priceStrip, p.priceBox, p.pricePcs, c.variant from carts c
    inner join products p on p.id = c.product_id
    where c.user_id = ? && c.status = "cart";`;
    const data = req.params.user_id;

    const sqlGetTotalPrice = `SELECT sum(CASE 
      WHEN variant = "strip" then priceStrip
      WHEN variant = "bottle" then priceStrip
      WHEN variant = "box" then priceBox
      WHEN variant = "pcs" then pricePcs
      END * qty)  AS total
      FROM carts c
      inner join products p on p.id = c.product_id
      where c.user_id = ? && c.status = "cart";`;
    const dataUser = req.params.user_id;

    const [results] = await connection.query(sqlGetProducts, dataUser);

    const dataSend = results.map((result) => {
      let price;
      if (result.variant == "box") {
        price = result.priceBox;
      } else if (result.variant == "strip" || result.variant == "bottle") {
        price = result.priceStrip;
      } else if (result.variant == "pcs") {
        price = result.pricePcs;
      }
      return {
        ...result,
        price: price,
      };
    });

    const [resultTotal] = await connection.query(sqlGetTotalPrice, data);

    const total = parseInt(resultTotal[0].total);
    const ppnObat = 0.1;
    const tax = total * ppnObat;
    const totalAfterTax = total + tax;

    connection.release();

    res.status(200).send({ dataSend, total, totalAfterTax, ppnObat, tax });
  } catch (error) {
    next(error);
  }
};

router.get("/:user_id", getCartRouter);
module.exports = router;
