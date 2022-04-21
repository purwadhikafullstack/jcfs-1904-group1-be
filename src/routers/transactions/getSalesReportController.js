const router = require("express").Router();
const pool = require("../../config/database");
const moment = require("moment");

const getSalesReportRouter = router.get("/revenue", async (req, res, next) => {
  try {
    const connection = await pool.promise().getConnection();

    let sqlSalesReport = `SELECT t.id, t.invoice, u.username, t.amount, t.createdAt AS date FROM transactions t
    INNER JOIN users u ON t.user_id = u.id`;

    let sqlGetRevenue = `SELECT DATE_FORMAT(createdAt, '%Y') AS filter, SUM(amount) AS amount
    FROM transactions
    GROUP BY filter`;

    let sqlGetReportCount = `SELECT COUNT(t.id) AS total 
    FROM transactions t
    INNER JOIN users u ON t.user_id = u.id`;

    if (
      req.query.initMonth &&
      req.query.initYear &&
      req.query.finalMonth &&
      req.query.finalYear
    ) {
      const dataInitSql = req.query.initYear + "-" + req.query.initMonth;
      const dataFinalSql = req.query.finalYear + "-" + req.query.finalMonth;

      sqlSalesReport += ` WHERE DATE_FORMAT(t.createdAt, "%Y-%m") >= '${dataInitSql}' AND DATE_FORMAT(t.createdAt, "%Y-%m") <= "${dataFinalSql}"
      LIMIT ${req.query.limit} OFFSET ${req.query.offSet}`;

      sqlGetRevenue = `SELECT DATE_FORMAT(createdAt, '%b %Y') AS filter, SUM(amount) AS amount
      FROM transactions
      WHERE DATE_FORMAT(createdAt, "%Y-%m") >= "${dataInitSql}" AND DATE_FORMAT(createdAt, "%Y-%m") <= "${dataFinalSql}"
      GROUP BY filter;`;

      sqlGetReportCount += ` WHERE DATE_FORMAT(t.createdAt, "%Y-%m") >= '${dataInitSql}' AND DATE_FORMAT(t.createdAt, "%Y-%m") <= "${dataFinalSql}";`;
    } else {
      sqlSalesReport += ` LIMIT ${req.query.limit} OFFSET ${req.query.offSet};`;
    }
    const [results] = await connection.query(sqlSalesReport);
    const [revByMonth] = await connection.query(sqlGetRevenue);
    const [totalCount] = await connection.query(sqlGetReportCount);

    const dataChart = revByMonth.map((data) => {
      return {
        ...data,
        amount: parseInt(data.amount),
      };
    });
    const data = results.map((result) => {
      return {
        ...result,
        date: moment(result.date).format("DD MMM YYYY"),
      };
    });

    connection.release();
    res.status(200).send({ data, dataChart, totalCount });
  } catch (error) {
    next(error);
  }
});

module.exports = {
  getSalesReportRouter,
};
