const { query } = require("../../config/database");
const pool = require("../../config/database");
const router = require("express").Router();

const postCartRouter = async (req, res, next) => {
  const { user_id, product_id, qty } = req.body;
  const connection = await pool.promise().getConnection();
  try {
    await connection.beginTransaction();

    try {
      const sqlCheckCart = `select * from carts where user_id = ? and product_id = ? and status = "cart" and variant = ?;`;
      const dataCheck = [
        req.body.user_id,
        req.body.product_id,
        req.body.variant,
      ];
      const [resultCheck] = await connection.query(sqlCheckCart, dataCheck);

      if (resultCheck[0]) {
        const sqlUpdateCart = `update carts set qty = ? where user_id = ? and product_id = ? and status = "cart" and variant = ? ;`;
        const dataUpdate = [
          resultCheck[0].qty + qty,
          user_id,
          product_id,
          req.body.variant,
        ];

        await connection.query(sqlUpdateCart, dataUpdate);
        res.status(200).send("ada data gan");
      } else {
        const sqlPostProduct = `INSERT INTO carts SET ?;`;
        const data = req.body;
        const result = await connection.query(sqlPostProduct, data);

        connection.commit();
        res.status(200).send("masuk gan");
      }
    } catch (error) {
      connection.rollback();
      next(error);
    }
  } catch (error) {
    next(error);
  }
};

const postCheckoutRouter = async (req, res, next) => {
  // const { invoice, user_id, status, amount } = req.body;
  const data = req.body.carts[0];
  const connection = await pool.promise().getConnection();
  try {
    await connection.beginTransaction();

    try {
      const sqlCheckout = `insert into transactions set ?;`;
      const sqlCheckoutData = {
        invoice: req.body.invoice,
        user_id: req.body.user_id,
        // status: req.body.status,
        amount: req.body.amount,
      };
      // const sqlCheckoutData = req.body;

      const [result] = await connection.query(sqlCheckout, sqlCheckoutData);

      const sqlInputDetails = `insert into detailTransaction (transaction_id, product_id, productName, productPrice, productPhoto, qty, variant) values ?;`;
      const sqlData = req.body.carts.map((product) => {
        if (product.variant === "box") {
          return [
            result.insertId,
            product.product_id,
            product.productName,
            product.priceBox,
            product.productPhoto,
            product.qty,
            product.variant,
          ];
        }
        if (product.variant === "strip") {
          return [
            result.insertId,
            product.product_id,
            product.productName,
            product.priceStrip,
            product.productPhoto,
            product.qty,
            product.variant,
          ];
        }
        if (product.variant === "bottle") {
          return [
            result.insertId,
            product.product_id,
            product.productName,
            product.priceStrip,
            product.productPhoto,
            product.qty,
            product.variant,
          ];
        }
        if (product.variant === "pcs") {
          return [
            result.insertId,
            product.product_id,
            product.productName,
            product.pricePcs,
            product.productPhoto,
            product.qty,
            product.variant,
          ];
        }
        return;
      });
      const [resultt] = await connection.query(sqlInputDetails, [sqlData]);

      const sqlUpdateCheckout = `update carts set status = "checkout" where user_id = ? and status = "cart";`;

      const [status] = await connection.query(
        sqlUpdateCheckout,
        req.body.user_id
      );

      let sqlUpdateQty = "";
      let dataBox = [];

      req.body.carts.forEach(async (product) => {
        if (product.variant === "box") {
          sqlUpdateQty = `update stocks set qtyBoxAvailable = qtyBoxAvailable - ? where product_id = ?`;
          dataBox = [product.qty, product.product_id];
          await connection.query(sqlUpdateQty, dataBox);
        } else if (product.variant === "strip") {
          sqlUpdateQty = `update stocks set qtyStripAvailable = qtyStripAvailable - ? where product_id = ?`;
          dataBox = [product.qty, product.product_id];
          await connection.query(sqlUpdateQty, dataBox);
        } else if (product.variant === "bottle") {
          sqlUpdateQty = `update stocks set qtyStripAvailable = qtyStripAvailable - ? where product_id = ?`;
          dataBox = [product.qty, product.product_id];
          await connection.query(sqlUpdateQty, dataBox);
        } else if (product.variant === "pcs") {
          sqlUpdateQty = `update stocks set qtyPcsAvailable = qtyPcsAvailable - ? where product_id = ?`;
          dataBox = [product.qty, product.product_id];
          await connection.query(sqlUpdateQty, dataBox);
        }
      });

      connection.commit();
      res.status(200).send("Checkout success, new transaction created");
    } catch (error) {
      connection.rollback();
      next(error);
    }
  } catch (error) {
    next(error);
  }
};

const postCartCustomRouter = async (req, res, next) => {
  const connection = await pool.promise().getConnection();
  try {
    const sqlDetails = `insert into carts(user_id, product_id, qty, status, variant) values ?;`;
    const sqlDetailsData = req.body.selected.map((product) => {
      if (product.isLiquid === 1) {
        return [req.body.user_id, product.id, 1, "custom", "bottle"];
      } else {
        return [req.body.user_id, product.id, 1, "custom", "pcs"];
      }
    });

    const result = await connection.query(sqlDetails, [sqlDetailsData]);
    connection.release();
    res.status(200).send([result]);
  } catch (error) {
    connection.release();
    next(error);
  }
};

router.post("/", postCartRouter);
router.post("/checkout", postCheckoutRouter);
router.post("/details/custom", postCartCustomRouter);

module.exports = router;
