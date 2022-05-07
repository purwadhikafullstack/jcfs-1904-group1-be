const router = require("express").Router();
const pool = require("../../config/database");
const moment = require("moment");

// Get Stocks Logs
const getLogsRouter = router.get("/", async (req, res, next) => {
  try {
    const connection = await pool.promise().getConnection();

    const sqlGetLogs = `SELECT l.id, p.productName, u.username, l.description, l.type, l.amount, l.current_stock, l.createdAt AS date FROM logs l
    INNER JOIN products p ON l.product_id = p.id
    INNER JOIN users u ON l.user_id = u.id
    ORDER BY date asc;`;
    const [results] = await connection.query(sqlGetLogs);

    const data = results.map((result) => {
      return {
        ...result,
        date: moment(result.date).format("DD MMM YYYY"),
      };
    });
    connection.release();
    res.status(200).send(data);
  } catch (error) {
    next(error);
  }
});
module.exports = { getLogsRouter };
