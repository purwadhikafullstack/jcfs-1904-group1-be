const express = require("express");
const router = express.Router();
const pool = require("../../config/database");
const { uploadImage } = require("../../services/multer");

const multerUploadSingle = uploadImage.single("productPhoto");

const putProductsRouter = router.put(
  `/:id`,
  multerUploadSingle,
  async (req, res, next) => {
    try {
      const connection = await pool.promise().getConnection();
      await connection.beginTransaction();
      try {
        const sqlInput = `UPDATE products SET ? WHERE id = ${req.params.id};`;

        let data = {
          productName: req.body.productName,
          priceStrip: req.body.priceStrip,
          dose: req.body.dose,
          description: req.body.description,
        };
        if (req.file) {
          let finalImageURL =
            req.protocol +
            "://" +
            req.get("host") +
            "/images/products/" +
            req.file.filename;

          data = { ...data, productPhoto: finalImageURL };
        }
        if (req.body.isLiquid == 1) {
          data = data;
        } else {
          data = {
            ...data,
            priceBox: req.body.priceBox,
            pricePcs: req.body.pricePcs,
          };
        }
        const [result] = await connection.query(sqlInput, data);

        const sqlInputCat = `UPDATE products_categories SET ? WHERE product_id = ${req.params.id};`;
        const dataCat = {
          category_id: req.body.category_id,
        };

        await connection.query(sqlInputCat, dataCat);

        const sqlInputStocks = `UPDATE stocks SET ? WHERE product_id = ${req.params.id};`;
        if (req.body.isLiquid == 1) {
          const dataStocks = {
            isLiquid: req.body.isLiquid,

            qtyStripTotal: req.body.qtyBottleTotal,
            qtyStripAvailable: req.body.qtyBottleTotal,
          };

          await connection.query(sqlInputStocks, dataStocks);
        } else {
          const dataStocks = {
            isLiquid: req.body.isLiquid,
            qtyBoxTotal: req.body.qtyBoxTotal,
            qtyBoxAvailable: req.body.qtyBoxTotal,
            qtyStripAvailable: req.body.qtyStripTotal,
            qtyPcsTotal: req.body.qtyPcsTotal,
            qtyPcsAvailable: req.body.qtyPcsTotal,
          };
          await connection.query(sqlInputStocks, dataStocks);
        }

        connection.commit();
        res.status(200).send({ Message: "Update Data Succes" });
      } catch (error) {
        connection.rollback;
        next(error);
      }
    } catch (error) {
      next(error);
    }
  }
);

const putDeleteRouter = router.put(`/:id/delete`, async (req, res, next) => {
  try {
    const connection = await pool.promise().getConnection();
    const sql = `UPDATE products SET isDeleted = 1 WHERE id = ${req.params.id} `;
    const result = await connection.query(sql);
    connection.release();
    res.status(200).send("Products deleted");
  } catch (error) {
    next(error);
  }
});
const putUnDeleteRouter = router.put(
  `/:id/undelete`,
  async (req, res, next) => {
    try {
      const connection = await pool.promise().getConnection();
      const sql = `UPDATE products SET isDeleted = 0 WHERE id = ${req.params.id} `;
      const result = await connection.query(sql);
      connection.release();
      res.status(200).send("Products deleted");
    } catch (error) {
      next(error);
    }
  }
);

module.exports = { putProductsRouter, putDeleteRouter, putUnDeleteRouter };
