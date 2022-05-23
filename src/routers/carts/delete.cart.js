const pool = require("../../config/database");
const router = require("express").Router();

const deleteCartRouter = async (req, res, next) => {
  const connection = await pool.promise().getConnection();

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
