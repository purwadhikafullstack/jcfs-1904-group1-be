const express = require("express");
const router = express.Router();

const pool = require("../../config/database");
const { uploadImagePayment } = require("../../services/multer");
const multerUploadSingle = uploadImagePayment.single("paymentPhoto");

const putPaymentPhotoRouter = router.put(
  "/details/:id",
  multerUploadSingle,
  async (req, res, next) => {
    console.log(req.file);
    try {
      const connection = await pool.promise().getConnection();
      await connection.beginTransaction();
      try {
        let finalImageURL =
          req.protocol +
          "://" +
          req.get("host") +
          "/images/payments/" +
          req.file.filename;
        const sqlInput = `UPDATE transactions SET ? WHERE id = ${req.params.id};`;

        const dataPhoto = {
          paymentPhoto: finalImageURL,
          status: "waiting confirmation",
        };

        const [result] = await connection.query(sqlInput, dataPhoto);
        connection.commit();
        res.status(200).send({ Message: "Payment photo uploaded" });
      } catch (error) {
        connection.rollback();
        next(error);
      }
    } catch (error) {
      next(error);
    }
  }
);

module.exports = { putPaymentPhotoRouter };
