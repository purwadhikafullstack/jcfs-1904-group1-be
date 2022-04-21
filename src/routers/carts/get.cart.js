const pool = require("../../config/database");
const router = require("express").Router();

const getCartRouter = async (req, res, next) => {
  try {
    const connection = await pool.promise().getConnection();

    const sqlGetProducts = `select * from carts where user_id = ?`;
    const data = { user_id: req.params.id };

    const result = await connection.query(sqlGetProducts, data);
    connection.release();

    res.status(200).send({ result });
  } catch (error) {
    next(error);
  }
};

router.get("/:user_id", getCartRouter);
module.exports = { getCartRouter };
