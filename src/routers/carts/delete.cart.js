const pool = require("../../config/database");
const router = require("express").Router();

const putCartRouter = async (req, res, next) => {
  try {
    const connection = await pool.promise().getConnection();

    const sqlPostProduct = `update carts SET ? where user_id  = ?;`;
    const data = { ...req.body, product_id: req.params.id };
    // console.log(req.body);
    const result = await connection.query(sqlPostProduct, data);

    connection.release();

    res.status(200).send({ result });
  } catch (error) {
    next(error);
  }
};

router.post("/:id", putCartRouter);

module.exports = { putCartRouter };
