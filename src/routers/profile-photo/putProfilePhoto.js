const express = require("express");
const router = express.Router();

const pool = require("../../config/database");
const { uploadImageAvatar } = require("../../services/multer");
const multerUploadSingle = uploadImageAvatar.single("userPhoto");

const putProfilePhoto = router.put(
  "/details/:id",
  multerUploadSingle,
  async (req, res, next) => {
    console.log(req.file);
    try {
      const connection = await pool.promise().getConnection();

      console.log(req.body);
      let finalImageURL =
        req.protocol + "://" + req.get("host") + "/avatar/" + req.file.filename;
      const sqlInput = `UPDATE users SET ? WHERE id = ${req.params.id};`;

      const dataPhoto = {
        userPhoto: finalImageURL,
      };

      const [result] = await connection.query(sqlInput, dataPhoto);
      connection.release();
      res.status(200).send({ Message: "User photo uploaded" });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = { putProfilePhoto };
