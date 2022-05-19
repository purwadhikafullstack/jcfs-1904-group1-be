const router = require("express").Router();
const pool = require("../../config/database");
const moment = require("moment");
const connection = await pool.promise().getConnection();

// Get Stocks Logs
const getLogsRouter = router.get("/", async (req, res, next) => {
  try {
    let sqlGetLogs = `SELECT l.id, p.productName, u.username, l.description, l.type, l.amount, l.current_stock, l.createdAt AS date FROM logs l
    INNER JOIN products p ON l.product_id = p.id
    INNER JOIN users u ON l.user_id = u.id`;

    let sqlGetCount = `SELECT COUNT(l.id) AS total FROM logs l
        INNER JOIN products p ON l.product_id = p.id
        INNER JOIN users u ON l.user_id = u.id`;

    if (req.query.state === "prescription") {
      sqlGetLogs += ` WHERE l.description = "prescription"`;
      sqlGetCount += ` WHERE l.description = "prescription"`;
    }

    sqlGetLogs += ` ORDER BY date desc
    LIMIT ${req.query.limit} OFFSET ${req.query.offSet};`;

    const [results] = await connection.query(sqlGetLogs);
    const [totalCount] = await connection.query(sqlGetCount);

    const data = results.map((result) => {
      return {
        ...result,
        date: moment(result.date).format("DD MMM YYYY"),
      };
    });
    connection.release();
    res.status(200).send({ data, totalCount });
  } catch (error) {
    connection.release();
    next(error);
  }
});
module.exports = { getLogsRouter };
