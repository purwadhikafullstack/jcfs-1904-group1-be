const express = require("express");
const router = express.Router();
const pool = require("../../config/database");
const { uploadImage } = require("../../services/multer");

const multerUploadSingle = uploadImage.single("productPhoto");
const connection = await pool.promise().getConnection();

const putProductsRouter = router.put(
  `/:id`,
  multerUploadSingle,
  async (req, res, next) => {
    try {
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
            qtyStripTotal: req.body.qtyStripTotal,
            qtyPcsTotal: req.body.qtyPcsTotal,
            qtyPcsAvailable: req.body.qtyPcsTotal,
          };
          await connection.query(sqlInputStocks, dataStocks);
        }

        if (req.body.isLiquid == 0) {
          const sqlLog = `INSERT INTO logs(product_id, user_id, description, type, amount, current_stock) values ?;`;
          if (
            req.body.qtyBoxTotal > req.body.qtyBoxCurrent ||
            req.body.qtyStripTotal > req.body.qtyStripCurrent ||
            req.body.qtyPcsTotal > req.body.qtyPcsCurrent
          ) {
            const dataLog = [
              [
                req.body.id,
                req.body.user_id,
                "Restock",
                "box",
                Math.abs(
                  parseInt(req.body.qtyBoxTotal) -
                    parseInt(req.body.qtyBoxCurrent)
                ),
                req.body.qtyBoxTotal,
              ],
              [
                req.body.id,
                req.body.user_id,
                "Restock",
                "strip",
                Math.abs(
                  parseInt(req.body.qtyStripTotal) -
                    parseInt(req.body.qtyStripCurrent)
                ),
                req.body.qtyStripTotal,
              ],
              [
                req.body.id,
                req.body.user_id,
                "Restock",
                "pcs",
                Math.abs(
                  parseInt(req.body.qtyPcsTotal) -
                    parseInt(req.body.qtyPcsCurrent)
                ),
                req.body.qtyPcsTotal,
              ],
            ];
            if (req.body.qtyBoxTotal === req.body.qtyBoxCurrent) {
              dataLog.splice(0, 1);
              if (req.body.qtyStripTotal === req.body.qtyStripCurrent) {
                dataLog.splice(0, 1);
              } else if (req.body.qtyPcsTotal === req.body.qtyPcsCurrent) {
                dataLog.splice(1, 1);
              }
            } else if (req.body.qtyStripTotal === req.body.qtyStripCurrent) {
              dataLog.splice(1, 1);
              if (req.body.qtyBoxTotal === req.body.qtyBoxCurrent) {
                dataLog.splice(0, 1);
              } else if (req.body.qtyPcsTotal === req.body.qtyPcsCurrent) {
                dataLog.splice(1, 1);
              }
            } else if (req.body.qtyPcsTotal === req.body.qtyPcsCurrent) {
              dataLog.splice(2, 1);
              if (req.body.qtyStripTotal === req.body.qtyStripCurrent) {
                dataLog.splice(1, 1);
              } else if (req.body.qtyStripTotal === req.body.qtyStripCurrent) {
                dataLog.splice(0, 1);
              }
            }

            await connection.query(sqlLog, [dataLog]);
          } else if (
            req.body.qtyBoxTotal < req.body.qtyBoxCurrent ||
            req.body.qtyStripTotal < req.body.qtyStripCurrent ||
            req.body.qtyPcsTotal < req.body.qtyPcsCurrent
          ) {
            const dataLog = [
              [
                req.body.id,
                req.body.user_id,
                "Edit Qty",
                "box",
                Math.abs(
                  parseInt(req.body.qtyBoxTotal) -
                    parseInt(req.body.qtyBoxCurrent)
                ),
                req.body.qtyBoxTotal,
              ],
              [
                req.body.id,
                req.body.user_id,
                "Edit Qty",
                "strip",
                Math.abs(
                  parseInt(req.body.qtyStripTotal) -
                    parseInt(req.body.qtyStripCurrent)
                ),
                req.body.qtyStripTotal,
              ],
              [
                req.body.id,
                req.body.user_id,
                "Edit Qty",
                "pcs",
                Math.abs(
                  parseInt(req.body.qtyPcsTotal) -
                    parseInt(req.body.qtyPcsCurrent)
                ),
                req.body.qtyPcsTotal,
              ],
            ];

            if (req.body.qtyBoxTotal === req.body.qtyBoxCurrent) {
              dataLog.splice(0, 1);
              if (req.body.qtyStripTotal === req.body.qtyStripCurrent) {
                dataLog.splice(0, 1);
              } else if (req.body.qtyPcsTotal === req.body.qtyPcsCurrent) {
                dataLog.splice(1, 1);
              }
            } else if (req.body.qtyStripTotal === req.body.qtyStripCurrent) {
              dataLog.splice(1, 1);
              if (req.body.qtyBoxTotal === req.body.qtyBoxCurrent) {
                dataLog.splice(0, 1);
              } else if (req.body.qtyPcsTotal === req.body.qtyPcsCurrent) {
                dataLog.splice(1, 1);
              }
            } else if (req.body.qtyPcsTotal === req.body.qtyPcsCurrent) {
              dataLog.splice(2, 1);
              if (req.body.qtyStripTotal === req.body.qtyStripCurrent) {
                dataLog.splice(1, 1);
              } else if (req.body.qtyStripTotal === req.body.qtyStripCurrent) {
                dataLog.splice(0, 1);
              }
            }

            await connection.query(sqlLog, [dataLog]);
          }
        } else {
          const sqlLog = `INSERT INTO logs SET ?;`;
          if (req.body.qtyBottleTotal > req.body.qtyBottleCurrent) {
            const dataLog = {
              product_id: req.body.id,
              user_id: req.body.user_id,
              description: "Restock",
              type: "bottle",
              amount: Math.abs(
                parseInt(req.body.qtyBottleTotal) -
                  parseInt(req.body.qtyBottleCurrent)
              ),
              current_stock: req.body.qtyBottleTotal,
            };

            await connection.query(sqlLog, dataLog);
          } else if (req.body.qtyBottleTotal < req.body.qtyBottleCurrent) {
            const dataLog = {
              product_id: req.body.id,
              user_id: req.body.user_id,
              description: "Edit Qty",
              type: "bottle",
              amount: Math.abs(
                parseInt(req.body.qtyBottleTotal) -
                  parseInt(req.body.qtyBottleCurrent)
              ),
              current_stock: req.body.qtyBottleTotal,
            };
            await connection.query(sqlLog, dataLog);
          }
        }

        connection.commit();
        res.status(200).send({ Message: "Update Data Successfully" });
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
    const sql = `UPDATE products SET isDeleted = 1 WHERE id = ${req.params.id} `;
    const result = await connection.query(sql);
    connection.release();
    res.status(200).send("Products deleted");
  } catch (error) {
    connection.release();
    next(error);
  }
});
const putUnDeleteRouter = router.put(
  `/:id/undelete`,
  async (req, res, next) => {
    try {
      const sql = `UPDATE products SET isDeleted = 0 WHERE id = ${req.params.id} `;
      const result = await connection.query(sql);
      connection.release();
      res.status(200).send("Products deleted");
    } catch (error) {
      connection.release();
      next(error);
    }
  }
);

module.exports = { putProductsRouter, putDeleteRouter, putUnDeleteRouter };
