const { query } = require("../../config/database");
const pool = require("../../config/database");
const { uploadImagePrescription } = require("../../services/multer");
const router = require("express").Router();

const multerUploadSingle = uploadImagePrescription.single("prescriptionPhoto");

const postCheckoutRouter = router.post(
  "/checkout/:userId/:transactionId",
  async (req, res, next) => {
    // const { invoice, user_id, status, amount } = req.body;
    console.log(req.body);
    try {
      const connection = await pool.promise().getConnection();
      await connection.beginTransaction();

      try {
        const sqlCheckout = `update transactions set status = ?, amount = amount + ? WHERE id = ${req.params.transactionId} AND status = "custom";`;
        const sqlCheckoutData = [req.body.status, req.body.amount];
        const [result] = await connection.query(sqlCheckout, sqlCheckoutData);

        const sqlInputDetails = `insert into detailTransaction (transaction_id, product_id, productName, productPrice, productPhoto, qty, variant) values ?;`;
        const sqlData = req.body.carts.map((product) => {
          if (product.variant === "pcs") {
            return [
              req.params.transactionId,
              product.product_id,
              product.productName,
              product.pricePcs,
              product.productPhoto,
              product.qty,
              product.variant,
            ];
          } else if (product.variant === "bottle") {
            return [
              req.params.transactionId,
              product.product_id,
              product.productName,
              product.priceStrip,
              product.productPhoto,
              product.qty,
              product.variant,
            ];
          }
          return;
        });

        const [resultt] = await connection.query(sqlInputDetails, [sqlData]);

        const sqlUpdateCheckout = `update carts set status = "checkout" where user_id = ? and status = "custom";`;

        const [status] = await connection.query(
          sqlUpdateCheckout,
          req.params.userId
        );

        let sqlUpdateQty = "";
        let dataBox = [];

        req.body.carts.forEach(async (product) => {
          if (product.variant == "bottle") {
            sqlUpdateQty = `update stocks set qtyStripAvailable = qtyStripAvailable - ? where product_id = ?`;
            dataBox = [product.qty, product.product_id];
            await connection.query(sqlUpdateQty, dataBox);
          } else if (product.variant == "pcs") {
            sqlUpdateQty = `update stocks set qtyPcsAvailable = qtyPcsAvailable - ? where product_id = ?`;
            dataBox = [product.qty, product.product_id];
            await connection.query(sqlUpdateQty, dataBox);
          }
        });

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

const postNewCustom = router.post(
  "/upload/:userId",
  multerUploadSingle,
  async (req, res, next) => {
    try {
      let finalImageURL =
        req.protocol +
        "://" +
        req.get("host") +
        "/images/prescriptions/" +
        req.file.filename;
      const connection = await pool.promise().getConnection();
      const sqlCheckout = `insert into transactions set ?;`;
      const sqlCheckoutData = {
        invoice: req.body.invoice,
        amount: req.body.amount,
        address: req.body.address,
        user_id: req.body.user_id,
        status: "custom",
        isByPrescription: 1,
        prescriptionPhoto: finalImageURL,
      };
      const result = await connection.query(sqlCheckout, sqlCheckoutData);
      res.status(200).send("Upload prescription -> admin");
    } catch (error) {
      console.log(error);
    }
  }
);

module.exports = { postCheckoutRouter, postNewCustom };
