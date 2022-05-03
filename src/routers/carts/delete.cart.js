const pool = require("../../config/database");
const router = require("express").Router();

const deleteCartRouter = async (req, res, next) => {
  try {
    const connection = await pool.promise().getConnection();

    const sqlDeleteCart = `delete carts where user_id = ?;`;
    const data = req.params.id;
    // console.log(req.body);
    const result = await connection.query(sqlDeleteCart, data);

    connection.release();

    res.status(200).send({ result });
  } catch (error) {
    next(error);
  }
};

router.delete("/:id", deleteCartRouter);

module.exports = router;
