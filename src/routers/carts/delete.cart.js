const pool = require("../../config/database");
const router = require("express").Router();
const connection = await pool.promise().getConnection();

const deleteCartRouter = async (req, res, next) => {
  try {
    const sqlDeleteCart = `delete carts where user_id = ?;`;
    const data = req.params.id;
    const result = await connection.query(sqlDeleteCart, data);

    connection.release();

    res.status(200).send({ result });
  } catch (error) {
    connection.release();
    next(error);
  }
};

router.delete("/:id", deleteCartRouter);

module.exports = router;
