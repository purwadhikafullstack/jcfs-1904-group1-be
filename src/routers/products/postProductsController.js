const express = require("express");
const router = express.Router();
const pool = require("../../config/database");
const { uploadImage } = require("../../services/multer");

const multerUploadSingle = uploadImage.single("productPhoto");

const postUploadproductPhotoRouter = router.post(
  "/",
  multerUploadSingle,
  async (req, res, next) => {
    try {
      const connection = await pool.promise().getConnection();
      await connection.beginTransaction();
      try {
        let finalImageURL =
          req.protocol +
          "://" +
          req.get("host") +
          "/images/products/" +
          req.file.filename;

        const sqlInput = "INSERT INTO products SET ?;";

        let data = {
          productName: req.body.productName,
          productPhoto: finalImageURL,
          priceStrip: req.body.priceStrip,
          dose: req.body.dose,
          description: req.body.description,
        };

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

        const sqlInputCat = "INSERT INTO products_categories SET ?;";
        const dataCat = {
          product_id: result.insertId,
          category_id: req.body.category_id,
        };
        await connection.query(sqlInputCat, dataCat);

        const sqlInputStocks = "INSERT INTO stocks SET ?;";
        if (req.body.isLiquid == 1) {
          const dataStocks = {
            product_id: result.insertId,
            isLiquid: req.body.isLiquid,
            qtyStripTotal: req.body.qtyBottle,
            qtyStripAvailable: req.body.qtyBottle,
          };
          await connection.query(sqlInputStocks, dataStocks);
        } else {
          const dataStocks = {
            product_id: result.insertId,
            isLiquid: req.body.isLiquid,
            qtyBoxTotal: req.body.qtyBox,
            qtyBoxAvailable: req.body.qtyBox,
            qtyStripTotal: req.body.qtyStrip,
            qtyStripAvailable: req.body.qtyStrip,
            qtyPcsTotal: req.body.qtyPcs,
            qtyPcsAvailable: req.body.qtyPcs,
          };
          await connection.query(sqlInputStocks, dataStocks);
        }

        connection.commit();
        res.status(200).send({ Message: "Input Product Success" });
      } catch (error) {
        connection.rollback();
        next(error);
      }
    } catch (error) {
      next(error);
    }
  }
);

module.exports = { postUploadproductPhotoRouter };
