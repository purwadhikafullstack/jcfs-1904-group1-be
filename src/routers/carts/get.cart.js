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

const getCustomCartRouter = async (req, res, next) => {
  try {
    const connection = await pool.promise().getConnection();
    const sqlGetProducts = `SELECT u.id, u.username, t.id as transactionId, c.status, t.invoice, t.prescriptionPhoto
    FROM carts c
    INNER JOIN users u ON c.user_id = u.id
    INNER JOIN transactions t ON c.user_id = t.user_id
    WHERE c.status = "custom" AND t.status = "custom"
        GROUP BY t.invoice;`;

    const [result] = await connection.query(sqlGetProducts);
    connection.release();

    res.status(200).send({ result });
  } catch (error) {
    next(error);
  }
};

const getCustomCartDetailRouter = async (req, res, next) => {
  try {
    const connection = await pool.promise().getConnection();
    const sqlGetProducts = `select c.id, c.user_id, c.product_id, c.qty, p.productName, p.productPhoto, p.priceStrip, p.priceBox, p.pricePcs, c.variant, t.invoice, t.prescriptionPhoto from carts c
    inner join products p on p.id = c.product_id
    inner join users u on u.id = c.user_id
    inner join transactions t on t.user_id = u.id
    where c.user_id = ? AND c.status = "custom" AND t.status = "custom" and t.id = ?;`;
    const data = [req.params.userId, req.params.transactionId];
    const [results] = await connection.query(sqlGetProducts, data);

    const sqlGetTotalPrice = `SELECT sum(CASE 
      WHEN variant = "strip" then priceStrip
      WHEN variant = "bottle" then priceStrip
      WHEN variant = "box" then priceBox
      WHEN variant = "pcs" then pricePcs
      END * qty)  AS total
      FROM carts c
      inner join products p on p.id = c.product_id
      where c.user_id = ? && c.status = "custom";`;
    const dataUser = req.params.userId;

    const [resultTotal] = await connection.query(sqlGetTotalPrice, dataUser);

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

router.get("/user/:user_id", getCartRouter);
router.get("/admin", getCustomCartRouter);
router.get("/admin/:userId/:transactionId", getCustomCartDetailRouter);
module.exports = router;
